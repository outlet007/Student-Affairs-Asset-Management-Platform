const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'asset_management',
  process.env.DB_USER || 'asset_user',
  process.env.DB_PASSWORD || 'vM7gK9rX4pZ2hT5',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    timezone: '+07:00',
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

module.exports = sequelize;
