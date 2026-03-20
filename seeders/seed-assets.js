require('dotenv').config();
const { sequelize, Category, Asset } = require('../models');

async function seedAssets() {
    try {
        await sequelize.sync({ alter: true });
        console.log('Database synced.');

        // Get category IDs
        const categories = await Category.findAll();
        const catMap = {};
        categories.forEach(c => { catMap[c.name] = c.id; });
        console.log('Categories found:', Object.keys(catMap).join(', '));

        const assets = [
            // === อุปกรณ์สำนักงาน (consumable) ===
            {
                asset_code: 'OFC-001',
                name: 'กระดาษ A4 80 แกรม',
                description: 'กระดาษ A4 สำหรับพิมพ์เอกสารทั่วไป ขนาด 80 แกรม',
                category_id: catMap['อุปกรณ์สำนักงาน'],
                type: 'consumable',
                quantity: 200,
                unit: 'รีม',
                price_per_unit: 120.00,
                location: 'ห้องพัสดุ อาคาร 1 ชั้น 1',
                min_quantity: 50
            },
            {
                asset_code: 'OFC-002',
                name: 'ปากกาลูกลื่น สีน้ำเงิน',
                description: 'ปากกาลูกลื่นหัว 0.5 มม. สีน้ำเงิน',
                category_id: catMap['อุปกรณ์สำนักงาน'],
                type: 'consumable',
                quantity: 500,
                unit: 'ด้าม',
                price_per_unit: 8.00,
                location: 'ห้องพัสดุ อาคาร 1 ชั้น 1',
                min_quantity: 100
            },
            {
                asset_code: 'OFC-003',
                name: 'แฟ้มเอกสาร A4',
                description: 'แฟ้มเอกสาร A4 แบบสันกว้าง คละสี',
                category_id: catMap['อุปกรณ์สำนักงาน'],
                type: 'consumable',
                quantity: 150,
                unit: 'แฟ้ม',
                price_per_unit: 25.00,
                location: 'ห้องพัสดุ อาคาร 1 ชั้น 1',
                min_quantity: 30
            },
            {
                asset_code: 'OFC-004',
                name: 'หมึกเครื่องพิมพ์ HP 680 สีดำ',
                description: 'ตลับหมึก HP 680 Black สำหรับเครื่องปริ้นท์ HP DeskJet',
                category_id: catMap['อุปกรณ์สำนักงาน'],
                type: 'consumable',
                quantity: 30,
                unit: 'ตลับ',
                price_per_unit: 350.00,
                location: 'ห้องพัสดุ อาคาร 1 ชั้น 1',
                min_quantity: 10
            },
            {
                asset_code: 'OFC-005',
                name: 'สมุดบันทึก A5',
                description: 'สมุดบันทึกปกแข็ง ขนาด A5 มีเส้น 100 แผ่น',
                category_id: catMap['อุปกรณ์สำนักงาน'],
                type: 'consumable',
                quantity: 100,
                unit: 'เล่ม',
                price_per_unit: 45.00,
                location: 'ห้องพัสดุ อาคาร 1 ชั้น 1',
                min_quantity: 20
            },

            // === อุปกรณ์คอมพิวเตอร์ (borrowable) ===
            {
                asset_code: 'COM-001',
                name: 'โน้ตบุ๊ค Lenovo ThinkPad',
                description: 'โน้ตบุ๊ค Lenovo ThinkPad E14 Gen 5, Intel i5, RAM 8GB, SSD 256GB',
                category_id: catMap['อุปกรณ์คอมพิวเตอร์'],
                type: 'borrowable',
                quantity: 10,
                unit: 'เครื่อง',
                price_per_unit: 22000.00,
                location: 'ห้อง IT อาคาร 2 ชั้น 3',
                min_quantity: 2
            },
            {
                asset_code: 'COM-002',
                name: 'โปรเจคเตอร์ Epson EB-X51',
                description: 'โปรเจคเตอร์ Epson EB-X51 ความสว่าง 3800 Lumens XGA',
                category_id: catMap['อุปกรณ์คอมพิวเตอร์'],
                type: 'borrowable',
                quantity: 5,
                unit: 'เครื่อง',
                price_per_unit: 15000.00,
                location: 'ห้อง IT อาคาร 2 ชั้น 3',
                min_quantity: 1
            },
            {
                asset_code: 'COM-003',
                name: 'เมาส์ไร้สาย Logitech M331',
                description: 'เมาส์ไร้สาย Logitech M331 Silent Plus',
                category_id: catMap['อุปกรณ์คอมพิวเตอร์'],
                type: 'consumable',
                quantity: 40,
                unit: 'ตัว',
                price_per_unit: 590.00,
                location: 'ห้อง IT อาคาร 2 ชั้น 3',
                min_quantity: 5
            },
            {
                asset_code: 'COM-004',
                name: 'คีย์บอร์ด USB Logitech K120',
                description: 'คีย์บอร์ด USB Logitech K120 ภาษาไทย-อังกฤษ',
                category_id: catMap['อุปกรณ์คอมพิวเตอร์'],
                type: 'consumable',
                quantity: 35,
                unit: 'ตัว',
                price_per_unit: 390.00,
                location: 'ห้อง IT อาคาร 2 ชั้น 3',
                min_quantity: 5
            },
            {
                asset_code: 'COM-005',
                name: 'USB Flash Drive 32GB',
                description: 'แฟลชไดรฟ์ USB 3.0 ความจุ 32GB Kingston',
                category_id: catMap['อุปกรณ์คอมพิวเตอร์'],
                type: 'consumable',
                quantity: 50,
                unit: 'อัน',
                price_per_unit: 150.00,
                location: 'ห้อง IT อาคาร 2 ชั้น 3',
                min_quantity: 10
            },

            // === เฟอร์นิเจอร์ (borrowable) ===
            {
                asset_code: 'FUR-001',
                name: 'โต๊ะพับอเนกประสงค์',
                description: 'โต๊ะพับอเนกประสงค์ขนาด 180x60 ซม. สีขาว',
                category_id: catMap['เฟอร์นิเจอร์'],
                type: 'borrowable',
                quantity: 20,
                unit: 'ตัว',
                price_per_unit: 1200.00,
                location: 'โกดังพัสดุ อาคาร 3',
                min_quantity: 5
            },
            {
                asset_code: 'FUR-002',
                name: 'เก้าอี้พับ',
                description: 'เก้าอี้พับเหล็กหุ้มเบาะ สีเทา',
                category_id: catMap['เฟอร์นิเจอร์'],
                type: 'borrowable',
                quantity: 100,
                unit: 'ตัว',
                price_per_unit: 450.00,
                location: 'โกดังพัสดุ อาคาร 3',
                min_quantity: 20
            },
            {
                asset_code: 'FUR-003',
                name: 'ตู้เอกสาร 4 ลิ้นชัก',
                description: 'ตู้เอกสารเหล็ก 4 ลิ้นชัก สีเทาเข้ม',
                category_id: catMap['เฟอร์นิเจอร์'],
                type: 'borrowable',
                quantity: 8,
                unit: 'ตู้',
                price_per_unit: 3500.00,
                location: 'โกดังพัสดุ อาคาร 3',
                min_quantity: 2
            },
            {
                asset_code: 'FUR-004',
                name: 'ไวท์บอร์ดขาตั้ง',
                description: 'ไวท์บอร์ดแม่เหล็ก ขนาด 90x120 ซม. พร้อมขาตั้ง',
                category_id: catMap['เฟอร์นิเจอร์'],
                type: 'borrowable',
                quantity: 6,
                unit: 'ตัว',
                price_per_unit: 2800.00,
                location: 'โกดังพัสดุ อาคาร 3',
                min_quantity: 2
            },

            // === อุปกรณ์กีฬา (borrowable + consumable) ===
            {
                asset_code: 'SPT-001',
                name: 'ลูกฟุตบอล Molten',
                description: 'ลูกฟุตบอล Molten หนังเย็บ เบอร์ 5',
                category_id: catMap['อุปกรณ์กีฬา'],
                type: 'borrowable',
                quantity: 15,
                unit: 'ลูก',
                price_per_unit: 890.00,
                location: 'ห้องกีฬา อาคารกิจกรรม',
                min_quantity: 3
            },
            {
                asset_code: 'SPT-002',
                name: 'ลูกบาสเกตบอล Spalding',
                description: 'ลูกบาสเกตบอล Spalding เบอร์ 7 หนังสังเคราะห์',
                category_id: catMap['อุปกรณ์กีฬา'],
                type: 'borrowable',
                quantity: 10,
                unit: 'ลูก',
                price_per_unit: 1200.00,
                location: 'ห้องกีฬา อาคารกิจกรรม',
                min_quantity: 2
            },
            {
                asset_code: 'SPT-003',
                name: 'เสื้อกีฬาทีม (คละสี)',
                description: 'เสื้อกีฬาโพลีเอสเตอร์ พิมพ์โลโก้สถาบัน คละสี',
                category_id: catMap['อุปกรณ์กีฬา'],
                type: 'consumable',
                quantity: 200,
                unit: 'ตัว',
                price_per_unit: 180.00,
                location: 'ห้องกีฬา อาคารกิจกรรม',
                min_quantity: 30
            },

            // === อื่นๆ (borrowable + consumable) ===
            {
                asset_code: 'OTH-001',
                name: 'เครื่องเสียงพกพา JBL PartyBox',
                description: 'ลำโพงบลูทูธ JBL PartyBox 110 พร้อมไมค์ลอย 2 ตัว',
                category_id: catMap['อื่นๆ'],
                type: 'borrowable',
                quantity: 3,
                unit: 'ชุด',
                price_per_unit: 12000.00,
                location: 'ห้องโสตทัศนูปกรณ์ อาคาร 1 ชั้น 2',
                min_quantity: 1
            },
            {
                asset_code: 'OTH-002',
                name: 'กล้องถ่ายรูป Canon EOS M50',
                description: 'กล้อง Mirrorless Canon EOS M50 Mark II พร้อมเลนส์ Kit 15-45mm',
                category_id: catMap['อื่นๆ'],
                type: 'borrowable',
                quantity: 2,
                unit: 'ตัว',
                price_per_unit: 25000.00,
                location: 'ห้องโสตทัศนูปกรณ์ อาคาร 1 ชั้น 2',
                min_quantity: 1
            },
            {
                asset_code: 'OTH-003',
                name: 'ป้ายไวนิลกิจกรรม',
                description: 'ป้ายไวนิลสำเร็จรูป ขนาด 3x1 เมตร สำหรับกิจกรรมนักศึกษา',
                category_id: catMap['อื่นๆ'],
                type: 'consumable',
                quantity: 25,
                unit: 'ผืน',
                price_per_unit: 500.00,
                location: 'โกดังพัสดุ อาคาร 3',
                min_quantity: 5
            }
        ];

        let created = 0;
        for (const asset of assets) {
            const [record, isNew] = await Asset.findOrCreate({
                where: { asset_code: asset.asset_code },
                defaults: asset
            });
            if (isNew) {
                created++;
                console.log(`  ✅ ${asset.asset_code} - ${asset.name} (${asset.type})`);
            } else {
                console.log(`  ⏭️  ${asset.asset_code} - ${asset.name} (already exists)`);
            }
        }

        console.log(`\n=== Seed completed! Created ${created} assets ===`);
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seedAssets();
