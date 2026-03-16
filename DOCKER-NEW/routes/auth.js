const express = require('express');
const router = express.Router();
const { User } = require('../models');

// GET /login
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('login', { title: 'เข้าสู่ระบบ', layout: false, csrfToken: req.csrfToken() });
});

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      req.flash('error', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      return res.redirect('/login');
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      req.flash('error', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      return res.redirect('/login');
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role
    };

    req.flash('success', `ยินดีต้อนรับ ${user.full_name}`);
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error', 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    res.redirect('/login');
  }
});

// GET /logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;
