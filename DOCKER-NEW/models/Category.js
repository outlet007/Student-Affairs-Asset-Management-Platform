const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  sku_prefix: {
    type: DataTypes.STRING(3),
    allowNull: false,
    unique: true,
    validate: {
      len: [2, 3],
      isUppercase: true
    },
    set(val) {
      this.setDataValue('sku_prefix', val ? val.toUpperCase() : val);
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'categories'
});

module.exports = Category;
