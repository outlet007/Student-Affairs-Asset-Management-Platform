require('dotenv').config();
const { sequelize } = require('./models');

async function updateDatabase() {
  try {
    console.log('🔄 Updating database schema...');
    
    // alter: true will check the current state of the database and perform necessary changes to match the models.
    // In this case, it will add the `deleted_at` column to the `users` table since we added paranoid: true.
    await sequelize.sync({ alter: true });
    
    console.log('✅ Database schema updated successfully. Users table now supports soft deletes.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to update database schema:', error);
    process.exit(1);
  }
}

updateDatabase();
