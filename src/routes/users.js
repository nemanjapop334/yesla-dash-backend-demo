const express = require('express');
const router = express.Router();

const { getUsers } = require('../services/usersService');

// GET /api/users
router.get('/', async (req, res) => {
    try {
        const users = await getUsers();
        return res.status(200).json({ users });
    } catch (err) {
        console.error('Error fetching users:', err.message);
        return res.status(500).json({ error: 'Failed to fetch users' });
    }
});

module.exports = router;
