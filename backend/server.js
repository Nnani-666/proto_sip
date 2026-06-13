import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import safetyRoutes from './routes/safety.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/safety', safetyRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    database: mongoose.connection.readyState === 1 ? 'connected' : 'mock-fallback' 
  });
});

const MONGO_URI = process.env.MONGO_URI;
const useMongoose = MONGO_URI && process.env.USE_REAL_MONGO === 'true';

if (useMongoose) {
  console.log('Connecting to MongoDB...');
  mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected.'))
    .catch((err) => {
      console.warn('MongoDB connection failed. Operating in mock fallback mode:', err.message);
    });
} else {
  console.log('Operating in Local Mock Database Fallback Mode.');
}

app.listen(PORT, () => {
  console.log(`SafeTour Backend Server running on port ${PORT}`);
});
