const express = require('express');
const router = express.Router();
const { analyzeContract } = require('../controllers/analysisController');

// POST /api/analyze - Analyze a smart contract for fraud patterns
router.post('/analyze', analyzeContract);

module.exports = router;
