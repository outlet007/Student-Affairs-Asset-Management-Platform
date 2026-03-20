require('dotenv').config();
const { User, sequelize } = require('./models');
const bcrypt = require('bcryptjs');

async function fixAdmin() {
  try {
    // 1. Delete admin if it somehow exists but is broken
    await User.destroy({ where: { username: 'admin' } });
    
    // 2. Hash password directly
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin1234', salt);
    
    // 3. Create superadmin user
    await User.create({
      username: 'admin',
      password_hash: hash,
      full_name: 'ผู้ดูแลระบบ',
      email: 'admin@example.com',
      role: 'superadmin',
      department_id: null
    }, { hooks: false });
    
    console.log('✅ Created superadmin user successfully with password: admin1234');
    
    const users = await User.findAll();
    console.log('Current users:');
    users.forEach(u => console.log(`- ${u.username} (role: ${u.role})`));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixAdmin();
