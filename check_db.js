require('dotenv').config();
const { User } = require('./models');

async function check() {
    try {
        const users = await User.findAll();
        console.log('Users in DB:');
        for (const u of users) {
             console.log(`- ${u.username} (role: ${u.role}) (hash: ${u.password_hash.substring(0, 10)}...)`);
        }
        if (users.length === 0) {
             console.log('No users found. Running setup...');
             await User.create({
                 username: 'admin',
                 password_hash: 'admin1234',
                 full_name: 'Admin',
                 role: 'admin'
             });
             console.log('Created admin/admin1234');
        } else {
             // Let's force reset admin
             const admin = await User.findOne({ where: { username: 'admin' } });
             if (admin) {
                  admin.password_hash = 'admin1234';
                  await admin.save();
                  console.log('Reset admin password to admin1234');
             }
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
