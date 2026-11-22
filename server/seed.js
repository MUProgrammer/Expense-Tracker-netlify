// Demo data: npm run seed  ->  demo@kharcha.pk / demo123
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Account = require('./models/Account');
const Transaction = require('./models/Transaction');

const ds = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const old = await User.findOne({ email: 'demo@kharcha.pk' });
  if (old) {
    await Transaction.deleteMany({ user: old._id });
    await Account.deleteMany({ user: old._id });
    await old.deleteOne();
  }

  const user = await User.create({ name: 'Demo', email: 'demo@kharcha.pk', password: 'demo123' });
  const [wallet, bank, jazz] = await Account.insertMany([
    { user: user._id, name: 'Wallet (Cash)', start: 4000 },
    { user: user._id, name: 'Bank Account', start: 25000 },
    { user: user._id, name: 'JazzCash / Easypaisa', start: 3000 },
  ]);

  const n = new Date();
  const y = n.getFullYear(), m = n.getMonth(), d = n.getDate();
  const D = (ago) => ds(new Date(y, m, d - ago));
  const tx = (type, amt, acc, cat, note, date, to = null) => ({
    user: user._id, type, amt, acc: acc._id, to: to ? to._id : null, cat, note, date,
  });

  await Transaction.insertMany([
    tx('expense', 450, wallet, 'Food', 'Lunch', D(0)),
    tx('expense', 200, wallet, 'Transport', 'Rickshaw', D(0)),
    tx('expense', 2300, bank, 'Food', 'Groceries', D(1)),
    tx('expense', 500, jazz, 'Bills', 'Mobile load', D(2)),
    tx('expense', 3800, bank, 'Shopping', 'Shoes', D(3)),
    tx('expense', 1700, wallet, 'Food', 'Dinner out', D(4)),
    tx('expense', 2500, bank, 'Transport', 'Petrol', D(5)),
    tx('expense', 900, wallet, 'Health', 'Medicine', D(6)),
    tx('income', 80000, bank, 'Salary', 'Salary', ds(new Date(y, m, 1))),
    tx('transfer', 10000, bank, '', 'Cash withdrawal', D(3), wallet),
    tx('expense', 12000, bank, 'Rent', 'Rent', ds(new Date(y, m - 1, 5))),
    tx('expense', 9000, wallet, 'Food', 'Food', ds(new Date(y, m - 1, 15))),
  ]);

  console.log('Demo user ready: demo@kharcha.pk / demo123');
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
