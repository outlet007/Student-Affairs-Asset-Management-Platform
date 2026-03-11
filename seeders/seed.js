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
        const categories = ['อุปกรณ์สำนักงาน', 'อุปกรณ์คอมพิวเตอร์', 'เฟอร์นิเจอร์', 'อุปกรณ์กีฬา', 'อื่นๆ'];
        for (const name of categories) {
            await Category.findOrCreate({ where: { name }, defaults: { name } });
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
