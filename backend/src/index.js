import express from "express";
import authRoutes from './routes/auth.route.js';
import dotenv from 'dotenv';
import { connectDB } from './lib/db.js';

const app = express();

dotenv.config();

const PORT = process.env.PORT;

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`server is running on PORT: ${PORT}`);
  connectDB();
});
