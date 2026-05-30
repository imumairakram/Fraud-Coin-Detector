const axios = require('axios');

const ETHERSCAN_BASE_URL = 'https://api.etherscan.io/v2/api';
const CHAIN_ID = 1; // Ethereum Mainnet

/**
 * Helper to make requests to the Etherscan V2 API.
 */
async function etherscanRequest(params) {
  const response = await axios.get(ETHERSCAN_BASE_URL, {
    params: {
      chainid: CHAIN_ID,
      apikey: process.env.ETHERSCAN_API_KEY,
      ...params,
    },
  });

  if (response.data.status === '0' && response.data.message === 'NOTOK') {
    throw new Error(`Etherscan API error: ${response.data.result}`);
  }

  return response.data;
}

/**
 * Fetch the verified source code, ABI, contract name, and compiler version
 * for a given contract address.
 */
async function getContractSourceCode(address) {
  const data = await etherscanRequest({
    module: 'contract',
    action: 'getsourcecode',
    address,
  });

  if (!data.result || data.result.length === 0) {
    return null;
  }

  const contract = data.result[0];
  return {
    SourceCode: contract.SourceCode || '',
    ABI: contract.ABI || '',
    ContractName: contract.ContractName || '',
    CompilerVersion: contract.CompilerVersion || '',
    OptimizationUsed: contract.OptimizationUsed || '',
    Runs: contract.Runs || '',
    EVMVersion: contract.EVMVersion || '',
    Library: contract.Library || '',
    LicenseType: contract.LicenseType || '',
    Proxy: contract.Proxy || '',
    Implementation: contract.Implementation || '',
  };
}

/**
 * Fetch the total token supply for a given contract address.
 * NOTE: Uses `contractaddress` param, not `address`.
 */
async function getTokenSupply(address) {
  const data = await etherscanRequest({
    module: 'stats',
    action: 'tokensupply',
    contractaddress: address,
  });

  return data.result || null;
}

/**
 * Fetch the 10 most recent transactions for a given address.
 */
async function getRecentTransactions(address) {
  const data = await etherscanRequest({
    module: 'account',
    action: 'txlist',
    address,
    sort: 'desc',
    offset: 10,
    page: 1,
    startblock: 0,
    endblock: 99999999,
  });

  if (!Array.isArray(data.result)) {
    return [];
  }

  return data.result.map((tx) => ({
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    value: tx.value,
    gas: tx.gas,
    gasUsed: tx.gasUsed,
    blockNumber: tx.blockNumber,
    timeStamp: tx.timeStamp,
    functionName: tx.functionName || '',
    isError: tx.isError,
  }));
}

/**
 * Fetch transaction details by transaction hash.
 * Uses the proxy module to get the full transaction object.
 */
async function getTransactionByHash(txHash) {
  const data = await etherscanRequest({
    module: 'proxy',
    action: 'eth_getTransactionByHash',
    txhash: txHash,
  });

  if (!data.result) {
    return null;
  }

  return {
    hash: data.result.hash,
    from: data.result.from,
    to: data.result.to,
    value: data.result.value,
    blockNumber: data.result.blockNumber,
    input: data.result.input,
  };
}

module.exports = {
  getContractSourceCode,
  getTokenSupply,
  getRecentTransactions,
  getTransactionByHash,
};
