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
      { name: 'อุปกรณ์สำนักงาน', sku_prefix: 'OFF', description: 'เครื่องเขียน กระดาษ หมึกพิมพ์ ฯลฯ' },
      { name: 'อุปกรณ์อิเล็กทรอนิกส์', sku_prefix: 'ELE', description: 'คอมพิวเตอร์ จอภาพ เครื่องพิมพ์ ฯลฯ' },
      { name: 'อุปกรณ์กีฬา', sku_prefix: 'SPO', description: 'ลูกบอล ตาข่าย อุปกรณ์กีฬาต่างๆ' },
      { name: 'เฟอร์นิเจอร์', sku_prefix: 'FUR', description: 'โต๊ะ เก้าอี้ ตู้เก็บของ ฯลฯ' },
      { name: 'อุปกรณ์กิจกรรม', sku_prefix: 'ACT', description: 'เต็นท์ ป้ายไวนิล ไมค์ ลำโพง ฯลฯ' }
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
      { asset_code: 'OFF-001', name: 'กระดาษ A4', category_id: catMap['อุปกรณ์สำนักงาน'], type: 'consumable', quantity: 50, unit: 'รีม', price_per_unit: 120, location: 'ห้องพัสดุ ชั้น 1', min_quantity: 10, status: 'active' },
      { asset_code: 'OFF-002', name: 'หมึกพิมพ์ HP', category_id: catMap['อุปกรณ์สำนักงาน'], type: 'consumable', quantity: 8, unit: 'ตลับ', price_per_unit: 950, location: 'ห้องพัสดุ ชั้น 1', min_quantity: 3, status: 'active' },
      { asset_code: 'OFF-003', name: 'ปากกาลูกลื่น', category_id: catMap['อุปกรณ์สำนักงาน'], type: 'consumable', quantity: 100, unit: 'แท่ง', price_per_unit: 12, location: 'ห้องพัสดุ ชั้น 1', min_quantity: 20, status: 'active' },
      { asset_code: 'ELE-001', name: 'โน้ตบุ๊ค Lenovo', category_id: catMap['อุปกรณ์อิเล็กทรอนิกส์'], type: 'borrowable', quantity: 5, unit: 'เครื่อง', price_per_unit: 18500, location: 'ห้องไอที ชั้น 2', min_quantity: 1, status: 'active' },
      { asset_code: 'ELE-002', name: 'โปรเจคเตอร์ Epson', category_id: catMap['อุปกรณ์อิเล็กทรอนิกส์'], type: 'borrowable', quantity: 3, unit: 'เครื่อง', price_per_unit: 25000, location: 'ห้องไอที ชั้น 2', min_quantity: 1, status: 'active' },
      { asset_code: 'SPO-001', name: 'ลูกฟุตบอล', category_id: catMap['อุปกรณ์กีฬา'], type: 'borrowable', quantity: 10, unit: 'ลูก', price_per_unit: 650, location: 'ห้องกีฬา', min_quantity: 2, status: 'active' },
      { asset_code: 'SPO-002', name: 'ตาข่ายวอลเลย์บอล', category_id: catMap['อุปกรณ์กีฬา'], type: 'borrowable', quantity: 2, unit: 'ผืน', price_per_unit: 1200, location: 'ห้องกีฬา', min_quantity: 1, status: 'active' },
      { asset_code: 'FUR-001', name: 'โต๊ะพับอเนกประสงค์', category_id: catMap['เฟอร์นิเจอร์'], type: 'borrowable', quantity: 20, unit: 'ตัว', price_per_unit: 1800, location: 'โกดัง ชั้น 1', min_quantity: 5, status: 'active' },
      { asset_code: 'FUR-002', name: 'เก้าอี้พับ', category_id: catMap['เฟอร์นิเจอร์'], type: 'borrowable', quantity: 50, unit: 'ตัว', price_per_unit: 450, location: 'โกดัง ชั้น 1', min_quantity: 10, status: 'active' },
      { asset_code: 'ACT-001', name: 'เต็นท์ 3x3 เมตร', category_id: catMap['อุปกรณ์กิจกรรม'], type: 'borrowable', quantity: 6, unit: 'หลัง', price_per_unit: 4500, location: 'โกดัง ชั้น 1', min_quantity: 2, status: 'active' },
      { asset_code: 'ACT-002', name: 'ไมค์ลอย Shure', category_id: catMap['อุปกรณ์กิจกรรม'], type: 'borrowable', quantity: 4, unit: 'ตัว', price_per_unit: 3200, location: 'ห้องโสตฯ ชั้น 3', min_quantity: 1, status: 'active' },
      { asset_code: 'ACT-003', name: 'ลำโพง JBL', category_id: catMap['อุปกรณ์กิจกรรม'], type: 'borrowable', quantity: 2, unit: 'ตัว', price_per_unit: 8500, location: 'ห้องโสตฯ ชั้น 3', min_quantity: 1, status: 'active' },
    ]);
    console.log('✅ Sample assets created (12 items)');
  }

  console.log('\n🎉 Setup complete! Run "npm run dev" to start the server.');
  console.log('   Login: admin / admin123');
  process.exit(0);
}

setup().catch(err => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
