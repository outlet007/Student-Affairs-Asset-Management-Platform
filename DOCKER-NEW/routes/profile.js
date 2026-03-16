const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { isAuthenticated } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

// GET /profile
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findByPk(req.session.user.id);
    res.render('profile', { title: 'โปรไฟล์', user });
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาด');
    res.redirect('/dashboard');
  }
});

// POST /profile - Update profile info
router.post('/', isAuthenticated, [
  body('full_name').notEmpty().withMessage('กรุณากรอกชื่อ-นามสกุล').trim(),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('รูปแบบ email ไม่ถูกต้อง')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array().map(e => e.msg).join(', '));
      return res.redirect('/profile');
    }

    const user = await User.findByPk(req.session.user.id);
    const { full_name, email } = req.body;
    user.full_name = full_name;
    user.email = email || null;
    await user.save();

    // Update session
    req.session.user.full_name = full_name;

    req.flash('success', 'อัพเดตข้อมูลสำเร็จ');
    res.redirect('/profile');
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาดในการอัพเดต');
    res.redirect('/profile');
  }
});

// POST /profile/change-password
router.post('/change-password', isAuthenticated, [
  body('current_password').notEmpty().withMessage('กรุณากรอกรหัสผ่านปัจจุบัน'),
  body('new_password').isLength({ min: 6 }).withMessage('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร'),
  body('confirm_password').custom((value, { req }) => {
    if (value !== req.body.new_password) {
      throw new Error('รหัสผ่านยืนยันไม่ตรงกัน');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array().map(e => e.msg).join(', '));
      return res.redirect('/profile');
    }

    const user = await User.findByPk(req.session.user.id);
    const { current_password, new_password } = req.body;

    const isValid = await user.validatePassword(current_password);
    if (!isValid) {
      req.flash('error', 'รหัสผ่านปัจจุบันไม่ถูกต้อง');
      return res.redirect('/profile');
    }

    user.password_hash = new_password;
    await user.save();

    req.flash('success', 'เปลี่ยนรหัสผ่านสำเร็จ');
    res.redirect('/profile');
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
    res.redirect('/profile');
  }
});

module.exports = router;
