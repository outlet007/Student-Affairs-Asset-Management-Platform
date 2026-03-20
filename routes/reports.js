const express = require('express');
const router = express.Router();
const { Asset, Category, Withdrawal, Borrow, User, Department } = require('../models');
const { isAuthenticated } = require('../middleware/auth');
const { Op } = require('sequelize');
const { Parser } = require('json2csv');

// Helper: get department filter
function getDeptFilter(req) {
  if (req.session.user.role === 'superadmin') return {};
  return { department_id: req.session.user.department_id };
}

// GET /reports
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { start_date, end_date, report_type, department_id } = req.query;
    const dateFilter = {};

    if (start_date) {
      dateFilter[Op.gte] = new Date(start_date);
    }
    if (end_date) {
      const endDate = new Date(end_date);
      endDate.setHours(23, 59, 59, 999);
      dateFilter[Op.lte] = endDate;
    }

    const deptFilter = getDeptFilter(req);
    // Superadmin can filter by specific department
    if (department_id && req.session.user.role === 'superadmin') {
      deptFilter.department_id = department_id;
    }

    let reportData = [];
    const type = report_type || 'assets';

    if (type === 'assets') {
      reportData = await Asset.findAll({
        where: deptFilter,
        include: [{ model: Category, as: 'category' }],
        order: [['name', 'ASC']]
      });
    } else if (type === 'withdrawals') {
      const where = {};
      if (start_date || end_date) {
        where.withdrawal_date = dateFilter;
      }
      // Filter by department via asset
      const assetInclude = { model: Asset, as: 'asset' };
      if (deptFilter.department_id) {
        assetInclude.where = { department_id: deptFilter.department_id };
      }
      reportData = await Withdrawal.findAll({
        where,
        include: [
          assetInclude,
          { model: User, as: 'user', paranoid: false },
          { model: User, as: 'approver', paranoid: false }
        ],
        order: [['created_at', 'DESC']]
      });
    } else if (type === 'borrows') {
      const where = {};
      if (start_date || end_date) {
        where.borrow_date = dateFilter;
      }
      const assetInclude = { model: Asset, as: 'asset' };
      if (deptFilter.department_id) {
        assetInclude.where = { department_id: deptFilter.department_id };
      }
      reportData = await Borrow.findAll({
        where,
        include: [
          assetInclude,
          { model: User, as: 'user', paranoid: false },
          { model: User, as: 'approver', paranoid: false }
        ],
        order: [['created_at', 'DESC']]
      });
    }

    let departments = [];
    if (req.session.user.role === 'superadmin') {
      departments = await Department.findAll({ order: [['name', 'ASC']] });
    }

    res.render('reports/index', {
      title: 'รายงาน',
      reportData,
      departments,
      filters: {
        start_date: start_date || '',
        end_date: end_date || '',
        report_type: type,
        department_id: department_id || ''
      }
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาดในการโหลดรายงาน');
    res.redirect('/dashboard');
  }
});

