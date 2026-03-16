const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  asset_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('consumable', 'borrowable'),
    allowNull: false,
    defaultValue: 'consumable'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  unit: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'ชิ้น'
  },
  price_per_unit: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: 0
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  min_quantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('active', 'damaged', 'repairing', 'disposed'),
    allowNull: false,
    defaultValue: 'active'
  }
}, {
  tableName: 'assets'
});

module.exports = Asset;
