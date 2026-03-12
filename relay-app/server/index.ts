import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import briefingRouter from './routes/briefings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// CORS — locked to known origins
const allowedOrigins = [
  'https://relay-app.fly.dev',
  'http://localhost:5173',
  'http://localhost:4173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server like Janus)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
  }),
);

// Rate limiting — all /relay/ routes: 60 req/min per IP
const limiter = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
});

app.use(express.json());
app.use('/relay/briefings', limiter, briefingRouter);

// In production: serve Vite static build
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath, {
    maxAge: '1y',
    immutable: true,
  }));
  // SPA fallback (Express 5 requires named wildcard)
  app.get('/*splat', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const port = Number(process.env.PORT) || (process.env.NODE_ENV === 'production' ? 8080 : 3000);
app.listen(port, () => {
  console.log(`Relay server running on port ${port} [${process.env.NODE_ENV ?? 'development'}]`);
});
