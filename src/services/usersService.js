const { pool } = require('../config/db');

async function getUsers() {
    const { rows } = await pool.query(`
        SELECT
            id,
            email,
            full_name,
            phone,
            created_at,
            user_reference,
            has_completed_onboarding,
            is_anonymized
        FROM "user".users
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
    }));
}

module.exports = { getUsers };
