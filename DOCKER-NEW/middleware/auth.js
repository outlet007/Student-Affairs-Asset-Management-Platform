// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  req.flash('error', 'กรุณาเข้าสู่ระบบก่อน');
  res.redirect('/login');
};

const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  req.flash('error', 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
  res.redirect('/dashboard');
};

module.exports = { isAuthenticated, isAdmin };
