import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import routes from './routes';
import { ErrorHandler } from './middleware/errorHandler';

export const createApp = (): express.Application => {
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // CORS configuration
  app.use(cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Compression middleware
  app.use(compression());

  // Logging middleware
  if (config.nodeEnv !== 'test') {
    app.use(morgan('combined'));
  }

  // Request ID middleware (for tracing)
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    (req as any).id = Math.random().toString(36).substr(2, 9);
    res.setHeader('X-Request-ID', (req as any).id);
    next();
  });

  // API routes
  app.use('/api/v1', routes);

  // Root endpoint
  app.get('/', (req: express.Request, res: express.Response) => {
    res.json({
      success: true,
      message: 'Educational Management System API',
      version: '1.0.0',
      endpoints: {
        health: '/api/v1/health',
        auth: '/api/v1/auth',
        version: '/api/v1/version'
      }
    });
  });

  // Error handling middleware (must be last)
  app.use(ErrorHandler.handleNotFound);
  app.use(ErrorHandler.handleError);

  return app;
};
