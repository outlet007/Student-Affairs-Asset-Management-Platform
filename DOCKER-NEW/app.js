require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const csrf = require('csurf');
const { sequelize, Withdrawal, Borrow } = require('./models');

const app = express();
const PORT = process.env.PORT || 8021;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Flash messages
app.use(flash());

// CSRF protection
const csrfProtection = csrf();
app.use(csrfProtection);

// Global variables
app.use(async (req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  res.locals.currentUser = req.session.user || null;
  res.locals.currentPath = req.path;
  res.locals.csrfToken = req.csrfToken();

  // Notification badge counts (only if user is logged in)
  if (req.session.user) {
    try {
      res.locals.pendingWithdrawalCount = await Withdrawal.count({ where: { status: 'pending' } });
      res.locals.overdueBorrowCount = await Borrow.count({ where: { status: 'overdue' } });
      res.locals.pendingBorrowCount = await Borrow.count({ where: { status: 'pending' } });
    } catch (e) {
      res.locals.pendingWithdrawalCount = 0;
      res.locals.overdueBorrowCount = 0;
      res.locals.pendingBorrowCount = 0;
    }
  }

  next();
});

// CSRF error handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    req.flash('error', 'ฟอร์มหมดอายุ กรุณาลองใหม่อีกครั้ง');
    return res.redirect('back');
  }
  next(err);
});

// Routes
app.use('/', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/profile', require('./routes/profile'));
app.use('/users', require('./routes/users'));
app.use('/categories', require('./routes/categories'));
app.use('/assets', require('./routes/assets'));
app.use('/withdrawals', require('./routes/withdrawals'));
app.use('/borrows', require('./routes/borrows'));
app.use('/reports', require('./routes/reports'));
app.use('/import', require('./routes/import'));

// Root redirect
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.redirect('/login');
});

// 404
app.use((req, res) => {
  res.status(404).render('404', { title: '404 - ไม่พบหน้า', layout: false });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  req.flash('error', 'เกิดข้อผิดพลาดที่ไม่คาดคิด');
  res.redirect('/dashboard');
});

// Sync DB and start server
sequelize.sync().then(() => {
  console.log('Database synced successfully');
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Database sync error:', err);
});
