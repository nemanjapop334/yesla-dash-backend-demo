// src/routes/transactions.js
const express = require('express');
const router = express.Router();

const { getTransactions } = require('../services/transactionsService');
const { pool } = require('../config/db'); // <- prilagodi putanju ako ti je drugačije

/**
 * Računa vreme punjenja u minutima.
 * Svaki započeti minut se računa kao ceo (ceil).
 *
 * @param {string|Date|null} startTimestamp
 * @param {string|Date|null} stopTimestamp
 * @returns {number|null} vreme u minutima ili null ako nema podataka
 */
function calculateTimeSpentCharging(startTimestamp, stopTimestamp) {
    if (!startTimestamp || !stopTimestamp) return null;

    const start = new Date(startTimestamp);
    const stop = new Date(stopTimestamp);

    const diffMs = stop.getTime() - start.getTime();
    if (diffMs <= 0) return 0;

    const diffMinutes = diffMs / (1000 * 60);
    return Math.ceil(diffMinutes);
}

/**
 * Učita email korisnika i (ako postoji) aktivnu kompaniju (name/pib/mb) za listu userId-eva.
 * Pretpostavka: idToken = userId (kao što si napisao).
 *
 * @param {number[]} userIds
 * @returns {Promise<Map<number, object>>} Map userId -> { email, company_* ... }
 */
async function fetchUserExtrasMap(userIds) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
        return new Map();
    }

    const { rows } = await pool.query(
        `
    SELECT
      u.id AS user_id,
      u.email,

      cu.company_id,
      cu.billing_mode,

      c.name AS company_name,
      c.pib  AS company_pib,
      c.mb   AS company_mb

    FROM "user".users u
    LEFT JOIN "user".company_users cu
      ON cu.user_id = u.id
     AND cu.active = true
    LEFT JOIN "user".companies c
      ON c.id = cu.company_id
     AND c.is_active = true
    WHERE u.id = ANY($1::int[])
    `,
        [userIds]
    );

    // Ako user može da pripada više kompanija, ovde zadržavamo prvu (aktivnu) koju dobijemo.
    const map = new Map();
    for (const r of rows) {
        if (!map.has(r.user_id)) map.set(r.user_id, r);
    }
    return map;
}

function mapTransaction(row, userInfoByUserId) {
    const startTimestamp = row.StartTransaction?.timestamp ?? null;
    const stopTimestamp = row.StopTransaction?.timestamp ?? null;

    const idToken = row.StartTransaction?.IdToken?.idToken ?? null;

    // Pošto je idToken = userId, parsiramo ga u int
    const userId = Number.parseInt(String(idToken ?? ''), 10);
    const extra = Number.isNaN(userId) ? null : (userInfoByUserId.get(userId) ?? null);

    return {
        // Osnovno o transakciji
        id: row.id,
        transactionId: row.transactionId,
        isActive: row.isActive,
        chargingState: row.chargingState,

        timeSpentCharging: calculateTimeSpentCharging(startTimestamp, stopTimestamp),

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
        idToken,
        idTokenType: row.StartTransaction?.IdToken?.type ?? null,

        // ✅ DODATO: user email + company (ako je kompanijski)
        userEmail: extra?.email ?? null,
        company: extra?.company_id
            ? {
                id: extra.company_id,
                name: extra.company_name ?? null,
                pib: extra.company_pib ?? null,
                mb: extra.company_mb ?? null,
                billingMode: extra.billing_mode ?? null,
            }
            : null,
    };
}

// GET /api/transactions
router.get('/', async (req, res) => {
    try {
        const rows = await getTransactions();

        if (!Array.isArray(rows) || rows.length === 0) {
            return res.status(200).json({ transactions: [] });
        }

        // 1) Izvuci unique userId-eve iz idToken-a (idToken = userId)
        const userIds = Array.from(
            new Set(
                rows
                    .map(r => r.StartTransaction?.IdToken?.idToken)
                    .map(v => Number.parseInt(String(v ?? ''), 10))
                    .filter(n => Number.isFinite(n))
            )
        );

        // 2) Jedan SQL upit za sve userId-eve
        const userInfoByUserId = await fetchUserExtrasMap(userIds);

        // 3) Mapiranje transakcija + dodavanje extra info
        const transactions = rows.map(row => mapTransaction(row, userInfoByUserId));

        return res.status(200).json({ transactions });
    } catch (err) {
        console.error('Error fetching transactions:', err.message);
        return res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

module.exports = router;
