const express = require('express');
const router = express.Router();
const { Category, Asset } = require('../models');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const sequelize = require('../config/database');
const { fn, col, literal } = require('sequelize');

// GET /categories
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { sort, order } = req.query;

    // Validate sort fields
    const allowedSortFields = ['sku_prefix', 'name', 'description', 'assetCount'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'sku_prefix';
    const sortOrder = ['ASC', 'DESC'].includes((order || '').toUpperCase()) ? order.toUpperCase() : 'ASC';

    // Build order clause
    let orderClause;
    if (sortField === 'assetCount') {
      orderClause = [[literal('assetCount'), sortOrder]];
    } else {
      orderClause = [[sortField, sortOrder]];
    }

    const categories = await Category.findAll({
      attributes: {
        include: [
          [fn('COUNT', col('assets.id')), 'assetCount']
        ]
      },
      include: [{
        model: Asset,
        as: 'assets',
        attributes: []
      }],
      group: ['Category.id'],
      order: orderClause
    });
    res.render('categories/index', {
      title: 'หมวดหมู่',
      categories,
      filters: { sort: sortField, order: sortOrder }
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาด');
    res.redirect('/dashboard');
  }
});

// GET /categories/create
router.get('/create', isAuthenticated, isAdmin, (req, res) => {
  res.render('categories/create', { title: 'เพิ่มหมวดหมู่' });
});

// POST /categories/create
router.post('/create', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, description, sku_prefix } = req.body;
    await Category.create({ name, description, sku_prefix });
    req.flash('success', 'เพิ่มหมวดหมู่สำเร็จ');
    res.redirect('/categories');
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่');
    res.redirect('/categories/create');
  }
});

// GET /categories/edit/:id
router.get('/edit/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      req.flash('error', 'ไม่พบหมวดหมู่');
      return res.redirect('/categories');
    }
    res.render('categories/edit', { title: 'แก้ไขหมวดหมู่', category });
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาด');
    res.redirect('/categories');
  }
});

// POST /categories/edit/:id
router.post('/edit/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      req.flash('error', 'ไม่พบหมวดหมู่');
      return res.redirect('/categories');
    }
    const { name, description, sku_prefix } = req.body;
    category.name = name;
    category.description = description;
    category.sku_prefix = sku_prefix;
    await category.save();
    req.flash('success', 'แก้ไขหมวดหมู่สำเร็จ');
    res.redirect('/categories');
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาดในการแก้ไข');
    res.redirect('/categories');
  }
});

// POST /categories/delete/:id
router.post('/delete/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      req.flash('error', 'ไม่พบหมวดหมู่');
      return res.redirect('/categories');
    }
    await category.destroy();
    req.flash('success', 'ลบหมวดหมู่สำเร็จ');
    res.redirect('/categories');
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาดในการลบ');
    res.redirect('/categories');
  }
});

module.exports = router;
