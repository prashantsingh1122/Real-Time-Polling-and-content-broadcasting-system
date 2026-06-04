const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const contentRoutes = require('./routes/contentRoutes'); // ADD THIS
const approvalRoutes = require('./routes/approvalRoutes'); // ADD THIS
const broadcastRoutes = require('./routes/broadcastRoutes'); // add at top
const pollRoutes = require('./routes/pollRoutes');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://content-broadcasting-system-three.vercel.app/', // add after deploying
    'http://65.0.30.203'
  ],
  credentials: true
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes); // ADD THIS
app.use('/api/approval', approvalRoutes);
app.use('/api/broadcast', broadcastRoutes); 
app.use('/api/polls', pollRoutes);

// Swagger UI (serve static swagger.yaml from repo root)
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