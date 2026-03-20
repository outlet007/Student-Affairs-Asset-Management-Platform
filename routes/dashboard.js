const express = require('express');
const router = express.Router();
const { Asset, Category, Withdrawal, Borrow, User, Department } = require('../models');
const { isAuthenticated } = require('../middleware/auth');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { checkOverdueBorrows } = require('../utils/overdueChecker');

router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Check overdue borrows on dashboard load
    await checkOverdueBorrows();

    // Department filter
    const deptFilter = {};
    if (req.session.user.role !== 'superadmin' && req.session.user.department_id) {
      deptFilter.department_id = req.session.user.department_id;
    }

    // Summary counts
    const totalAssets = await Asset.count({ where: deptFilter });
    const totalConsumable = await Asset.count({ where: { ...deptFilter, type: 'consumable' } });
    const totalBorrowable = await Asset.count({ where: { ...deptFilter, type: 'borrowable' } });

    // For borrows/withdrawals, filter by asset department
    const deptAssetIds = deptFilter.department_id
      ? (await Asset.findAll({ where: deptFilter, attributes: ['id'], raw: true })).map(a => a.id)
      : null;

    const borrowWhere = deptAssetIds ? { asset_id: { [Op.in]: deptAssetIds } } : {};
    const withdrawalWhere = deptAssetIds ? { asset_id: { [Op.in]: deptAssetIds } } : {};

    // Staff: only see their own transactions
    if (req.session.user.role === 'staff') {
      borrowWhere.user_id = req.session.user.id;
      withdrawalWhere.user_id = req.session.user.id;
    }

    const activeBorrows = await Borrow.count({ where: { ...borrowWhere, status: 'borrowing' } });
    const overdueBorrows = await Borrow.count({ where: { ...borrowWhere, status: 'overdue' } });
    const pendingBorrows = await Borrow.count({ where: { ...borrowWhere, status: 'pending' } });
    const pendingWithdrawals = await Withdrawal.count({ where: { ...withdrawalWhere, status: 'pending' } });
    const lowStockAssets = await Asset.count({
      where: {
        ...deptFilter,
        quantity: { [Op.lte]: sequelize.col('min_quantity') },
        min_quantity: { [Op.gt]: 0 }
      }
    });
    const totalUsers = req.session.user.role === 'superadmin'
      ? await User.count()
      : await User.count({ where: { department_id: req.session.user.department_id } });

    // Assets by category for bar chart
    const assetsByCategoryWhere = deptFilter.department_id ? { department_id: deptFilter.department_id } : {};
    const assetsByCategory = await Asset.findAll({
      attributes: [
        'category_id',
        [sequelize.fn('COUNT', sequelize.col('Asset.id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('quantity')), 'total_qty']
      ],
      where: assetsByCategoryWhere,
      include: [{ model: Category, as: 'category', attributes: ['name'] }],
      group: ['category_id', 'category.id', 'category.name'],
      raw: true,
      nest: true
    });

    // Recent withdrawals
    const recentWithdrawalsInclude = [
      { model: Asset, as: 'asset', attributes: ['name', 'department_id'] },
      { model: User, as: 'user', attributes: ['full_name', 'role'], paranoid: false }
    ];
    if (deptAssetIds) {
      recentWithdrawalsInclude[0].where = { department_id: deptFilter.department_id };
    }

    const recentWithdrawals = await Withdrawal.findAll({
      where: req.session.user.role === 'staff' ? { user_id: req.session.user.id } : {},
      include: recentWithdrawalsInclude,
      order: [['created_at', 'DESC']],
      limit: 5
    });

    // Recent borrows
    const recentBorrowsInclude = [
      { model: Asset, as: 'asset', attributes: ['name', 'department_id'] },
      { model: User, as: 'user', attributes: ['full_name', 'role'], paranoid: false }
    ];
    if (deptAssetIds) {
      recentBorrowsInclude[0].where = { department_id: deptFilter.department_id };
    }

    const recentBorrows = await Borrow.findAll({
      where: req.session.user.role === 'staff' ? { user_id: req.session.user.id } : {},
      include: recentBorrowsInclude,
      order: [['created_at', 'DESC']],
      limit: 5
    });

    // Monthly withdrawal stats (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyWithdrawalWhere = {
      withdrawal_date: { [Op.gte]: sixMonthsAgo },
      status: 'approved'
    };
    if (deptAssetIds) {
      monthlyWithdrawalWhere.asset_id = { [Op.in]: deptAssetIds };
    }

    const monthlyWithdrawals = await Withdrawal.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('withdrawal_date')), 'month'],
        [sequelize.fn('YEAR', sequelize.col('withdrawal_date')), 'year'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: monthlyWithdrawalWhere,
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
        ...deptFilter,
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
