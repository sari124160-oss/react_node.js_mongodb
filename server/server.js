const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const requestRoutes = require('./src/routes/requestRoutes');
const { verifyToken } = require('./src/middleware/verifyToken');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/requests', verifyToken, requestRoutes);
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.json({ message: '✅ Server is running!' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(process.env.PORT, () => {
      console.log(`✅ Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error('❌ MongoDB error:', err));