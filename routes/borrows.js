const express = require('express');
const router = express.Router();
const { Borrow, Asset, User } = require('../models');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { Op } = require('sequelize');
const { paginate, buildPaginationQuery } = require('../utils/paginationHelper');
const { checkOverdueBorrows } = require('../utils/overdueChecker');

// GET /borrows
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Check for overdue borrows
    await checkOverdueBorrows();

    const { status, page } = req.query;
    const where = {};
    if (status) where.status = status;

    const result = await paginate(Borrow, {
      where,
      include: [
        { model: Asset, as: 'asset' },
        { model: User, as: 'user' },
        { model: User, as: 'approver' }
      ],
      order: [['created_at', 'DESC']]
    }, page, 10);

    res.render('borrows/index', {
      title: 'การยืม-คืนทรัพย์สิน',
      borrows: result.rows,
      pagination: result,
      filterStatus: status || '',
      buildQuery: (p) => buildPaginationQuery(req.query, p)
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาด');
    res.redirect('/dashboard');
  }
});

// GET /borrows/create
router.get('/create', isAuthenticated, async (req, res) => {
  try {
    const assets = await Asset.findAll({
      where: { type: 'borrowable', quantity: { [Op.gt]: 0 }, status: 'active' },
      order: [['name', 'ASC']]
    });
    res.render('borrows/create', { title: 'ยืมทรัพย์สิน', assets });
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาด');
    res.redirect('/borrows');
  }
});

// POST /borrows/create - Now creates as pending (requires approval)
router.post('/create', isAuthenticated, async (req, res) => {
  try {
    const { asset_id, quantity, purpose, expected_return_date } = req.body;
    const asset = await Asset.findByPk(asset_id);

    if (!asset) {
      req.flash('error', 'ไม่พบทรัพย์สิน');
      return res.redirect('/borrows/create');
    }

    if (parseInt(quantity) > asset.quantity) {
      req.flash('error', `จำนวนไม่เพียงพอ (คงเหลือ ${asset.quantity} ${asset.unit})`);
      return res.redirect('/borrows/create');
    }

    await Borrow.create({
      asset_id,
      user_id: req.session.user.id,
      quantity: parseInt(quantity),
      purpose,
      borrow_date: new Date(),
      expected_return_date: expected_return_date || null,
      status: 'pending'
    });

    req.flash('success', 'สร้างรายการยืมสำเร็จ รอการอนุมัติ');
    res.redirect('/borrows');
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาดในการยืม');
    res.redirect('/borrows/create');
  }
});

// POST /borrows/approve/:id - Admin approves a borrow
router.post('/approve/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const borrow = await Borrow.findByPk(req.params.id);
    if (!borrow || borrow.status !== 'pending') {
      req.flash('error', 'ไม่พบรายการหรือรายการได้รับการดำเนินการแล้ว');
      return res.redirect('/borrows');
    }

    const asset = await Asset.findByPk(borrow.asset_id);
    if (borrow.quantity > asset.quantity) {
      req.flash('error', 'จำนวนทรัพย์สินไม่เพียงพอ');
      return res.redirect('/borrows');
    }

    // Approve and deduct stock
    borrow.status = 'borrowing';
    borrow.approved_by = req.session.user.id;
    await borrow.save();

    asset.quantity -= borrow.quantity;
    await asset.save();

    req.flash('success', 'อนุมัติการยืมสำเร็จ');
    res.redirect('/borrows');
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาด');
    res.redirect('/borrows');
  }
});

// POST /borrows/reject/:id - Admin rejects a borrow
router.post('/reject/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const borrow = await Borrow.findByPk(req.params.id);
    if (!borrow || borrow.status !== 'pending') {
      req.flash('error', 'ไม่พบรายการหรือรายการได้รับการดำเนินการแล้ว');
      return res.redirect('/borrows');
    }

    const { rejection_reason } = req.body;
    borrow.status = 'rejected';
    borrow.approved_by = req.session.user.id;
    borrow.rejection_reason = rejection_reason || null;
    await borrow.save();

    req.flash('success', 'ปฏิเสธการยืมสำเร็จ');
    res.redirect('/borrows');
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาด');
    res.redirect('/borrows');
  }
});

// GET /borrows/return/:id
router.get('/return/:id', isAuthenticated, async (req, res) => {
  try {
    const borrow = await Borrow.findByPk(req.params.id, {
      include: [
        { model: Asset, as: 'asset' },
        { model: User, as: 'user' }
      ]
    });
    if (!borrow || !['borrowing', 'overdue'].includes(borrow.status)) {
      req.flash('error', 'ไม่พบรายการยืมหรือรายการได้คืนแล้ว');
      return res.redirect('/borrows');
    }
    res.render('borrows/return', { title: 'คืนทรัพย์สิน', borrow });
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาด');
    res.redirect('/borrows');
  }
});

// POST /borrows/return/:id
router.post('/return/:id', isAuthenticated, async (req, res) => {
  try {
    const borrow = await Borrow.findByPk(req.params.id);
    if (!borrow || !['borrowing', 'overdue'].includes(borrow.status)) {
      req.flash('error', 'ไม่พบรายการยืมหรือรายการได้คืนแล้ว');
      return res.redirect('/borrows');
    }

    const { return_condition } = req.body;
    borrow.status = 'returned';
    borrow.actual_return_date = new Date();
    borrow.return_condition = return_condition;
    await borrow.save();

    // Add stock back
    const asset = await Asset.findByPk(borrow.asset_id);
    asset.quantity += borrow.quantity;
    await asset.save();

    req.flash('success', 'คืนทรัพย์สินสำเร็จ');
    res.redirect('/borrows');
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาดในการคืน');
    res.redirect('/borrows');
  }
});

module.exports = router;
