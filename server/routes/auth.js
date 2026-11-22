const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

const sign = (user) =>
  jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '30d' });

const DEFAULT_ACCOUNTS = ['Wallet (Cash)', 'Bank Account', 'JazzCash / Easypaisa'];

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!name) return res.status(400).json({ message: 'Enter your name' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (await User.findOne({ email }))
      return res.status(409).json({ message: 'This email is already registered' });

    const user = await User.create({ name, email, password });
    await Account.insertMany(DEFAULT_ACCOUNTS.map((n) => ({ user: user._id, name: n, start: 0 })));

    res.status(201).json({ token: sign(user), user: user.toPublic() });
  } catch (e) {
    next(e);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Wrong email or password' });
    res.json({ token: sign(user), user: user.toPublic() });
  } catch (e) {
    next(e);
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: 'User nahi mila' });
    res.json({ user: user.toPublic() });
  } catch (e) {
    next(e);
  }
});

// PATCH /api/auth/theme
router.patch('/theme', auth, async (req, res, next) => {
  try {
    const { theme } = req.body;
    if (!User.THEMES.includes(theme)) return res.status(400).json({ message: 'Invalid theme' });
    const user = await User.findByIdAndUpdate(req.userId, { theme }, { new: true });
    res.json({ user: user.toPublic() });
  } catch (e) {
    next(e);
  }
});

// PATCH /api/auth/profile   { name, email }
router.patch('/profile', auth, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!name) return res.status(400).json({ message: 'Enter your name' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email' });
    if (await User.findOne({ email, _id: { $ne: req.userId } }))
      return res.status(409).json({ message: 'This email is already registered' });
    const user = await User.findByIdAndUpdate(req.userId, { name, email }, { new: true });
    res.json({ user: user.toPublic() });
  } catch (e) {
    next(e);
  }
});

// PATCH /api/auth/password   { currentPassword, newPassword }
router.patch('/password', auth, async (req, res, next) => {
  try {
    const currentPassword = String(req.body.currentPassword || '');
    const newPassword = String(req.body.newPassword || '');
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: 'User nahi mila' });
    if (!(await user.matchPassword(currentPassword)))
      return res.status(400).json({ message: 'Current password galat hai' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password kam az kam 6 characters ka ho' });
    user.password = newPassword; // pre-save hook hash kar deta hai
    await user.save();
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// DELETE /api/auth/me   { password }  -> account aur saara data delete
router.delete('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: 'User nahi mila' });
    if (!(await user.matchPassword(String(req.body.password || ''))))
      return res.status(400).json({ message: 'Password galat hai' });
    await Transaction.deleteMany({ user: user._id });
    await Account.deleteMany({ user: user._id });
    await user.deleteOne();
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
