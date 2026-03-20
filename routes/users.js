const express = require('express');
const router = express.Router();
const { User, Department } = require('../models');
const { isAuthenticated, isAdmin, isSuperAdmin } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// GET /users
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const where = {};
    // admin sees only users in their department, superadmin sees all
    if (req.session.user.role === 'admin') {
      where.department_id = req.session.user.department_id;
    }

    const users = await User.findAll({
      where,
      paranoid: false,
      include: [{ model: Department, as: 'department' }],
      order: [['created_at', 'DESC']]
    });
    res.render('users/index', { title: 'จัดการผู้ใช้งาน', users });
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาด');
    res.redirect('/dashboard');
  }
});

// GET /users/create
router.get('/create', isAuthenticated, isAdmin, async (req, res) => {
  try {
    let departments;
    if (req.session.user.role === 'superadmin') {
      departments = await Department.findAll({ order: [['name', 'ASC']] });
    } else {
      departments = await Department.findAll({ where: { id: req.session.user.department_id }, order: [['name', 'ASC']] });
    }
    res.render('users/create', { title: 'เพิ่มผู้ใช้งาน', departments });
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาด');
    res.redirect('/users');
  }
});

// POST /users/create
router.post('/create', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { username, password, full_name, email, role, department_id } = req.body;
    
    const existing = await User.findOne({ where: { username }, paranoid: false });
    if (existing) {
      if (existing.deleted_at) {
        req.flash('error', 'ชื่อผู้ใช้นี้เคยถูกใช้งานและถูกลบไปแล้ว ไม่สามารถใช้ซ้ำได้');
      } else {
        req.flash('error', 'ชื่อผู้ใช้นี้มีอยู่แล้ว');
      }
      return res.redirect('/users/create');
    }

    // Only superadmin can create superadmin users
    let finalRole = role || 'staff';
    if (finalRole === 'superadmin' && req.session.user.role !== 'superadmin') {
      finalRole = 'staff';
    }

    // Admin can only create users in their own department
    let finalDeptId = department_id || null;
    if (req.session.user.role === 'admin') {
      finalDeptId = req.session.user.department_id;
    }

    await User.create({
      username,
      password_hash: password,
      full_name,
      email,
      role: finalRole,
      department_id: finalDeptId
    });

    req.flash('success', 'เพิ่มผู้ใช้งานสำเร็จ');
    res.redirect('/users');
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาดในการเพิ่มผู้ใช้');
    res.redirect('/users/create');
  }
});

// GET /users/edit/:id
router.get('/edit/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Department, as: 'department' }]
    });
    if (!user) {
      req.flash('error', 'ไม่พบผู้ใช้งาน');
      return res.redirect('/users');
    }

    // Admin can only edit users in their department
    if (req.session.user.role === 'admin' && user.department_id !== req.session.user.department_id) {
      req.flash('error', 'คุณไม่มีสิทธิ์แก้ไขผู้ใช้งานนอกหน่วยงาน');
      return res.redirect('/users');
    }

    let departments;
    if (req.session.user.role === 'superadmin') {
      departments = await Department.findAll({ order: [['name', 'ASC']] });
    } else {
      departments = await Department.findAll({ where: { id: req.session.user.department_id }, order: [['name', 'ASC']] });
    }

    res.render('users/edit', { title: 'แก้ไขผู้ใช้งาน', user, departments });
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาด');
    res.redirect('/users');
  }
});

// POST /users/edit/:id
router.post('/edit/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      req.flash('error', 'ไม่พบผู้ใช้งาน');
      return res.redirect('/users');
    }

    // Admin can only edit users in their department
    if (req.session.user.role === 'admin' && user.department_id !== req.session.user.department_id) {
      req.flash('error', 'คุณไม่มีสิทธิ์แก้ไขผู้ใช้งานนอกหน่วยงาน');
      return res.redirect('/users');
    }

    const { full_name, email, role, password, department_id, username } = req.body;
    user.full_name = full_name;
    user.email = email;

    // Only superadmin can update username
    if (req.session.user.role === 'superadmin' && username && username.trim() !== '') {
      // Check for duplicate username
      const existing = await User.findOne({ where: { username: username.trim(), id: { [require('sequelize').Op.ne]: user.id } }, paranoid: false });
      if (existing) {
        req.flash('error', 'ชื่อผู้ใช้นี้มีอยู่แล้ว');
        return res.redirect('/users/edit/' + user.id);
      }
      user.username = username.trim();
    }

    // Only superadmin can set superadmin role
    if (req.session.user.role === 'superadmin') {
      user.role = role;
      user.department_id = department_id || null;
    } else {
      // Admin can only set admin/staff
      user.role = (role === 'admin' || role === 'staff') ? role : 'staff';
      user.department_id = req.session.user.department_id;
    }

    if (password && password.trim() !== '') {
      user.password_hash = password;
    }

    await user.save();
    req.flash('success', 'แก้ไขผู้ใช้งานสำเร็จ');
    res.redirect('/users');
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาดในการแก้ไข');
    res.redirect('/users');
  }
});

// POST /users/delete/:id
router.post('/delete/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      req.flash('error', 'ไม่พบผู้ใช้งาน');
      return res.redirect('/users');
    }

    if (user.id === req.session.user.id) {
      req.flash('error', 'ไม่สามารถลบบัญชีตัวเองได้');
      return res.redirect('/users');
    }

    // Admin can only delete users in their department
    if (req.session.user.role === 'admin' && user.department_id !== req.session.user.department_id) {
      req.flash('error', 'คุณไม่มีสิทธิ์ลบผู้ใช้งานนอกหน่วยงาน');
      return res.redirect('/users');
    }

    await user.destroy();
    req.flash('success', 'ลบผู้ใช้งานสำเร็จ');
    res.redirect('/users');
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาดในการลบ');
    res.redirect('/users');
  }
});

// POST /users/restore/:id
router.post('/restore/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { paranoid: false });
    if (!user) {
      req.flash('error', 'ไม่พบผู้ใช้งาน');
      return res.redirect('/users');
    }

    if (!user.deleted_at) {
      req.flash('error', 'ผู้ใช้งานนี้ไม่ได้ถูกลบ');
      return res.redirect('/users');
    }

    await user.restore();
    req.flash('success', 'กู้คืนผู้ใช้งานสำเร็จ');
    res.redirect('/users');
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาดในการกู้คืน');
    res.redirect('/users');
  }
});

module.exports = router;
