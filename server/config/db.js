const mongoose = require('mongoose');

let connecting = null;

// Ek hi connection dobara use hota hai (Netlify Functions mein har request par naya nahi banta)
module.exports = function connectDB() {
  if (!process.env.MONGO_URI) return Promise.reject(new Error('MONGO_URI set nahi hai'));
  if (!connecting) {
    connecting = mongoose
      .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 })
      .then(() => console.log('MongoDB connected:', mongoose.connection.host))
      .catch((e) => {
        connecting = null;
        throw e;
      });
  }
  return connecting;
};
