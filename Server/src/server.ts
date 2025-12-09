import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import importRoutes from './routes/importRoutes';
import exportRoutes from './routes/exportRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import { errorHandler } from './middleware/errorHandler';
import pool from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/import', importRoutes);
app.use('/api/v1/export', exportRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Health Check
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({ status: 'UP', db: 'CONNECTED', timestamp: new Date() });
    } catch (error) {
        res.status(500).json({ status: 'DOWN', db: 'DISCONNECTED', error: (error as Error).message, timestamp: new Date() });
    }
});

// Error Handling
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
