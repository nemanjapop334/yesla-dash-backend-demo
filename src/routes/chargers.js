// src/routes/chargers.js
const express = require('express');
const router = express.Router();
const { getChargers, startCharging } = require('../services/chargersService');

// GET /api/chargers
router.get('/', async (req, res) => {
    try {
        const chargers = await getChargers();
        res.json(chargers);
    } catch (err) {
        console.error('Error fetching chargers:', err.message);
        res.status(500).json({ error: 'Failed to fetch chargers' });
    }
});

// POST /api/chargers/:connectorId/start
router.post('/:connectorId/start', async (req, res) => {
    const { connectorId } = req.params;

    try {
        const result = await startCharging(connectorId);
        res.json(result);
    } catch (err) {
        console.error('Error starting charging:', err.message);
        res.status(500).json({ error: 'Failed to start charging' });
    }
});

module.exports = router;
