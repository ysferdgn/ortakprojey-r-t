require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

// Create Express app
const app = express();

console.log('🚀 Backend server is starting...');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('📁 Created uploads directory');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB Atlas
const MONGODB_URI = process.env.MONGO_URL || 'mongodb+srv://215260064:BdSYYCv3UkaMtm5y@cluster0.valr7id.mongodb.net/petadopt?retryWrites=true&w=majority&appName=Cluster0';

console.log('🔌 Connecting to MongoDB Atlas...');

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas successfully!');
  console.log('📊 Database: cluster0.valr7id.mongodb.net');
})
.catch(err => {
  console.log('❌ MongoDB connection failed!');
  console.error('Error details:', err.message);
  process.exit(1);
});

// Add mongoose debug logging
mongoose.set('debug', true);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pets', require('./routes/pets'));
app.use('/api/users', require('./routes/users'));

console.log('📡 API Routes loaded successfully');

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Something went wrong!',
    details: err.message 
  });
});

// Handle 404 routes
app.use((req, res) => {
  console.log('⚠️  404 - Route not found:', req.url);
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('🎉 Server is running successfully!');
  console.log('📍 Port:', PORT);
  console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
  console.log('🔗 API Base URL: http://localhost:' + PORT);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}); 