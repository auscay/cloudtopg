import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  jwt: {
    secret: string;
    refreshSecret: string;
    expire: string;
    refreshExpire: string;
  };
  mongodb: {
    uri: string;
    testUri: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  cors: {
    origin: string[];
  };
  logging: {
    level: string;
  };
  email: {
    provider: 'smtp' | 'brevo' | 'sendgrid';
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    from: string;
    fromName: string;
    brevo: {
      apiKey: string;
      apiUrl: string;
    };
    sendgrid: {
      apiKey: string;
      apiUrl: string;
    };
  };
  app: {
    name: string;
    url: string;
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  jwt: {
    secret: process.env.JWT_SECRET || '',
    refreshSecret: process.env.JWT_REFRESH_SECRET || '',
    expire: process.env.JWT_EXPIRE || '7d',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d',
  },
  
  mongodb: {
    uri: process.env.MONGODB_URI || '',
    testUri: process.env.MONGODB_TEST_URI || '',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  
  email: {
    provider: (process.env.EMAIL_PROVIDER as 'smtp' | 'brevo' | 'sendgrid') || 'smtp',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '465', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'Cloud Top G',
    fromName: process.env.EMAIL_FROM_NAME || 'Cloud Top G Management System',
    brevo: {
      apiKey: process.env.BREVO_API_KEY || '',
      apiUrl: process.env.BREVO_API_URL || 'https://api.brevo.com/v3/smtp/email',
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY || '',
      apiUrl: process.env.SENDGRID_API_URL || 'https://api.sendgrid.com/v3/mail/send',
    },
  },
  
  app: {
    name: process.env.APP_NAME || 'Cloud Top G',
    url: process.env.APP_URL || 'http://localhost:3000',
  },
};

// Validate required environment variables
const validateConfig = (): void => {
  const requiredVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  if (config.jwt.secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  if (config.jwt.refreshSecret.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
  }
};

// Only validate in non-test environments
if (config.nodeEnv !== 'test') {
  validateConfig();
}

export { config };
export default config;
