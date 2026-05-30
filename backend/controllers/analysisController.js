const { getContractSourceCode, getTokenSupply, getRecentTransactions, getTransactionByHash } = require('../services/etherscan');
const { analyzeWithAI } = require('../services/aiAgent');

/**
 * Validate that the provided string is a valid Ethereum address (42 chars).
 */
function isValidAddress(input) {
  return /^0x[0-9a-fA-F]{40}$/.test(input);
}

/**
 * Validate that the provided string is a valid transaction hash (66 chars).
 */
function isValidTxHash(input) {
  return /^0x[0-9a-fA-F]{64}$/.test(input);
}

/**
 * POST /api/analyze
 * Analyzes a smart contract address or transaction hash for potential fraud patterns.
 * Accepts both contract addresses (42 chars) and transaction hashes (66 chars).
 */
const analyzeContract = async (req, res) => {
  try {
    const input = (req.body.contractAddress || req.body.address || '').trim();

    // Validate input
    if (!input) {
      return res.status(400).json({ error: 'Contract address or transaction hash is required.' });
    }

    let address = input;
    let txInfo = null;

    // Detect if input is a transaction hash (66 chars) vs contract address (42 chars)
    if (isValidTxHash(input)) {
      console.log(`Looking up transaction: ${input}`);

      // Fetch the transaction to extract the contract address
      const tx = await getTransactionByHash(input);
      if (!tx) {
        return res.status(404).json({
          error: 'Transaction not found on Etherscan.',
          input,
        });
      }

      if (!tx.to) {
        return res.status(400).json({
          error: 'This transaction is a contract creation transaction and does not interact with an existing contract.',
          input,
        });
      }

      // Use the "to" address as the contract to analyze
      address = tx.to;
      txInfo = {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        inputData: tx.input,
      };

      console.log(`Transaction resolves to contract: ${address}`);
    } else if (!isValidAddress(input)) {
      return res.status(400).json({
        error: 'Invalid input. Please enter a valid Ethereum contract address (42 chars starting with 0x) or a transaction hash (66 chars starting with 0x).',
      });
    }

    console.log(`Analyzing contract: ${address}`);

    // Fetch data from Etherscan in parallel
    const [sourceCodeData, tokenSupplyData, transactionsData] = await Promise.allSettled([
      getContractSourceCode(address),
      getTokenSupply(address),
      getRecentTransactions(address),
    ]);

    const sourceCode = sourceCodeData.status === 'fulfilled' ? sourceCodeData.value : null;
    const tokenSupply = tokenSupplyData.status === 'fulfilled' ? tokenSupplyData.value : null;
    const transactions = transactionsData.status === 'fulfilled' ? transactionsData.value : null;

    // Check if we got source code to analyze
    if (!sourceCode || !sourceCode.SourceCode) {
      let errorMsg = 'Contract source code not found or not verified on Etherscan.';

      if (txInfo) {
        // Check if input field (data) is empty meaning it's a simple ETH transfer
        const isSimpleTransfer = !txInfo.inputData || txInfo.inputData === '0x';
        if (isSimpleTransfer) {
          errorMsg = `This transaction is a simple ETH transfer to address ${address}. The recipient is a regular wallet (EOA), not a smart contract. Only smart contracts with verified source code can be analyzed for fraud. Try entering a token contract address instead (e.g., from CoinGecko or Etherscan token page).`;
        } else {
          errorMsg = `Transaction resolved to contract ${address}, but its source code is not verified on Etherscan. Only verified contracts can be analyzed. You can check this address on Etherscan to see if it's a proxy or unverified contract.`;
        }
      }

      return res.status(404).json({
        error: errorMsg,
        address,
        ...(txInfo && { transaction: txInfo }),
      });
    }

    // Run AI analysis
    const aiAnalysis = await analyzeWithAI({
      address,
      sourceCode,
      tokenSupply,
      transactions,
    });

    // Return combined result
    return res.json({
      success: true,
      address,
      ...(txInfo && { transaction: txInfo }),
      etherscanData: {
        contractName: sourceCode.ContractName || 'Unknown',
        compiler: sourceCode.CompilerVersion || 'Unknown',
        optimizationUsed: sourceCode.OptimizationUsed || 'Unknown',
        sourceCodeAvailable: !!sourceCode.SourceCode,
        tokenSupply: tokenSupply || 'N/A',
        recentTransactions: transactions || [],
      },
      aiAnalysis,
    });
  } catch (error) {
    console.error('Analysis error:', error.message || error);
    return res.status(500).json({
      error: 'An error occurred while analyzing the contract.',
      details: error.message || 'Unknown error',
    });
  }
};

module.exports = { analyzeContract };
