require('dotenv').config();
const { sequelize, User, Category } = require('../models');

async function seed() {
    try {
        await sequelize.sync({ alter: true });
        console.log('Database synced.');

        // Create admin user
        const adminExists = await User.findOne({ where: { username: 'admin' } });
        if (!adminExists) {
            await User.create({
                username: 'admin',
                password_hash: 'admin1234',
                full_name: 'ผู้ดูแลระบบ',
                email: 'admin@example.com',
                role: 'admin'
            });
            console.log('Admin user created: admin / admin1234');
        } else {
            console.log('Admin user already exists.');
        }

        // Create default categories
        const categories = [
            { name: 'อุปกรณ์สำนักงาน', sku_prefix: 'OFF' },
            { name: 'อุปกรณ์คอมพิวเตอร์', sku_prefix: 'COM' },
            { name: 'เฟอร์นิเจอร์', sku_prefix: 'FUR' },
            { name: 'อุปกรณ์กีฬา', sku_prefix: 'SPO' },
            { name: 'อื่นๆ', sku_prefix: 'OTH' }
        ];
        for (const cat of categories) {
            await Category.findOrCreate({ where: { name: cat.name }, defaults: { name: cat.name, sku_prefix: cat.sku_prefix } });
        }
        console.log('Default categories created.');

        console.log('\n=== Seed completed successfully! ===');
        console.log('Username: admin');
        console.log('Password: admin1234');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seed();
