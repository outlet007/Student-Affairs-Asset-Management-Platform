require('dotenv').config();
const sequelize = require('./config/database');

const skuMap = {
    'อุปกรณ์สำนักงาน': 'OFC',
    'อุปกรณ์คอมพิวเตอร์': 'CMP',
    'เฟอร์นิเจอร์': 'FRN',
    'อุปกรณ์กีฬา': 'SPT',
    'อื่นๆ': 'ETC'
};

(async () => {
    try {
        // Step 1: Add column if not exists (allow null first)
        try {
            await sequelize.query("ALTER TABLE categories ADD COLUMN sku_prefix VARCHAR(3) NULL UNIQUE");
            console.log('Added sku_prefix column');
        } catch (e) {
            if (e.message.includes('Duplicate column')) {
                console.log('sku_prefix column already exists');
            } else {
                console.log('Column note:', e.message);
            }
        }

        // Step 2: Update existing categories
        for (const [name, prefix] of Object.entries(skuMap)) {
            const [results] = await sequelize.query(
                "UPDATE categories SET sku_prefix = ? WHERE name = ? AND (sku_prefix IS NULL OR sku_prefix = '')",
                { replacements: [prefix, name] }
            );
            console.log(`${name} -> ${prefix}`);
        }

        // Step 3: Make column NOT NULL
        try {
            await sequelize.query("ALTER TABLE categories MODIFY COLUMN sku_prefix VARCHAR(3) NOT NULL");
            console.log('Set sku_prefix to NOT NULL');
        } catch (e) {
            console.log('Modify note:', e.message);
        }

        console.log('Done!');
        process.exit();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
})();
