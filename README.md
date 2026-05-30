# 🛡️ Agentic AI Fraud Coin Detector

A full-stack web application that detects potentially fraudulent ERC-20 cryptocurrency tokens by analyzing smart contract source code using AI.

Enter an Ethereum contract address → the app fetches its source code from Etherscan → an AI agent analyzes it for fraud patterns → you get a clear risk assessment.

---

## ✨ Features

- **Smart Contract Analysis**: Fetches and analyzes verified Solidity source code from Etherscan
- **AI-Powered Fraud Detection**: Uses Google Gemini AI as an agentic smart contract auditor
- **Risk Scoring**: Color-coded risk levels (Safe → Warning → High Risk → Critical)
- **Detailed Findings**: Individual vulnerability cards with severity ratings
- **Beautiful Dashboard**: Dark-themed glassmorphic UI with smooth animations
- **Example Contracts**: Quick-access buttons for popular tokens (USDT, USDC, WETH)

## 🔍 What It Detects

| Fraud Pattern | Description |
|---|---|
| 🍯 Honeypots | Contracts that prevent selling tokens |
| 🖨️ Hidden Minting | Owner can mint unlimited tokens |
| ⏸️ Pausable Trading | Owner can freeze all transfers |
| 💰 High Tax Rates | Excessive buy/sell fees (rug pull setup) |
| 🔒 Blacklist Functions | Owner can block specific wallets |
| 🚪 Backdoor Withdrawals | Owner can drain contract funds |
| 🔄 Proxy Manipulation | Upgradeable contracts that can change logic |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), Tailwind CSS v4 |
| Backend | Node.js, Express.js |
| AI Engine | Google Gemini 2.5 Flash |
| Blockchain Data | Etherscan API v2 |
| HTTP Client | Axios |

---

## 📁 Project Structure

```
fraud-coin-detector/
├── frontend/                 # React (Vite) Frontend
│   ├── src/
│   │   ├── components/       # SearchBar, AnalysisReport, Loader
│   │   ├── services/         # api.js (Axios calls to backend)
│   │   ├── App.jsx           # Main application
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Tailwind + custom design system
│   ├── package.json
│   └── vite.config.js
├── backend/                  # Node.js & Express Backend
│   ├── controllers/          # analysisController.js
│   ├── routes/               # apiRoutes.js
│   ├── services/
│   │   ├── etherscan.js      # Etherscan API integration
│   │   └── aiAgent.js        # Gemini AI agent logic
│   ├── .env                  # Environment variables
│   ├── server.js             # Express server
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher
- An [Etherscan API Key](https://etherscan.io/apis) (free)
- A [Google Gemini API Key](https://aistudio.google.com/apikey) (free)

### 1. Clone & Configure

```bash
cd fraud-coin-detector
```

Edit `backend/.env` and add your API keys:

```env
PORT=5000
ETHERSCAN_API_KEY=your_etherscan_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Start the Backend

```bash
cd backend
npm install
npm start
```

The backend server will start on `http://localhost:5000`.

### 3. Start the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server will start on `http://localhost:5173`.

### 4. Use the App

1. Open `http://localhost:5173` in your browser
2. Enter an Ethereum contract address (or click an example)
3. Click **Analyze Contract**
4. Wait for the AI agent to complete its analysis
5. Review the risk score, findings, and recommendations

### Example Addresses to Try

| Token | Address |
|---|---|
| USDT (Tether) | `0xdAC17F958D2ee523a2206206994597C13D831ec7` |
| USDC (Circle) | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` |
| WETH (Wrapped Ether) | `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` |

---

## 📡 API Reference

### POST `/api/analyze`

Analyzes an Ethereum smart contract for fraud patterns.

**Request Body:**
```json
{
  "contractAddress": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "contractAddress": "0x...",
    "contractInfo": {
      "name": "TetherToken",
      "compiler": "v0.4.18+commit.9cf6e910",
      "tokenSupply": "39823315085891886"
    },
    "analysis": {
      "riskLevel": "Warning",
      "riskScore": 35,
      "summary": "The contract has some centralization concerns...",
      "findings": [
        {
          "title": "Pausable Transfers",
          "severity": "Medium",
          "description": "The owner can pause all token transfers..."
        }
      ],
      "recommendations": [
        "Review the pause functionality before investing"
      ]
    }
  }
}
```

---

## ⚠️ Disclaimer

This tool is for **educational and research purposes only**. The AI analysis is not financial advice. Always do your own research (DYOR) before investing in any cryptocurrency. The risk scores are AI-generated estimates and may not capture all vulnerabilities.

---

## 📄 License

MIT License — feel free to use, modify, and distribute.
