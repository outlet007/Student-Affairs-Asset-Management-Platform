// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  req.flash('error', 'กรุณาเข้าสู่ระบบก่อน');
  res.redirect('/login');
};

const isAdmin = (req, res, next) => {
  if (req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'superadmin')) {
    return next();
  }
  req.flash('error', 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
  res.redirect('/dashboard');
};

const isSuperAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'superadmin') {
    return next();
  }
  req.flash('error', 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
  res.redirect('/dashboard');
};

module.exports = { isAuthenticated, isAdmin, isSuperAdmin };
