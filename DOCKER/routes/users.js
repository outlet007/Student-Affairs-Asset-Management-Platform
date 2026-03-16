const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// GET /users
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const users = await User.findAll({ 
      paranoid: false, 
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
router.get('/create', isAuthenticated, isAdmin, (req, res) => {
  res.render('users/create', { title: 'เพิ่มผู้ใช้งาน' });
});

// POST /users/create
router.post('/create', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { username, password, full_name, email, role } = req.body;
    
    const existing = await User.findOne({ where: { username }, paranoid: false });
    if (existing) {
      if (existing.deleted_at) {
        req.flash('error', 'ชื่อผู้ใช้นี้เคยถูกใช้งานและถูกลบไปแล้ว ไม่สามารถใช้ซ้ำได้');
      } else {
        req.flash('error', 'ชื่อผู้ใช้นี้มีอยู่แล้ว');
      }
      return res.redirect('/users/create');
    }

    await User.create({
      username,
      password_hash: password,
      full_name,
      email,
      role: role || 'staff'
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
    const user = await User.findByPk(req.params.id);
    if (!user) {
      req.flash('error', 'ไม่พบผู้ใช้งาน');
      return res.redirect('/users');
    }
    res.render('users/edit', { title: 'แก้ไขผู้ใช้งาน', user });
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

    const { full_name, email, role, password } = req.body;
    user.full_name = full_name;
    user.email = email;
    user.role = role;

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
