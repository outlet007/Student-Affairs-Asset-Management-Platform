const express = require('express');
const router = express.Router();
const { Asset, Category, Withdrawal, Borrow, User } = require('../models');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { Op } = require('sequelize');
const { paginate, buildPaginationQuery } = require('../utils/paginationHelper');

// GET /assets
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { type, search, category_id, page, limit } = req.query;
    const perPage = [10, 20, 30].includes(parseInt(limit)) ? parseInt(limit) : 10;
    const where = {};
    if (type && ['consumable', 'borrowable'].includes(type)) {
      where.type = type;
    }
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { asset_code: { [Op.like]: `%${search}%` } }
      ];
    }
    if (category_id) {
      where.category_id = category_id;
    }

    const result = await paginate(Asset, {
      where,
      include: [{ model: Category, as: 'category' }],
      order: [['created_at', 'DESC']]
    }, page, perPage);

    const categories = await Category.findAll({ order: [['name', 'ASC']] });

    res.render('assets/index', {
      title: 'จัดการทรัพย์สิน',
      assets: result.rows,
      categories,
      pagination: result,
      filters: { type: type || '', search: search || '', category_id: category_id || '' },
      buildQuery: (p) => buildPaginationQuery(req.query, p)
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาด');
    res.redirect('/dashboard');
  }
});

// GET /assets/create — MUST be before /:id
router.get('/create', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.render('assets/create', { title: 'เพิ่มทรัพย์สิน', categories });
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาด');
    res.redirect('/assets');
  }
});

// GET /assets/api/next-code/:categoryId — API for auto-generating asset code
router.get('/api/next-code/:categoryId', isAuthenticated, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.categoryId);
    if (!category || !category.sku_prefix) {
      return res.json({ code: '' });
    }
    const prefix = category.sku_prefix.toUpperCase();

    // Find ALL assets with this prefix to correctly determine the highest number
    const existingAssets = await Asset.findAll({
      attributes: ['asset_code'],
      where: {
        category_id: category.id,
        asset_code: { [Op.like]: `${prefix}-%` }
      }
    });

    // Extract numbers and find the maximum
    let maxNum = 0;
    existingAssets.forEach(asset => {
      const match = asset.asset_code.match(/-(\d+)$/);
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxNum) maxNum = num;
      }
    });

    // Generate next code, ensure it doesn't already exist
    let nextNum = maxNum + 1;
    let code = `${prefix}-${String(nextNum).padStart(4, '0')}`;

    // Double-check uniqueness (in case of manual codes)
    let exists = await Asset.findOne({ where: { asset_code: code } });
    while (exists) {
      nextNum++;
      code = `${prefix}-${String(nextNum).padStart(4, '0')}`;
      exists = await Asset.findOne({ where: { asset_code: code } });
    }

    // Return code and count of existing assets in this category
    res.json({ code, prefix, existingCount: existingAssets.length });
  } catch (error) {
    console.error(error);
    res.json({ code: '' });
  }
});

// POST /assets/create
router.post('/create', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { asset_code, name, description, category_id, type, quantity, unit, price_per_unit, location, min_quantity, status } = req.body;

    const existing = await Asset.findOne({ where: { asset_code } });
    if (existing) {
      req.flash('error', 'รหัสทรัพย์สินนี้มีอยู่แล้ว');
      return res.redirect('/assets/create');
    }

    await Asset.create({
      asset_code, name, description,
      category_id: category_id || null,
      type, quantity: parseInt(quantity) || 0,
      unit, price_per_unit: parseFloat(price_per_unit) || 0,
      location, min_quantity: parseInt(min_quantity) || 0,
      status: status || 'active'
    });

    req.flash('success', 'เพิ่มทรัพย์สินสำเร็จ');
    res.redirect('/assets');
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาดในการเพิ่มทรัพย์สิน');
    res.redirect('/assets/create');
  }
});

// GET /assets/edit/:id — MUST be before /:id
router.get('/edit/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) {
      req.flash('error', 'ไม่พบทรัพย์สิน');
      return res.redirect('/assets');
    }
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.render('assets/edit', { title: 'แก้ไขทรัพย์สิน', asset, categories });
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาด');
    res.redirect('/assets');
  }
});

// POST /assets/edit/:id
router.post('/edit/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) {
      req.flash('error', 'ไม่พบทรัพย์สิน');
      return res.redirect('/assets');
    }

    const { asset_code, name, description, category_id, type, quantity, unit, price_per_unit, location, min_quantity, status } = req.body;
    await asset.update({
      asset_code, name, description,
      category_id: category_id || null,
      type, quantity: parseInt(quantity) || 0,
      unit, price_per_unit: parseFloat(price_per_unit) || 0,
      location, min_quantity: parseInt(min_quantity) || 0,
      status: status || 'active'
    });

    req.flash('success', 'แก้ไขทรัพย์สินสำเร็จ');
    res.redirect('/assets');
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาดในการแก้ไข');
    res.redirect('/assets');
  }
});

// POST /assets/delete/:id
router.post('/delete/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) {
      req.flash('error', 'ไม่พบทรัพย์สิน');
      return res.redirect('/assets');
    }
    await asset.destroy();
    req.flash('success', 'ลบทรัพย์สินสำเร็จ');
    res.redirect('/assets');
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาดในการลบ');
    res.redirect('/assets');
  }
});

// GET /assets/:id (Detail) — MUST be LAST (catch-all for numeric IDs)
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category' }]
    });
    if (!asset) {
      req.flash('error', 'ไม่พบทรัพย์สิน');
      return res.redirect('/assets');
    }

    const withdrawalCount = await Withdrawal.count({ where: { asset_id: asset.id } });
    const borrowCount = await Borrow.count({ where: { asset_id: asset.id } });
    const activeBorrows = await Borrow.count({ where: { asset_id: asset.id, status: 'borrowing' } });

    const recentWithdrawals = await Withdrawal.findAll({
      where: { asset_id: asset.id },
      include: [{ model: User, as: 'user', attributes: ['full_name'], paranoid: false }],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    const recentBorrows = await Borrow.findAll({
      where: { asset_id: asset.id },
      include: [{ model: User, as: 'user', attributes: ['full_name'], paranoid: false }],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    res.render('assets/show', {
      title: asset.name,
      asset,
      withdrawalCount,
      borrowCount,
      activeBorrows,
      recentWithdrawals,
      recentBorrows
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาด');
    res.redirect('/assets');
  }
});

module.exports = router;
