// src/routes/transactions.js
const express = require('express');
const router = express.Router();
const { getTransactions, stopTransaction } = require('../services/transactionsService');

function mapTransaction(row) {
    return {
        // Osnovno o transakciji
        id: row.id,
        transactionId: row.transactionId,
        isActive: row.isActive,
        chargingState: row.chargingState,
        timeSpentCharging: row.timeSpentCharging,
        totalKwh: row.totalKwh,
        stoppedReason: row.stoppedReason,
        totalCost: row.totalCost,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,

        // Stanica / lokacija
        stationId: row.stationId,
        chargingStationId: row.ChargingStation?.id ?? null,
        locationId: row.ChargingStation?.locationId ?? null,
        locationName: row.ChargingStation?.Location?.name ?? null,
        locationAddress: row.ChargingStation?.Location?.address ?? null,
        locationCity: row.ChargingStation?.Location?.city ?? null,

        // StartTransaction
        startTransactionId: row.StartTransaction?.id ?? null,
        startTimestamp: row.StartTransaction?.timestamp ?? null,
        meterStart: row.StartTransaction?.meterStart ?? null,

        // Connector
        connectorId: row.StartTransaction?.Connector?.connectorId ?? null,

        // IdToken
        idToken: row.StartTransaction?.IdToken?.idToken ?? null,
        idTokenType: row.StartTransaction?.IdToken?.type ?? null,
    };
}


// GET /api/transactions
router.get('/', async (req, res) => {
    try {
        const rows = await getTransactions();

        if (!Array.isArray(rows) || rows.length === 0) {
            return res.status(200).json({ transactions: [] });
        }

        const transactions = rows.map(mapTransaction);
        console.log(transactions)
        return res.status(200).json({ transactions });
    } catch (err) {
        console.error('Error fetching transactions:', err.message);
        return res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// POST /api/transactions/:transactionId/stop
router.post('/:transactionId/stop', async (req, res) => {
    const { transactionId } = req.params;
    const { identifier } = req.body;

    try {
        const result = await stopTransaction(transactionId, identifier);
        res.json(result);
    } catch (err) {
        console.error('Error stopping transaction:', err.message);
        res.status(500).json({ error: 'Failed to stop transaction' });
    }
});

module.exports = router;
