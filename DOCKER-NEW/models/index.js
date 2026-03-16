const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Asset = require('./Asset');
const Withdrawal = require('./Withdrawal');
const Borrow = require('./Borrow');

// Associations
Category.hasMany(Asset, { foreignKey: 'category_id', as: 'assets' });
Asset.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

Asset.hasMany(Withdrawal, { foreignKey: 'asset_id', as: 'withdrawals' });
Withdrawal.belongsTo(Asset, { foreignKey: 'asset_id', as: 'asset' });

User.hasMany(Withdrawal, { foreignKey: 'user_id', as: 'withdrawals' });
Withdrawal.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Withdrawal.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

Asset.hasMany(Borrow, { foreignKey: 'asset_id', as: 'borrows' });
Borrow.belongsTo(Asset, { foreignKey: 'asset_id', as: 'asset' });

User.hasMany(Borrow, { foreignKey: 'user_id', as: 'borrows' });
Borrow.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Borrow.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

module.exports = {
  sequelize,
  User,
  Category,
  Asset,
  Withdrawal,
  Borrow
};
