const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  
  // SSL required for Supabase
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  
  // Logging
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  
  // Connection pool (adjusted for free tier)
  pool: {
    max: 5,      // Lower for free tier but in increased from 3 to 15 to handle more concurrent connections
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  
  // Timezone
  timezone: '+00:00'
});

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');
  } catch (error) {
    console.error('❌ Unable to connect to database:', error.message);
    process.exit(1);
  }
};

testConnection();

module.exports = sequelize;