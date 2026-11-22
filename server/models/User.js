const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const THEMES = ['teal', 'blue', 'purple', 'orange', 'pink'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    theme: { type: String, enum: THEMES, default: 'teal' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toPublic = function () {
  return { id: this._id.toString(), name: this.name, email: this.email, theme: this.theme };
};

module.exports = mongoose.model('User', userSchema);
module.exports.THEMES = THEMES;
