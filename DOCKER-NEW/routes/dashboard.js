const express = require('express');
const router = express.Router();
const { Asset, Category, Withdrawal, Borrow, User } = require('../models');
const { isAuthenticated } = require('../middleware/auth');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { checkOverdueBorrows } = require('../utils/overdueChecker');

router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Check overdue borrows on dashboard load
    await checkOverdueBorrows();

    // Summary counts
    const totalAssets = await Asset.count();
    const totalConsumable = await Asset.count({ where: { type: 'consumable' } });
    const totalBorrowable = await Asset.count({ where: { type: 'borrowable' } });
    const activeBorrows = await Borrow.count({ where: { status: 'borrowing' } });
    const overdueBorrows = await Borrow.count({ where: { status: 'overdue' } });
    const pendingBorrows = await Borrow.count({ where: { status: 'pending' } });
    const pendingWithdrawals = await Withdrawal.count({ where: { status: 'pending' } });
    const lowStockAssets = await Asset.count({
      where: {
        quantity: { [Op.lte]: sequelize.col('min_quantity') },
        min_quantity: { [Op.gt]: 0 }
      }
    });
    const totalUsers = await User.count();

    // Assets by category for bar chart
    const assetsByCategory = await Asset.findAll({
      attributes: [
        'category_id',
        [sequelize.fn('COUNT', sequelize.col('Asset.id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('quantity')), 'total_qty']
      ],
      include: [{ model: Category, as: 'category', attributes: ['name'] }],
      group: ['category_id', 'category.id', 'category.name'],
      raw: true,
      nest: true
    });

    // Recent withdrawals
    const recentWithdrawals = await Withdrawal.findAll({
      include: [
        { model: Asset, as: 'asset', attributes: ['name'] },
        { model: User, as: 'user', attributes: ['full_name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    // Recent borrows
    const recentBorrows = await Borrow.findAll({
      include: [
        { model: Asset, as: 'asset', attributes: ['name'] },
        { model: User, as: 'user', attributes: ['full_name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    // Monthly withdrawal stats (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyWithdrawals = await Withdrawal.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('withdrawal_date')), 'month'],
        [sequelize.fn('YEAR', sequelize.col('withdrawal_date')), 'year'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        withdrawal_date: { [Op.gte]: sixMonthsAgo },
        status: 'approved'
      },
      group: [
        sequelize.fn('MONTH', sequelize.col('withdrawal_date')),
        sequelize.fn('YEAR', sequelize.col('withdrawal_date'))
      ],
      order: [
        [sequelize.fn('YEAR', sequelize.col('withdrawal_date')), 'ASC'],
        [sequelize.fn('MONTH', sequelize.col('withdrawal_date')), 'ASC']
      ],
      raw: true
    });

    // Low stock items
    const lowStockItems = await Asset.findAll({
      where: {
        quantity: { [Op.lte]: sequelize.col('min_quantity') },
        min_quantity: { [Op.gt]: 0 }
      },
      include: [{ model: Category, as: 'category' }],
      limit: 5
    });

    res.render('dashboard', {
      title: 'แดชบอร์ด',
      totalAssets,
      totalConsumable,
      totalBorrowable,
      activeBorrows,
      overdueBorrows,
      pendingBorrows,
      pendingWithdrawals,
      lowStockAssets,
      totalUsers,
      assetsByCategory,
      recentWithdrawals,
      recentBorrows,
      monthlyWithdrawals,
      lowStockItems
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    req.flash('error', 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    res.render('dashboard', {
      title: 'แดชบอร์ด',
      totalAssets: 0, totalConsumable: 0, totalBorrowable: 0,
      activeBorrows: 0, overdueBorrows: 0, pendingBorrows: 0,
      pendingWithdrawals: 0, lowStockAssets: 0,
      totalUsers: 0, assetsByCategory: [], recentWithdrawals: [],
      recentBorrows: [], monthlyWithdrawals: [], lowStockItems: []
    });
  }
});

module.exports = router;
