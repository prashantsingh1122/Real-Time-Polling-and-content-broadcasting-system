const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const contentRoutes = require('./routes/contentRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const broadcastRoutes = require('./routes/broadcastRoutes');
const pollRoutes = require('./routes/pollRoutes');

const app = express();

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://content-broadcasting-system-three.vercel.app',
    'http://65.0.30.203',
    'https://content-broadcasting-system-h4uo.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

//Rate Limiting
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/broadcast', broadcastLimiter);


app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/approval', approvalRoutes);
app.use('/api/broadcast', broadcastRoutes);
app.use('/api/polls', pollRoutes);

try {
  const swaggerPath = path.join(__dirname, '..', 'swagger.yaml');
  const swaggerDocument = YAML.load(swaggerPath);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));
} catch (err) {
  console.warn('Swagger UI not mounted:', err.message);
}

app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found' 
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({ 
    success: false,
    error: err.message || 'Internal server error' 
  });
});

module.exports = app;