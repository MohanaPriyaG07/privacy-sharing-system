import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import datasetRoutes from './routes/datasets.js';
import sharingRoutes from './routes/sharing.js';

dotenv.config();
const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/datasets', datasetRoutes);
app.use('/api/sharing', sharingRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);