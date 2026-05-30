const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const contentRoutes = require('./routes/contentRoutes'); // ADD THIS
const approvalRoutes = require('./routes/approvalRoutes'); // ADD THIS
const broadcastRoutes = require('./routes/broadcastRoutes'); // add at top

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

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