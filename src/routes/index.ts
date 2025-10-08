import { Router } from 'express';
import { ApiResponse } from '../types';
import authRoutes from '../modules/auth/routes/auth';
import adminRoutes from '../modules/admin/routes/admin';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  const response: ApiResponse = {
    success: true,
    message: 'Server is running',
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }
  };
  res.status(200).json(response);
});

// API version info
router.get('/version', (req, res) => {
  const response: ApiResponse = {
    success: true,
    message: 'API version information',
    data: {
      version: '1.0.0',
      name: 'Educational Management System API',
      description: 'Backend API for Educational Management System'
    }
  };
  res.status(200).json(response);
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

// Catch-all route for undefined endpoints
router.use('*', (req, res) => {
  const response: ApiResponse = {
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  };
  res.status(404).json(response);
});

export default router;
