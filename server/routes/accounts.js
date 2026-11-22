const express = require('express');
const mongoose = require('mongoose');
const Account = require('../models/Account');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// GET /api/accounts
router.get('/', async (req, res, next) => {
  try {
    res.json(await Account.find({ user: req.userId }).sort({ createdAt: 1 }));
  } catch (e) {
    next(e);
  }
});

// POST /api/accounts   { name, start }
router.post('/', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const start = Number(req.body.start) || 0;
    if (!name) return res.status(400).json({ message: 'Account ka naam likhein' });
    const acc = await Account.create({ user: req.userId, name, start });
    res.status(201).json(acc);
  } catch (e) {
    next(e);
  }
});

// PATCH /api/accounts/:id   { start?, name? }
router.patch('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid id' });
    const update = {};
    if (req.body.start !== undefined) {
      const s = Number(req.body.start);
      if (Number.isNaN(s)) return res.status(400).json({ message: 'Balance number hona chahiye' });
      update.start = s;
    }
    if (req.body.name !== undefined) {
      const n = String(req.body.name).trim();
      if (!n) return res.status(400).json({ message: 'Naam khali nahi ho sakta' });
      update.name = n;
    }
    const acc = await Account.findOneAndUpdate({ _id: req.params.id, user: req.userId }, update, {
      new: true,
    });
    if (!acc) return res.status(404).json({ message: 'Account nahi mila' });
    res.json(acc);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
