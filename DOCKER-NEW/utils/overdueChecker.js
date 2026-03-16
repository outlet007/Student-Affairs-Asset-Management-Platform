const { Borrow } = require('../models');
const { Op } = require('sequelize');

/**
 * Check and update overdue borrows
 * Borrows with status 'borrowing' and expected_return_date < now → 'overdue'
 */
async function checkOverdueBorrows() {
  try {
    const now = new Date();
    const [updatedCount] = await Borrow.update(
      { status: 'overdue' },
      {
        where: {
          status: 'borrowing',
          expected_return_date: { [Op.lt]: now, [Op.ne]: null }
        }
      }
    );
    if (updatedCount > 0) {
      console.log(`[Overdue Checker] Updated ${updatedCount} borrow(s) to overdue`);
    }
    return updatedCount;
  } catch (error) {
    console.error('[Overdue Checker] Error:', error);
    return 0;
  }
}

module.exports = { checkOverdueBorrows };
