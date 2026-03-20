const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const { Asset, Category, Department } = require('../models');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { Op } = require('sequelize');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `import_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedExts = ['.xlsx', '.xls'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExts.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('รองรับเฉพาะไฟล์ .xlsx และ .xls เท่านั้น'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// GET /import — Main import page
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
    let departments = [];
    if (req.session.user.role === 'superadmin') {
        departments = await Department.findAll({ order: [['name', 'ASC']] });
    }
    res.render('import/index', {
        title: 'นำเข้าข้อมูล',
        results: null,
        departments
    });
});

// GET /import/template — Download Excel template
router.get('/template', isAuthenticated, isAdmin, async (req, res) => {
    try {
        // Fetch categories for reference
        const categories = await Category.findAll({ order: [['name', 'ASC']] });
        const categoryNames = categories.map(c => c.name);

        // Create workbook
        const wb = XLSX.utils.book_new();

        // --- Sheet 1: Data Template ---
        const templateHeaders = [
            'ชื่อทรัพย์สิน (name)',
            'รายละเอียด (description)',
            'หมวดหมู่ (category)',
            'ประเภท (type)',
            'จำนวน (quantity)',
            'หน่วย (unit)',
            'ราคาต่อหน่วย (price_per_unit)',
            'สถานที่เก็บ (location)',
            'จำนวนขั้นต่ำ (min_quantity)'
        ];

        // Example row
        const exampleRow = [
            'ปากกาลูกลื่น',
            'ปากกาลูกลื่นสีน้ำเงิน',
            categoryNames[0] || 'เครื่องเขียน',
            'consumable',
            '100',
            'ด้าม',
            '15',
            'ห้องพัสดุ ชั้น 1',
            '10'
        ];

        const wsData = [templateHeaders, exampleRow];
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Set column widths
        ws['!cols'] = [
            { wch: 25 }, { wch: 30 }, { wch: 20 },
            { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 18 },
            { wch: 25 }, { wch: 18 }
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'ข้อมูลทรัพย์สิน');

        // --- Sheet 2: Instructions ---
        const instructions = [
            ['คู่มือการกรอกข้อมูล'],
            [],
            ['คอลัมน์', 'คำอธิบาย', 'จำเป็น', 'ตัวอย่าง'],

            ['ชื่อทรัพย์สิน (name)', 'ชื่อของทรัพย์สินหรือวัสดุ', 'ใช่', 'ปากกาลูกลื่น'],
            ['รายละเอียด (description)', 'คำอธิบายเพิ่มเติม', 'ไม่', 'ปากกาลูกลื่นสีน้ำเงิน'],
            ['หมวดหมู่ (category)', 'ชื่อหมวดหมู่ที่มีในระบบ (ดู Sheet "หมวดหมู่ในระบบ")', 'ใช่', 'เครื่องเขียน'],
            ['ประเภท (type)', 'consumable = วัสดุสิ้นเปลือง, borrowable = ครุภัณฑ์ยืม-คืน', 'ใช่', 'consumable'],
            ['จำนวน (quantity)', 'จำนวนทรัพย์สิน (ตัวเลข)', 'ใช่', '100'],
            ['หน่วย (unit)', 'หน่วยนับ เช่น ชิ้น, อัน, ด้าม, ขวด', 'ใช่', 'ด้าม'],
            ['ราคาต่อหน่วย (price_per_unit)', 'ราคาต่อหน่วย (ตัวเลข)', 'ไม่', '15'],
            ['สถานที่เก็บ (location)', 'ตำแหน่งจัดเก็บ', 'ไม่', 'ห้องพัสดุ ชั้น 1'],
            ['จำนวนขั้นต่ำ (min_quantity)', 'จำนวนขั้นต่ำสำหรับแจ้งเตือน (ตัวเลข)', 'ไม่', '10'],
            [],
            ['หมายเหตุ:'],
            ['- กรอกข้อมูลใน Sheet "ข้อมูลทรัพย์สิน" เท่านั้น'],
            ['- แถวแรก (หัวข้อคอลัมน์) ห้ามแก้ไข'],
            ['- แถวตัวอย่างสามารถแก้ไขหรือลบได้'],
            ['- หมวดหมู่ต้องตรงกับชื่อที่มีในระบบ (ดู Sheet "หมวดหมู่ในระบบ")'],
            ['- ประเภทต้องเป็น "consumable" หรือ "borrowable" เท่านั้น']
        ];

        const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
        wsInstructions['!cols'] = [
            { wch: 35 }, { wch: 55 }, { wch: 10 }, { wch: 20 }
        ];
        XLSX.utils.book_append_sheet(wb, wsInstructions, 'คู่มือ');

        // --- Sheet 3: Available Categories ---
        const catData = [['ชื่อหมวดหมู่', 'รหัส SKU']];
        categories.forEach(c => {
            catData.push([c.name, c.sku_prefix]);
        });
        const wsCat = XLSX.utils.aoa_to_sheet(catData);
        wsCat['!cols'] = [{ wch: 30 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, wsCat, 'หมวดหมู่ในระบบ');

        // Write to buffer and send
        const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename=template_import_assets.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buf);
    } catch (error) {
        console.error('Template download error:', error);
        req.flash('error', 'เกิดข้อผิดพลาดในการสร้างไฟล์ Template');
        res.redirect('/import');
    }
});

// POST /import/upload — Upload & process Excel file
router.post('/upload', isAuthenticated, isAdmin, (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            req.flash('error', 'ไฟล์มีขนาดเกิน 5MB');
            return res.redirect('/import');
        } else if (err) {
            req.flash('error', err.message);
            return res.redirect('/import');
        }
        next();
    });
}, async (req, res) => {
    if (!req.file) {
        req.flash('error', 'กรุณาเลือกไฟล์ Excel');
        return res.redirect('/import');
    }

    const results = { success: [], errors: [], total: 0 };
    const filePath = req.file.path;

    // Determine department_id for imported assets
    let importDeptId = null;
    let importDeptCode = '';
    if (req.session.user.role === 'superadmin') {
      importDeptId = req.body.department_id || null;
      if (importDeptId) {
        const dept = await Department.findByPk(importDeptId);
        if (dept && dept.code) {
          importDeptCode = dept.code;
        }
      }
    } else {
      importDeptId = req.session.user.department_id;
      if (importDeptId) {
        const dept = await Department.findByPk(importDeptId);
        if (dept && dept.code) {
          importDeptCode = dept.code;
        }
      }
    }

    try {
        // Read uploaded file
        const wb = XLSX.readFile(filePath);
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json(ws, { defval: '' });

        results.total = data.length;

        if (data.length === 0) {
            req.flash('error', 'ไฟล์ไม่มีข้อมูล');
            return res.redirect('/import');
        }

        // Fetch all categories keyed by name
        const categories = await Category.findAll();
        const categoryMap = {};
        categories.forEach(c => {
            categoryMap[c.name.trim().toLowerCase()] = c;
        });

        // Process each row
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowNum = i + 2; // +2 because row 1 is header

            try {
                // Map columns (support both Thai and English header names)
                const name = String(row['ชื่อทรัพย์สิน (name)'] || row['name'] || '').trim();
                const description = String(row['รายละเอียด (description)'] || row['description'] || '').trim();
                const categoryName = String(row['หมวดหมู่ (category)'] || row['category'] || '').trim();
                const type = String(row['ประเภท (type)'] || row['type'] || '').trim().toLowerCase();
                const quantity = parseInt(row['จำนวน (quantity)'] || row['quantity'] || 0);
                const unit = String(row['หน่วย (unit)'] || row['unit'] || 'ชิ้น').trim();
                const pricePerUnit = parseFloat(row['ราคาต่อหน่วย (price_per_unit)'] || row['price_per_unit'] || 0);
                const location = String(row['สถานที่เก็บ (location)'] || row['location'] || '').trim();
                const minQuantity = parseInt(row['จำนวนขั้นต่ำ (min_quantity)'] || row['min_quantity'] || 0);
                let assetCode = '';

                // Validate required fields
                const errors = [];
                if (!name) errors.push('ชื่อทรัพย์สินจำเป็น');
                if (!categoryName) errors.push('หมวดหมู่จำเป็น');
                if (!type || !['consumable', 'borrowable'].includes(type)) {
                    errors.push('ประเภทต้องเป็น consumable หรือ borrowable');
                }
                if (isNaN(quantity) || quantity < 0) errors.push('จำนวนไม่ถูกต้อง');
                if (!unit) errors.push('หน่วยจำเป็น');

                // Find category
                const category = categoryMap[categoryName.toLowerCase()];
                if (!category) {
                    errors.push(`ไม่พบหมวดหมู่ "${categoryName}" ในระบบ`);
                }

                if (errors.length > 0) {
                    results.errors.push({ row: rowNum, name: name || `(แถวที่ ${rowNum})`, errors });
                    continue;
                }

                // Auto-generate asset code if not provided
                if (!assetCode && category) {
                    const deptPart = importDeptCode ? importDeptCode + '-' : '';
                    const prefix = deptPart + category.sku_prefix.toUpperCase();
                    const existingAssets = await Asset.findAll({
                        attributes: ['asset_code'],
                        where: { asset_code: { [Op.like]: `${prefix}-%` } }
                    });
                    let maxNum = 0;
                    existingAssets.forEach(a => {
                        const match = a.asset_code.match(/-(\d+)$/);
                        if (match) {
                            const num = parseInt(match[1]);
                            if (num > maxNum) maxNum = num;
                        }
                    });
                    let nextNum = maxNum + 1;
                    assetCode = `${prefix}-${String(nextNum).padStart(4, '0')}`;
                    // Ensure uniqueness
                    let exists = await Asset.findOne({ where: { asset_code: assetCode } });
                    while (exists) {
                        nextNum++;
                        assetCode = `${prefix}-${String(nextNum).padStart(4, '0')}`;
                        exists = await Asset.findOne({ where: { asset_code: assetCode } });
                    }
                }

                // Check for duplicate asset_code
                if (assetCode) {
                    const existing = await Asset.findOne({ where: { asset_code: assetCode } });
                    if (existing) {
                        results.errors.push({
                            row: rowNum,
                            name,
                            errors: [`รหัสทรัพย์สิน "${assetCode}" มีอยู่ในระบบแล้ว`]
                        });
                        continue;
                    }
                }

                // Create asset with department_id
                await Asset.create({
                    asset_code: assetCode,
                    name,
                    description,
                    category_id: category.id,
                    department_id: importDeptId,
                    type,
                    quantity: quantity || 0,
                    unit,
                    price_per_unit: pricePerUnit || 0,
                    location,
                    min_quantity: minQuantity || 0,
                    status: 'active'
                });

                results.success.push({ row: rowNum, name, assetCode });

            } catch (rowError) {
                console.error(`Row ${rowNum} error:`, rowError);
                results.errors.push({
                    row: rowNum,
                    name: `(แถวที่ ${rowNum})`,
                    errors: [rowError.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ']
                });
            }
        }

        // Clean up uploaded file
        try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }

        let departments = [];
        if (req.session.user.role === 'superadmin') {
            departments = await Department.findAll({ order: [['name', 'ASC']] });
        }

        res.render('import/index', {
            title: 'นำเข้าข้อมูล',
            results,
            departments
        });

    } catch (error) {
        console.error('Import error:', error);
        try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
        req.flash('error', 'เกิดข้อผิดพลาดในการอ่านไฟล์ กรุณาตรวจสอบว่าไฟล์เป็น Excel ที่ถูกต้อง');
        res.redirect('/import');
    }
});

module.exports = router;
