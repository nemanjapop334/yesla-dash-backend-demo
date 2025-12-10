// src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const chargersRouter = require('./src/routes/chargers');
const transactionsRouter = require('./src/routes/transactions');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'EV admin backend running' });
});

app.use('/api/chargers', chargersRouter);
app.use('/api/transactions', transactionsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
