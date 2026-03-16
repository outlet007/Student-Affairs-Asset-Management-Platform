const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Withdrawal = sequelize.define('Withdrawal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  asset_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  purpose: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  withdrawal_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
    defaultValue: 'pending'
  },
  rejection_reason: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'withdrawals'
});

module.exports = Withdrawal;
