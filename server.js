require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/auth.routes');
const errorHandler = require('./src/middleware/errorHandler');

// Connect to MongoDB
connectDB();

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow inline scripts for dev
  })
);

app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? false : '*',
    credentials: true,
  })
);

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── Serve Frontend Pages ─────────────────────────────────────────────────────
app.get('/login', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'login.html'))
);
app.get('/signup', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'signup.html'))
);
app.get('/dashboard', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'))
);

// ─── API 404 Handler ─────────────────────────────────────────────────────────
// Must be before the SPA catch-all so API routes get proper JSON 404 errors
// Note: Express 5 requires named wildcards — using /api/{*splat}
app.use('/api/{*splat}', (req, res) => {
  res.status(404).json({ success: false, message: `API route not found: ${req.originalUrl}` });
});

// ─── SPA Catch-all ───────────────────────────────────────────────────────────
// Only serve index.html for non-API routes (client-side routing)
app.use((req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

// ─── Global Error Handler ─────────────────────────────────────────────────────
// MUST be last — Express identifies error handlers by the 4-argument signature
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
