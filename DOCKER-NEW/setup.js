/**
 * Database Setup Script
 * Creates database, syncs tables, and seeds initial admin user
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function setup() {
  console.log('🔧 Setting up database...\n');

  // Step 1: Create database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3036,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  const dbName = process.env.DB_NAME || 'asset_management';
  await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  console.log(`✅ Database "${dbName}" created/verified`);
  await connection.end();

  // Step 2: Sync models (create tables)
  const { sequelize, User, Category, Asset } = require('./models');
  await sequelize.sync({ alter: true });
  console.log('✅ Tables synced\n');

  // Step 3: Seed admin user
  const adminExists = await User.findOne({ where: { username: 'admin' } });
  if (!adminExists) {
    await User.create({
      username: 'admin',
      password_hash: 'admin123',
      full_name: 'ผู้ดูแลระบบ',
      email: 'admin@example.com',
      role: 'admin'
    });
    console.log('✅ Admin user created (username: admin, password: admin123)');
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  // Step 4: Seed sample categories
  const catCount = await Category.count();
  if (catCount === 0) {
    await Category.bulkCreate([
      { name: 'อุปกรณ์สำนักงาน', sku_prefix: 'OFC', description: 'เครื่องเขียน กระดาษ หมึกพิมพ์ ฯลฯ' },
      { name: 'อุปกรณ์คอมพิวเตอร์', sku_prefix: 'COM', description: 'คอมพิวเตอร์ จอภาพ เครื่องพิมพ์ ฯลฯ' },
      { name: 'เฟอร์นิเจอร์', sku_prefix: 'FUR', description: 'โต๊ะ เก้าอี้ ตู้เก็บของ ฯลฯ' },
      { name: 'อุปกรณ์กีฬา', sku_prefix: 'SPT', description: 'ลูกบอล ตาข่าย อุปกรณ์กีฬาต่างๆ' },
      { name: 'อื่นๆ', sku_prefix: 'OTH', description: 'สิ่งของอื่นๆ' }
    ]);
    console.log('✅ Sample categories created');
  }

  // Step 5: Seed sample assets
  const assetCount = await Asset.count();
  if (assetCount === 0) {
    const categories = await Category.findAll();
    const catMap = {};
    categories.forEach(c => catMap[c.name] = c.id);

    await Asset.bulkCreate([
            // === อุปกรณ์สำนักงาน (consumable) ===
            { asset_code: 'OFC-001', name: 'กระดาษ A4 80 แกรม', description: 'กระดาษ A4', category_id: catMap['อุปกรณ์สำนักงาน'], type: 'consumable', quantity: 200, unit: 'รีม', price_per_unit: 120.00, location: 'ห้องพัสดุ', min_quantity: 50, status: 'active' },
            { asset_code: 'OFC-002', name: 'ปากกาลูกลื่น สีน้ำเงิน', description: 'ปากกาลูกลื่น', category_id: catMap['อุปกรณ์สำนักงาน'], type: 'consumable', quantity: 500, unit: 'ด้าม', price_per_unit: 8.00, location: 'ห้องพัสดุ', min_quantity: 100, status: 'active' },
            { asset_code: 'OFC-003', name: 'แฟ้มเอกสาร A4', description: 'แฟ้มเอกสาร', category_id: catMap['อุปกรณ์สำนักงาน'], type: 'consumable', quantity: 150, unit: 'แฟ้ม', price_per_unit: 25.00, location: 'ห้องพัสดุ', min_quantity: 30, status: 'active' },
            { asset_code: 'OFC-004', name: 'หมึกเครื่องพิมพ์ HP 680 สีดำ', description: 'ตลับหมึก', category_id: catMap['อุปกรณ์สำนักงาน'], type: 'consumable', quantity: 30, unit: 'ตลับ', price_per_unit: 350.00, location: 'ห้องพัสดุ', min_quantity: 10, status: 'active' },
            { asset_code: 'OFC-005', name: 'สมุดบันทึก A5', description: 'สมุดบันทึก', category_id: catMap['อุปกรณ์สำนักงาน'], type: 'consumable', quantity: 100, unit: 'เล่ม', price_per_unit: 45.00, location: 'ห้องพัสดุ', min_quantity: 20, status: 'active' },

            // === อุปกรณ์คอมพิวเตอร์ (borrowable + consumable) ===
            { asset_code: 'COM-001', name: 'โน้ตบุ๊ค Lenovo ThinkPad', description: 'โน้ตบุ๊ค', category_id: catMap['อุปกรณ์คอมพิวเตอร์'], type: 'borrowable', quantity: 10, unit: 'เครื่อง', price_per_unit: 22000.00, location: 'ห้อง IT', min_quantity: 2, status: 'active' },
            { asset_code: 'COM-002', name: 'โปรเจคเตอร์ Epson EB-X51', description: 'โปรเจคเตอร์', category_id: catMap['อุปกรณ์คอมพิวเตอร์'], type: 'borrowable', quantity: 5, unit: 'เครื่อง', price_per_unit: 15000.00, location: 'ห้อง IT', min_quantity: 1, status: 'active' },
            { asset_code: 'COM-003', name: 'เมาส์ไร้สาย Logitech', description: 'เมาส์', category_id: catMap['อุปกรณ์คอมพิวเตอร์'], type: 'consumable', quantity: 40, unit: 'ตัว', price_per_unit: 590.00, location: 'ห้อง IT', min_quantity: 5, status: 'active' },
            { asset_code: 'COM-004', name: 'คีย์บอร์ด USB Logitech', description: 'คีย์บอร์ด', category_id: catMap['อุปกรณ์คอมพิวเตอร์'], type: 'consumable', quantity: 35, unit: 'ตัว', price_per_unit: 390.00, location: 'ห้อง IT', min_quantity: 5, status: 'active' },
            { asset_code: 'COM-005', name: 'USB Flash Drive 32GB', description: 'แฟลชไดรฟ์', category_id: catMap['อุปกรณ์คอมพิวเตอร์'], type: 'consumable', quantity: 50, unit: 'อัน', price_per_unit: 150.00, location: 'ห้อง IT', min_quantity: 10, status: 'active' },

            // === เฟอร์นิเจอร์ (borrowable) ===
            { asset_code: 'FUR-001', name: 'โต๊ะพับอเนกประสงค์', description: 'โต๊ะพับ', category_id: catMap['เฟอร์นิเจอร์'], type: 'borrowable', quantity: 20, unit: 'ตัว', price_per_unit: 1200.00, location: 'โกดัง', min_quantity: 5, status: 'active' },
            { asset_code: 'FUR-002', name: 'เก้าอี้พับ', description: 'เก้าอี้', category_id: catMap['เฟอร์นิเจอร์'], type: 'borrowable', quantity: 100, unit: 'ตัว', price_per_unit: 450.00, location: 'โกดัง', min_quantity: 20, status: 'active' },
            { asset_code: 'FUR-003', name: 'ตู้เอกสาร 4 ลิ้นชัก', description: 'ตู้เอกสาร', category_id: catMap['เฟอร์นิเจอร์'], type: 'borrowable', quantity: 8, unit: 'ตู้', price_per_unit: 3500.00, location: 'โกดัง', min_quantity: 2, status: 'active' },
            { asset_code: 'FUR-004', name: 'ไวท์บอร์ดขาตั้ง', description: 'ไวท์บอร์ด', category_id: catMap['เฟอร์นิเจอร์'], type: 'borrowable', quantity: 6, unit: 'ตัว', price_per_unit: 2800.00, location: 'โกดัง', min_quantity: 2, status: 'active' },

            // === อุปกรณ์กีฬา (borrowable + consumable) ===
            { asset_code: 'SPT-001', name: 'ลูกฟุตบอล Molten', description: 'ลูกฟุตบอล', category_id: catMap['อุปกรณ์กีฬา'], type: 'borrowable', quantity: 15, unit: 'ลูก', price_per_unit: 890.00, location: 'ห้องกีฬา', min_quantity: 3, status: 'active' },
            { asset_code: 'SPT-002', name: 'ลูกบาสเกตบอล Spalding', description: 'ลูกบาส', category_id: catMap['อุปกรณ์กีฬา'], type: 'borrowable', quantity: 10, unit: 'ลูก', price_per_unit: 1200.00, location: 'ห้องกีฬา', min_quantity: 2, status: 'active' },
            { asset_code: 'SPT-003', name: 'เสื้อกีฬาทีม (คละสี)', description: 'เสื้อกีฬา', category_id: catMap['อุปกรณ์กีฬา'], type: 'consumable', quantity: 200, unit: 'ตัว', price_per_unit: 180.00, location: 'ห้องกีฬา', min_quantity: 30, status: 'active' },

            // === อื่นๆ (borrowable + consumable) ===
            { asset_code: 'OTH-001', name: 'เครื่องเสียงพกพา JBL', description: 'เครื่องเสียง', category_id: catMap['อื่นๆ'], type: 'borrowable', quantity: 3, unit: 'ชุด', price_per_unit: 12000.00, location: 'ห้องโสตฯ', min_quantity: 1, status: 'active' },
            { asset_code: 'OTH-002', name: 'กล้องถ่ายรูป Canon EOS M50', description: 'กล้อง', category_id: catMap['อื่นๆ'], type: 'borrowable', quantity: 2, unit: 'ตัว', price_per_unit: 25000.00, location: 'ห้องโสตฯ', min_quantity: 1, status: 'active' },
            { asset_code: 'OTH-003', name: 'ป้ายไวนิลกิจกรรม', description: 'ป้ายไวนิล', category_id: catMap['อื่นๆ'], type: 'consumable', quantity: 25, unit: 'ผืน', price_per_unit: 500.00, location: 'โกดัง', min_quantity: 5, status: 'active' }
    ]);
    console.log('✅ Sample assets created (20 items)');
  }

  console.log('\n🎉 Setup complete! Run "npm run dev" to start the server.');
  console.log('   Login: admin / admin123');
  process.exit(0);
}

setup().catch(err => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
