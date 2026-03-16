require('dotenv').config();
const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function testLogin() {
  try {
    const user = await User.findOne({ where: { username: 'admin' } });
    if (!user) {
      console.log('User admin not found');
      return process.exit(1);
    }
    
    console.log(`Testing password for user: ${user.username}`);
    console.log(`Stored hash: ${user.password_hash}`);
    
    const isValid = await user.validatePassword('admin1234');
    console.log(`Is 'admin1234' valid? => ${isValid}`);

    const isValid2 = await user.validatePassword('admin123');
    console.log(`Is 'admin123' valid? => ${isValid2}`);

    // Let's reset the password directly avoiding hooks just in case
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin1234', salt);
    
    // update via direct query to avoid hooks if needed
    user.changed('password_hash', false); // Try to bypass hook or let's use sequelize.query
    await user.update({ password_hash: hash }, { hooks: false });
    
    console.log('Force reset password hash to admin1234 without hooks!');
    
    const userAf = await User.findOne({ where: { username: 'admin' } });
    const isV = await userAf.validatePassword('admin1234');
    console.log(`After force reset: Is 'admin1234' valid? => ${isV}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testLogin();
