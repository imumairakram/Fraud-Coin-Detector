const { GoogleGenAI, Type } = require('@google/genai');

/**
 * Create the Google GenAI client.
 */
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables.');
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Define the structured response schema for the AI analysis.
 */
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    riskLevel: {
      type: Type.STRING,
      description: 'Overall risk classification',
      enum: ['Safe', 'Warning', 'High Risk', 'Critical'],
    },
    riskScore: {
      type: Type.NUMBER,
      description: 'Numerical risk score from 0 (safe) to 100 (critical)',
    },
    summary: {
      type: Type.STRING,
      description: 'A concise summary of the overall analysis findings',
    },
    findings: {
      type: Type.ARRAY,
      description: 'List of specific findings from the analysis',
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: 'Short title of the finding',
          },
          severity: {
            type: Type.STRING,
            description: 'Severity level of this finding',
            enum: ['Info', 'Low', 'Medium', 'High', 'Critical'],
          },
          description: {
            type: Type.STRING,
            description: 'Detailed description of the finding and its implications',
          },
        },
        required: ['title', 'severity', 'description'],
      },
    },
    contractInfo: {
      type: Type.OBJECT,
      description: 'Extracted information about the contract',
      properties: {
        tokenName: {
          type: Type.STRING,
          description: 'Name of the token if identifiable',
        },
        tokenSymbol: {
          type: Type.STRING,
          description: 'Symbol of the token if identifiable',
        },
        hasProxy: {
          type: Type.BOOLEAN,
          description: 'Whether the contract uses a proxy pattern',
        },
        hasMintFunction: {
          type: Type.BOOLEAN,
          description: 'Whether the contract has minting capabilities',
        },
        hasPauseFunction: {
          type: Type.BOOLEAN,
          description: 'Whether the contract can be paused',
        },
        hasBlacklist: {
          type: Type.BOOLEAN,
          description: 'Whether the contract has blacklisting functionality',
        },
        ownerPrivileges: {
          type: Type.STRING,
          description: 'Summary of special owner/admin privileges',
        },
      },
      required: [
        'tokenName',
        'tokenSymbol',
        'hasProxy',
        'hasMintFunction',
        'hasPauseFunction',
        'hasBlacklist',
        'ownerPrivileges',
      ],
    },
    recommendations: {
      type: Type.ARRAY,
      description: 'List of recommendations for the user',
      items: {
        type: Type.STRING,
      },
    },
  },
  required: ['riskLevel', 'riskScore', 'summary', 'findings', 'contractInfo', 'recommendations'],
};

/**
 * Build the analysis prompt from the collected contract data.
 */
function buildPrompt({ address, sourceCode, tokenSupply, transactions }) {
  const systemInstruction = `You are an expert smart contract security auditor and fraud detection AI agent. 
Your task is to analyze Solidity smart contract source code and on-chain data to detect potential fraud patterns, scams, and security vulnerabilities.

You must look for the following fraud patterns and red flags:
1. **Honeypot mechanisms**: Code that allows buying but prevents selling (e.g., transfer restrictions, blacklists on sellers, max transaction limits that block sells).
2. **Hidden mint functions**: Functions that can create unlimited tokens, often disguised with misleading names.
3. **Pausable trading**: Owner ability to pause or freeze all trading, which can be used to trap investors.
4. **High or modifiable tax/fee rates**: Transaction taxes that can be set to extremely high values (e.g., 90-100%), effectively stealing funds.
5. **Owner-only drain functions**: Functions that let the owner withdraw all tokens or ETH from the contract or liquidity pool.
6. **Proxy manipulation**: Upgradeable proxy patterns that could allow the contract logic to be swapped maliciously.
7. **Hidden owner privileges**: Disguised functions that grant excessive control to specific addresses.
8. **Whitelist/Blacklist abuse**: Mechanisms that can selectively prevent addresses from trading.
9. **Liquidity removal risks**: Whether the owner can remove liquidity without restrictions.
10. **Reentrancy vulnerabilities**: Code patterns susceptible to reentrancy attacks.
11. **Fake renouncement**: Patterns where ownership appears renounced but hidden backdoors remain.
12. **External call risks**: Dangerous external calls that could be exploited.

Analyze the provided data thoroughly and provide your assessment in the structured format requested.
Be specific in your findings - reference actual function names and code patterns you observe.
If the source code is obfuscated or unusually complex, flag that as a risk factor.`;

  let userPrompt = `Analyze the following Ethereum smart contract for fraud and security risks.

**Contract Address:** ${address}
**Contract Name:** ${sourceCode.ContractName || 'Unknown'}
**Compiler Version:** ${sourceCode.CompilerVersion || 'Unknown'}

**Source Code:**
\`\`\`solidity
${sourceCode.SourceCode || 'Source code not available'}
\`\`\`
`;

  if (sourceCode.ABI && sourceCode.ABI !== 'Contract source code not verified') {
    userPrompt += `\n**Contract ABI (for reference):**\n${sourceCode.ABI}\n`;
  }

  if (tokenSupply) {
    userPrompt += `\n**Total Token Supply:** ${tokenSupply}\n`;
  }

  if (transactions && transactions.length > 0) {
    userPrompt += `\n**Recent Transactions (last ${transactions.length}):**\n`;
    transactions.forEach((tx, i) => {
      userPrompt += `${i + 1}. Hash: ${tx.hash}, From: ${tx.from}, To: ${tx.to}, Value: ${tx.value} wei, Function: ${tx.functionName || 'N/A'}, Error: ${tx.isError === '1' ? 'Yes' : 'No'}\n`;
    });
  }

  userPrompt += `\nProvide a thorough security audit and fraud risk assessment.`;

  return { systemInstruction, userPrompt };
}

/**
 * Analyze contract data using Gemini AI with structured JSON output.
 */
async function analyzeWithAI(contractData) {
  const ai = getAIClient();
  const { systemInstruction, userPrompt } = buildPrompt(contractData);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema,
      },
    });

    const text = response.text;
    const parsed = JSON.parse(text);
    return parsed;
  } catch (error) {
    console.error('AI analysis error:', error.message || error);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}

module.exports = { analyzeWithAI };
