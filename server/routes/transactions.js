const express = require('express');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

const CATS_OUT = ['Food', 'Transport', 'Bills', 'Shopping', 'Health', 'Education', 'Rent', 'Other'];
const CATS_IN = ['Salary', 'Gift', 'Business', 'Other'];

// GET /api/transactions
router.get('/', async (req, res, next) => {
  try {
    res.json(await Transaction.find({ user: req.userId }).sort({ date: -1, createdAt: -1 }));
  } catch (e) {
    next(e);
  }
});

// POST /api/transactions
router.post('/', async (req, res, next) => {
  try {
    const { type, acc, to, cat, note, date } = req.body;
    const amt = Number(req.body.amt);

    if (!['expense', 'income', 'transfer'].includes(type))
      return res.status(400).json({ message: 'Invalid type' });
    if (!(amt > 0)) return res.status(400).json({ message: 'Enter an amount greater than 0.' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || ''))
      return res.status(400).json({ message: 'Date YYYY-MM-DD format mein chahiye' });
    if (!mongoose.isValidObjectId(acc)) return res.status(400).json({ message: 'Account chunein' });

    const ids = [acc];
    if (type === 'transfer') {
      if (!mongoose.isValidObjectId(to)) return res.status(400).json({ message: 'To account chunein' });
      if (String(acc) === String(to))
        return res.status(400).json({ message: 'Pick two different accounts.' });
      ids.push(to);
    } else {
      const allowed = type === 'expense' ? CATS_OUT : CATS_IN;
      if (!allowed.includes(cat)) return res.status(400).json({ message: 'Invalid category' });
    }

    // dono accounts isi user ke hone chahiye
    const owned = await Account.countDocuments({ _id: { $in: ids }, user: req.userId });
    if (owned !== ids.length) return res.status(400).json({ message: 'Account nahi mila' });

    const tx = await Transaction.create({
      user: req.userId,
      type,
      amt,
      acc,
      to: type === 'transfer' ? to : null,
      cat: type === 'transfer' ? '' : cat,
      note: String(note || '').trim(),
      date,
    });
    res.status(201).json(tx);
  } catch (e) {
    next(e);
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid id' });
    const tx = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!tx) return res.status(404).json({ message: 'Transaction nahi mili' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
