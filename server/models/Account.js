const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    start: { type: Number, default: 0 }, // opening balance
  },
  { timestamps: true }
);

accountSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.user;
    return ret;
  },
});

module.exports = mongoose.model('Account', accountSchema);
