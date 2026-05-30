require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const sequelize = require('./src/config/database');
const app = require('./src/app');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Make io accessible everywhere
app.set('io', io);

io.on('connection', (socket) => {
  console.log('🔌 Student connected:', socket.id);

  // Student joins a teacher's room
  socket.on('join_teacher', (teacherId) => {
    socket.join(`teacher_${teacherId}`);
    console.log(`📡 Socket ${socket.id} joined teacher_${teacherId}`);
  });

  // Student joins public dashboard room
  socket.on('join_public', () => {
    socket.join('public_dashboard');
    console.log(`📡 Socket ${socket.id} joined public dashboard`);
  });
  
  socket.on('join_principal', () => {
  socket.join('principal_room')
  console.log(`👑 Principal joined principal_room`)
})

  socket.on('disconnect', () => {
    console.log('❌ Student disconnected:', socket.id);
  });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized');

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`\n🔐 Auth endpoints:`);
      console.log(`   POST http://localhost:${PORT}/api/auth/register`);
      console.log(`   POST http://localhost:${PORT}/api/auth/login`);
      console.log(`   GET  http://localhost:${PORT}/api/auth/me`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();