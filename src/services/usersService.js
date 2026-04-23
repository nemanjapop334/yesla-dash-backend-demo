const { pool } = require('../config/db');

async function getUsers() {
    const { rows } = await pool.query(`
        SELECT
            u.id,
            u.email,
            u.full_name,
            u.phone,
            u.created_at,
            u.user_reference,
            u.has_completed_onboarding,
            u.is_anonymized,
            COALESCE(ct.has_card, false) AS has_card
        FROM "user".users u
        LEFT JOIN (
            SELECT
                user_id,
                COUNT(*) > 0 AS has_card
            FROM core.card_tokens
            WHERE time_deleted IS NULL
            GROUP BY user_id
        ) ct ON ct.user_id = u.id
        ORDER BY id DESC
    `);

    return rows.map((r) => ({
        id: r.id,
        email: r.email,
        fullName: r.full_name,
        phone: r.phone,
        createdAt: r.created_at,
        userReference: r.user_reference,
        hasCompletedOnboarding: r.has_completed_onboarding,
        isAnonymized: r.is_anonymized,
        hasCard: r.has_card,
    }));
}

module.exports = { getUsers };
