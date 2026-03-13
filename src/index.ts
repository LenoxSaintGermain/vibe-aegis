// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import previewRouter from './routes/preview';
import fullReadingRouter from './routes/full-reading';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public')); // Static frontend files

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'vibe-aegis' });
});

// API routes
app.use('/api', previewRouter);
app.use('/api', fullReadingRouter);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Vibe A.E.G.I.S. running on http://localhost:${PORT}`);
  });
}

export default app;
