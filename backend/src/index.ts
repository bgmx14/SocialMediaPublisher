import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { config } from './config';
import { initializeDatabase } from './config/database';
import { SchedulerService } from './services/SchedulerService';

// Routes
import accountRoutes from './routes/accountRoutes';
import postRoutes from './routes/postRoutes';
import aiRoutes from './routes/aiRoutes';
import mediaRoutes from './routes/mediaRoutes';
import historyRoutes from './routes/historyRoutes';

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/accounts', accountRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/history', historyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Social Media Publisher API is running',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database
    console.log('🔧 Initializing database...');
    initializeDatabase();

    // Start scheduler
    console.log('⏰ Starting post scheduler...');
    SchedulerService.start();

    // Start server
    app.listen(config.port, () => {
      console.log('');
      console.log('🚀 Social Media Publisher API');
      console.log('================================');
      console.log(`📡 Server running on port ${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`📂 Database: ${config.database.path}`);
      console.log(`🤖 OpenAI: ${config.openai.apiKey ? '✅ Configured' : '❌ Not configured'}`);
      console.log('================================');
      console.log('');
      console.log('API Endpoints:');
      console.log(`  GET    http://localhost:${config.port}/api/health`);
      console.log(`  GET    http://localhost:${config.port}/api/accounts`);
      console.log(`  GET    http://localhost:${config.port}/api/posts`);
      console.log(`  POST   http://localhost:${config.port}/api/posts`);
      console.log(`  POST   http://localhost:${config.port}/api/ai/generate-caption`);
      console.log(`  POST   http://localhost:${config.port}/api/media/upload`);
      console.log(`  GET    http://localhost:${config.port}/api/history`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down gracefully...');
  SchedulerService.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Shutting down gracefully...');
  SchedulerService.stop();
  process.exit(0);
});

// Start the server
startServer();
