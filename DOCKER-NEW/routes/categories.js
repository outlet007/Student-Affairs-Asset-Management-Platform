const express = require('express');
const router = express.Router();
const { Category, Asset, Department } = require('../models');
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

    // Department filter: admin/staff see only their department's categories
    const where = {};
    if (req.session.user.role !== 'superadmin' && req.session.user.department_id) {
      where.department_id = req.session.user.department_id;
    }

    const categories = await Category.findAll({
      where,
      attributes: {
        include: [
          [fn('COUNT', col('assets.id')), 'assetCount']
        ]
      },
      include: [
        {
          model: Asset,
          as: 'assets',
          attributes: []
        },
        {
          model: Department,
          as: 'department',
          attributes: ['name']
        }
      ],
      group: ['Category.id', 'department.id'],
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
router.get('/create', isAuthenticated, isAdmin, async (req, res) => {
  try {
    let departments = [];
    if (req.session.user.role === 'superadmin') {
      departments = await Department.findAll({ order: [['name', 'ASC']] });
    }
    res.render('categories/create', { title: 'เพิ่มหมวดหมู่', departments });
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาด');
    res.redirect('/categories');
  }
});

// POST /categories/create
router.post('/create', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, description, sku_prefix, department_id } = req.body;

    // Superadmin selects department, admin auto-assigns own department
    let finalDeptId = null;
    if (req.session.user.role === 'superadmin') {
      finalDeptId = department_id || null;
    } else {
      finalDeptId = req.session.user.department_id;
    }

    await Category.create({ name, description, sku_prefix, department_id: finalDeptId });
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
    const category = await Category.findByPk(req.params.id, {
      include: [{ model: Department, as: 'department' }]
    });
    if (!category) {
      req.flash('error', 'ไม่พบหมวดหมู่');
      return res.redirect('/categories');
    }

    // Admin can only edit categories in their department
    if (req.session.user.role !== 'superadmin' && category.department_id !== req.session.user.department_id) {
      req.flash('error', 'คุณไม่มีสิทธิ์แก้ไขหมวดหมู่นอกหน่วยงาน');
      return res.redirect('/categories');
    }

    let departments = [];
    if (req.session.user.role === 'superadmin') {
      departments = await Department.findAll({ order: [['name', 'ASC']] });
    }
    res.render('categories/edit', { title: 'แก้ไขหมวดหมู่', category, departments });
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

    // Admin can only edit categories in their department
    if (req.session.user.role !== 'superadmin' && category.department_id !== req.session.user.department_id) {
      req.flash('error', 'คุณไม่มีสิทธิ์แก้ไขหมวดหมู่นอกหน่วยงาน');
      return res.redirect('/categories');
    }

    const { name, description, sku_prefix, department_id } = req.body;
    category.name = name;
    category.description = description;
    category.sku_prefix = sku_prefix;

    if (req.session.user.role === 'superadmin') {
      category.department_id = department_id || null;
    }

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

    // Admin can only delete categories in their department
    if (req.session.user.role !== 'superadmin' && category.department_id !== req.session.user.department_id) {
      req.flash('error', 'คุณไม่มีสิทธิ์ลบหมวดหมู่นอกหน่วยงาน');
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
