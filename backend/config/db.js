const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not set in environment variables!');
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected ✅');
  } catch (err) {
    console.error('MongoDB connection error ❌:', err.message);
    // Don't exit(1), let the app stay alive so logs can be captured
  }
};

module.exports = connectDB;
