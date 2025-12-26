// src/routes/transactions.js
const express = require('express');
const router = express.Router();
const { getTransactions } = require('../services/transactionsService');


/**
 * Računa vreme punjenja u minutima.
 * Svaki započeti minut se računa kao ceo (ceil).
 *
 * @param {string|Date|null} startTimestamp
 * @param {string|Date|null} stopTimestamp
 * @returns {number|null} vreme u minutima ili null ako nema podataka
 */
function calculateTimeSpentCharging(startTimestamp, stopTimestamp) {
    if (!startTimestamp || !stopTimestamp) {
        return null;
    }

    const start = new Date(startTimestamp);
    const stop = new Date(stopTimestamp);

    const diffMs = stop.getTime() - start.getTime();

    if (diffMs <= 0) {
        return 0;
    }

    const diffMinutes = diffMs / (1000 * 60);

    return Math.ceil(diffMinutes);
}


function mapTransaction(row) {

    const startTimestamp = row.StartTransaction?.timestamp ?? null;
    const stopTimestamp = row.StopTransaction?.timestamp ?? null;

    return {
        // Osnovno o transakciji
        id: row.id,
        transactionId: row.transactionId,
        isActive: row.isActive,
        chargingState: row.chargingState,

        timeSpentCharging: calculateTimeSpentCharging(
            startTimestamp,
            stopTimestamp
        ),

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
        startTimestamp,
        meterStart: row.StartTransaction?.meterStart ?? null,

        // StopTransaction
        stopTransactionId: row.StopTransaction?.id ?? null,
        stopTimestamp,

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

        return res.status(200).json({ transactions });
    } catch (err) {
        console.error('Error fetching transactions:', err.message);
        return res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});


module.exports = router;
