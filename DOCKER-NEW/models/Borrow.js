const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Borrow = sequelize.define('Borrow', {
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
    allowNull: false,
    defaultValue: 1
  },
  purpose: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  borrow_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  expected_return_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actual_return_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'borrowing', 'returned', 'overdue', 'rejected'),
    defaultValue: 'pending'
  },
  return_condition: {
    type: DataTypes.STRING(500),
    allowNull: true
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
  tableName: 'borrows'
});

module.exports = Borrow;
