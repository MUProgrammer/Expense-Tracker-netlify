require('dotenv').config();
const path = require('path');
const express = require('express');
const app = require('./app');
const connectDB = require('./config/db');

// production mein (Render waghera) React build bhi isi server se serve hoti hai
if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '../client/dist');
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => app.listen(PORT, () => console.log(`API chal raha hai: http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('MongoDB connect nahi hua:', err.message);
    process.exit(1);
  });
