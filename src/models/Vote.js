const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vote = sequelize.define('Vote', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  poll_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  option_index: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  voter_session: {
    type: DataTypes.STRING,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Votes',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['poll_id', 'voter_session']
    }
  ]
});

module.exports = Vote;
