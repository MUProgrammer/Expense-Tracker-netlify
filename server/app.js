require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// har request se pehle database connected hona chahiye
app.use('/api', async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (e) {
    console.error('MongoDB connect nahi hua:', e.message);
    res.status(500).json({ message: 'Database se connect nahi ho paya' });
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/transactions', require('./routes/transactions'));

app.use('/api', (_req, res) => res.status(404).json({ message: 'Route nahi mila' }));

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.code === 11000) return res.status(409).json({ message: 'Yeh email pehle se maujood hai' });
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  res.status(500).json({ message: 'Server mein masla aa gaya' });
});

module.exports = app;
