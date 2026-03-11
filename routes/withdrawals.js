const express = require('express');
const router = express.Router();
const { Withdrawal, Asset, User } = require('../models');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { Op } = require('sequelize');
const { paginate, buildPaginationQuery } = require('../utils/paginationHelper');

// GET /withdrawals
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { status, page } = req.query;
    const where = {};
    if (status) where.status = status;

    const result = await paginate(Withdrawal, {
      where,
      include: [
        { model: Asset, as: 'asset' },
        { model: User, as: 'user' },
        { model: User, as: 'approver' }
      ],
      order: [['created_at', 'DESC']]
    }, page, 10);

    res.render('withdrawals/index', {
      title: 'การเบิกใช้ทรัพย์สิน',
      withdrawals: result.rows,
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

// GET /withdrawals/create
router.get('/create', isAuthenticated, async (req, res) => {
  try {
    const assets = await Asset.findAll({
      where: { type: 'consumable', quantity: { [Op.gt]: 0 }, status: 'active' },
      order: [['name', 'ASC']]
    });
    res.render('withdrawals/create', { title: 'เบิกใช้ทรัพย์สิน', assets });
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาด');
    res.redirect('/withdrawals');
  }
});

// POST /withdrawals/create
router.post('/create', isAuthenticated, async (req, res) => {
  try {
    const { asset_id, quantity, purpose } = req.body;
    const asset = await Asset.findByPk(asset_id);

    if (!asset) {
      req.flash('error', 'ไม่พบทรัพย์สิน');
      return res.redirect('/withdrawals/create');
    }

    if (parseInt(quantity) > asset.quantity) {
      req.flash('error', `จำนวนไม่เพียงพอ (คงเหลือ ${asset.quantity} ${asset.unit})`);
      return res.redirect('/withdrawals/create');
    }

    await Withdrawal.create({
      asset_id,
      user_id: req.session.user.id,
      quantity: parseInt(quantity),
      purpose,
      withdrawal_date: new Date(),
      status: 'pending'
    });

    req.flash('success', 'สร้างรายการเบิกสำเร็จ รอการอนุมัติ');
    res.redirect('/withdrawals');
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาดในการเบิก');
    res.redirect('/withdrawals/create');
  }
});

// POST /withdrawals/approve/:id
router.post('/approve/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findByPk(req.params.id);
    if (!withdrawal || withdrawal.status !== 'pending') {
      req.flash('error', 'ไม่พบรายการหรือรายการได้รับการดำเนินการแล้ว');
      return res.redirect('/withdrawals');
    }

    const asset = await Asset.findByPk(withdrawal.asset_id);
    if (withdrawal.quantity > asset.quantity) {
      req.flash('error', 'จำนวนทรัพย์สินไม่เพียงพอ');
      return res.redirect('/withdrawals');
    }

    withdrawal.status = 'approved';
    withdrawal.approved_by = req.session.user.id;
    await withdrawal.save();

    asset.quantity -= withdrawal.quantity;
    await asset.save();

    req.flash('success', 'อนุมัติรายการเบิกสำเร็จ');
    res.redirect('/withdrawals');
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาด');
    res.redirect('/withdrawals');
  }
});

// POST /withdrawals/reject/:id - with rejection reason
router.post('/reject/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findByPk(req.params.id);
    if (!withdrawal || withdrawal.status !== 'pending') {
      req.flash('error', 'ไม่พบรายการหรือรายการได้รับการดำเนินการแล้ว');
      return res.redirect('/withdrawals');
    }

    const { rejection_reason } = req.body;
    withdrawal.status = 'rejected';
    withdrawal.approved_by = req.session.user.id;
    withdrawal.rejection_reason = rejection_reason || null;
    await withdrawal.save();

    req.flash('success', 'ปฏิเสธรายการเบิกสำเร็จ');
    res.redirect('/withdrawals');
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาด');
    res.redirect('/withdrawals');
  }
});

// POST /withdrawals/cancel/:id - User cancels their own pending withdrawal
router.post('/cancel/:id', isAuthenticated, async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findByPk(req.params.id);
    if (!withdrawal || withdrawal.status !== 'pending') {
      req.flash('error', 'ไม่พบรายการหรือไม่สามารถยกเลิกได้');
      return res.redirect('/withdrawals');
    }

    // Only the requester can cancel
    if (withdrawal.user_id !== req.session.user.id && req.session.user.role !== 'admin') {
      req.flash('error', 'คุณไม่มีสิทธิ์ยกเลิกรายการนี้');
      return res.redirect('/withdrawals');
    }

    withdrawal.status = 'cancelled';
    await withdrawal.save();

    req.flash('success', 'ยกเลิกรายการเบิกสำเร็จ');
    res.redirect('/withdrawals');
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาด');
    res.redirect('/withdrawals');
  }
});

module.exports = router;
