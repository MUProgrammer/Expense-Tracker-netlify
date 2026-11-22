const mongoose = require('mongoose');

const txSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['expense', 'income', 'transfer'], required: true },
    amt: { type: Number, required: true, min: 0.01 },
    acc: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', default: null },
    cat: { type: String, default: '', trim: true, maxlength: 40 },
    note: { type: String, default: '', trim: true, maxlength: 200 },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ }, // YYYY-MM-DD
  },
  { timestamps: true }
);

txSchema.index({ user: 1, date: -1, createdAt: -1 });

txSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    ret.acc = ret.acc && ret.acc.toString();
    ret.to = ret.to ? ret.to.toString() : null;
    delete ret._id;
    delete ret.__v;
    delete ret.user;
    return ret;
  },
});

module.exports = mongoose.model('Transaction', txSchema);
