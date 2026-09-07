require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const competitionRoutes = require('./routes/competitionRoutes');
const resultRoutes = require('./routes/resultRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const Passage = require('./models/Passage');
const seedData = require('./seed/passages');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB().then(async () => {
  // Check if passages need auto-seeding
  const passageCount = await Passage.countDocuments();
  if (passageCount === 0) {
    console.log('[Startup] No passages found. Auto-seeding initial round passages and admin...');
    await seedData();
  }
}).catch((err) => {
  console.error('[Startup] DB Connection failed:', err);
});

// Middleware
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global Rate Limiter: 300 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again later.' },
});
app.use('/api', globalLimiter);


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', event: 'TECXEL Typing Championship', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/competition', competitionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack || err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(` TECXEL Typing Championship Server`);
  console.log(` Running on: http://localhost:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`========================================\n`);
});

module.exports = app;