// GET /reports/export/csv
router.get('/export/csv', isAuthenticated, async (req, res) => {
  try {
    const { start_date, end_date, report_type, department_id } = req.query;
    const dateFilter = {};

    if (start_date) dateFilter[Op.gte] = new Date(start_date);
    if (end_date) {
      const endDate = new Date(end_date);
      endDate.setHours(23, 59, 59, 999);
      dateFilter[Op.lte] = endDate;
    }

    const deptFilter = getDeptFilter(req);
    if (department_id && req.session.user.role === 'superadmin') {
      deptFilter.department_id = department_id;
    }
    let data = [];
    let fields = [];
    let filename = 'report';
    const type = report_type || 'assets';

    if (type === 'assets') {
      const assets = await Asset.findAll({
        where: deptFilter,
        include: [{ model: Category, as: 'category' }],
        raw: true, nest: true
      });
      data = assets.map(a => ({
        'รหัสทรัพย์สิน': a.asset_code,
        'ชื่อ': a.name,
        'หมวดหมู่': a.category ? a.category.name : '-',
        'ประเภท': a.type === 'consumable' ? 'ใช้แล้วหมดไป' : 'ยืม-คืน',
        'จำนวนคงเหลือ': a.quantity,
        'หน่วย': a.unit,
        'ราคาต่อหน่วย': a.price_per_unit,
        'สถานที่': a.location || '-',
        'วันที่เพิ่ม': a.createdAt ? new Date(a.createdAt).toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'
      }));
      fields = ['รหัสทรัพย์สิน', 'ชื่อ', 'หมวดหมู่', 'ประเภท', 'จำนวนคงเหลือ', 'หน่วย', 'ราคาต่อหน่วย', 'สถานที่', 'วันที่เพิ่ม'];
      filename = 'assets_report';
    } else if (type === 'withdrawals') {
      const where = {};
      if (start_date || end_date) where.withdrawal_date = dateFilter;
      const assetInclude = { model: Asset, as: 'asset' };
      if (deptFilter.department_id) {
        assetInclude.where = { department_id: deptFilter.department_id };
      }
      const withdrawals = await Withdrawal.findAll({
        where,
        include: [
          assetInclude,
          { model: User, as: 'user', paranoid: false }
        ],
        raw: true, nest: true
      });
      data = withdrawals.map(w => ({
        'วันที่เบิก': w.withdrawal_date ? new Date(w.withdrawal_date).toLocaleDateString('th-TH') : '-',
        'ทรัพย์สิน': w.asset ? w.asset.name : '-',
        'ผู้เบิก': w.user ? w.user.full_name : '-',
        'จำนวน': w.quantity,
        'วัตถุประสงค์': w.purpose || '-',
        'สถานะ': w.status === 'approved' ? 'อนุมัติ' : w.status === 'rejected' ? 'ปฏิเสธ' : 'รออนุมัติ'
      }));
      fields = ['วันที่เบิก', 'ทรัพย์สิน', 'ผู้เบิก', 'จำนวน', 'วัตถุประสงค์', 'สถานะ'];
      filename = 'withdrawals_report';
    } else if (type === 'borrows') {
      const where = {};
      if (start_date || end_date) where.borrow_date = dateFilter;
      const assetInclude = { model: Asset, as: 'asset' };
      if (deptFilter.department_id) {
        assetInclude.where = { department_id: deptFilter.department_id };
      }
      const borrows = await Borrow.findAll({
        where,
        include: [
          assetInclude,
          { model: User, as: 'user', paranoid: false }
        ],
        raw: true, nest: true
      });
      data = borrows.map(b => ({
        'วันที่ยืม': b.borrow_date ? new Date(b.borrow_date).toLocaleDateString('th-TH') : '-',
        'ทรัพย์สิน': b.asset ? b.asset.name : '-',
        'ผู้ยืม': b.user ? b.user.full_name : '-',
        'จำนวน': b.quantity,
        'วัตถุประสงค์': b.purpose || '-',
        'สถานะ': b.status === 'returned' ? 'คืนแล้ว' : b.status === 'overdue' ? 'เกินกำหนด' : 'กำลังยืม',
        'วันที่คืน': b.actual_return_date ? new Date(b.actual_return_date).toLocaleDateString('th-TH') : '-'
      }));
      fields = ['วันที่ยืม', 'ทรัพย์สิน', 'ผู้ยืม', 'จำนวน', 'วัตถุประสงค์', 'สถานะ', 'วันที่คืน'];
      filename = 'borrows_report';
    }

    if (data.length === 0) {
      req.flash('error', 'ไม่มีข้อมูลสำหรับ export');
      return res.redirect('/reports');
    }

    const parser = new Parser({ fields, withBOM: true });
    const csv = parser.parse(data);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}_${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('CSV Export error:', error.message);
    console.error('CSV Export stack:', error.stack);
    req.flash('error', 'เกิดข้อผิดพลาดในการ export: ' + error.message);
    res.redirect('/reports');
  }
});

module.exports = router;
