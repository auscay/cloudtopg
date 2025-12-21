import { createApp } from './app';
import database from './config/database';
import { config } from './config';
import { ErrorHandler } from './middleware/errorHandler';
import { runSeedCustomSuperAdmin, runSeedSuperAdmin } from './modules/admin/scripts/seedSuperAdmin';
import seedPaymentPlans from './modules/subscription/scripts/seedPaymentPlans';

// Initialize error handling  
ErrorHandler.initialize();

const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await database.connect();

    // Seed super admin after database connection
    try {
      await runSeedSuperAdmin()
      // await seedPaymentPlans()
    } catch (error) {
      console.error('Failed to seed super admin:', error);
    }

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(config.port, () => {
      console.log(`
🚀 Server is running!
📡 Environment: ${config.nodeEnv}
🌐 Port: ${config.port}
🔗 URL: http://localhost:${config.port}
📚 API Documentation: http://localhost:${config.port}/api/v1/version
🏥 Health Check: http://localhost:${config.port}/api/v1/health
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string): Promise<void> => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('HTTP server closed.');
        
        try {
          await database.disconnect();
          console.log('Database disconnected.');
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force close after 30 seconds
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
