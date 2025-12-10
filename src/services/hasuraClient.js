// src/services/hasuraClient.js
const axios = require('axios');

const HASURA_URL = process.env.HASURA_URL;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

async function hasuraQuery(query, variables = {}) {
    const res = await axios.post(
        HASURA_URL,
        { query, variables },
        {
            headers: {
                'Content-Type': 'application/json',
                'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
            },
        }
    );

    if (res.data.errors) {
        console.error('Hasura error:', res.data.errors);
        throw new Error(res.data.errors[0].message || 'Hasura query error');
    }

    return res.data.data;
}

module.exports = { hasuraQuery };
