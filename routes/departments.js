const express = require('express');
const router = express.Router();
const { Department, Asset, User } = require('../models');
const { isAuthenticated, isSuperAdmin } = require('../middleware/auth');
const sequelize = require('../config/database');
const { fn, col } = require('sequelize');

// GET /departments
router.get('/', isAuthenticated, isSuperAdmin, async (req, res) => {
  try {
    const departments = await Department.findAll({
      attributes: {
        include: [
          [fn('COUNT', col('departmentAssets.id')), 'assetCount']
        ]
      },
      include: [
        {
          model: Asset,
          as: 'departmentAssets',
          attributes: []
        }
      ],
      group: ['Department.id'],
      order: [['name', 'ASC']]
    });

    // Get user count per department
    for (const dept of departments) {
      dept.dataValues.userCount = await User.count({ where: { department_id: dept.id } });
    }

    res.render('departments/index', { title: 'จัดการหน่วยงาน', departments });
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาด');
    res.redirect('/dashboard');
  }
});

// GET /departments/create
router.get('/create', isAuthenticated, isSuperAdmin, (req, res) => {
  res.render('departments/create', { title: 'เพิ่มหน่วยงาน' });
});

// POST /departments/create
router.post('/create', isAuthenticated, isSuperAdmin, async (req, res) => {
  try {
    const { name, code, description } = req.body;

    const existingName = await Department.findOne({ where: { name } });
    if (existingName) {
      req.flash('error', 'ชื่อหน่วยงานนี้มีอยู่แล้ว');
      return res.redirect('/departments/create');
    }

    if (code) {
      const existingCode = await Department.findOne({ where: { code } });
      if (existingCode) {
        req.flash('error', 'รหัสหน่วยงานนี้มีอยู่แล้ว');
        return res.redirect('/departments/create');
      }
    }

    await Department.create({ name, code: code || null, description });
    req.flash('success', 'เพิ่มหน่วยงานสำเร็จ');
    res.redirect('/departments');
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาดในการเพิ่มหน่วยงาน');
    res.redirect('/departments/create');
  }
});

// GET /departments/edit/:id
router.get('/edit/:id', isAuthenticated, isSuperAdmin, async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      req.flash('error', 'ไม่พบหน่วยงาน');
      return res.redirect('/departments');
    }
    res.render('departments/edit', { title: 'แก้ไขหน่วยงาน', department });
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาด');
    res.redirect('/departments');
  }
});

// POST /departments/edit/:id
router.post('/edit/:id', isAuthenticated, isSuperAdmin, async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      req.flash('error', 'ไม่พบหน่วยงาน');
      return res.redirect('/departments');
    }

    const { name, code, description } = req.body;

    if (code && code !== department.code) {
      const existingCode = await Department.findOne({ where: { code } });
      if (existingCode) {
        req.flash('error', 'รหัสหน่วยงานนี้มีอยู่แล้ว');
        return res.redirect(`/departments/edit/${department.id}`);
      }
    }

    department.name = name;
    department.code = code || null;
    department.description = description;
    await department.save();

    req.flash('success', 'แก้ไขหน่วยงานสำเร็จ');
    res.redirect('/departments');
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาดในการแก้ไข');
    res.redirect('/departments');
  }
});

// POST /departments/delete/:id
router.post('/delete/:id', isAuthenticated, isSuperAdmin, async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      req.flash('error', 'ไม่พบหน่วยงาน');
      return res.redirect('/departments');
    }

    // Check if department has users or assets
    const userCount = await User.count({ where: { department_id: department.id } });
    const assetCount = await Asset.count({ where: { department_id: department.id } });

    if (userCount > 0 || assetCount > 0) {
      req.flash('error', `ไม่สามารถลบหน่วยงานนี้ได้ เนื่องจากมีผู้ใช้งาน ${userCount} คน และทรัพย์สิน ${assetCount} รายการ`);
      return res.redirect('/departments');
    }

    await department.destroy();
    req.flash('success', 'ลบหน่วยงานสำเร็จ');
    res.redirect('/departments');
  } catch (error) {
    console.error(error);
    req.flash('error', 'เกิดข้อผิดพลาดในการลบ');
    res.redirect('/departments');
  }
});

module.exports = router;
