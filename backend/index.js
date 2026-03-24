//backend/index.js

const dotenv = require('dotenv');
const path = require('path');
const envPath = path.resolve(__dirname, '.env');
require('dotenv').config({ path: envPath });

console.log('ENV Path:', envPath);
console.log('File Exists:', require('fs').existsSync(envPath));
console.log('Keys:', {
  Gemini: process.env.GEMINI_API_KEY ? '***' + process.env.GEMINI_API_KEY.slice(-4) : 'MISSING',
  MongoDB: process.env.MONGO_URI ? '***' + process.env.MONGO_URI.slice(-4) : 'MISSING'
});
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cartRoutes');
// const checkoutRoutes = require('./routes/checkoutRoutes');
const PORT = process.env.PORT || 5000;

const app = express();
const fs = require('fs');
const geminiRoutes = require("./routes/geminiRoutes");

// 1. Create upload directory
const uploadDir = path.join(__dirname, 'uploads/images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory:', uploadDir);
}

connectDB();

// 2. CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());


// 3. Route configurations
app.use('/auth', require('./routes/auth'));
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', require('./routes/orderRoutes'));

// 4. Static file serving (FIXED)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/gemini", geminiRoutes);

// 5. Serving Frontend In Production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get('*', (req, res) => {
    // Only serve index.html if it's not an API call
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
    }
  });
}

app.get('/api/test-gemini', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Hello");
    res.send(result.response.text());
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});