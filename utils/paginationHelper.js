/**
 * Pagination helper for Sequelize models
 * @param {Object} model - Sequelize model
 * @param {Object} options - Query options
 * @param {number} page - Current page (1-indexed)
 * @param {number} limit - Items per page
 * @returns {Object} { rows, totalPages, currentPage, totalItems, limit }
 */
async function paginate(model, options = {}, page = 1, limit = 10) {
  page = Math.max(1, parseInt(page) || 1);
  limit = Math.max(1, Math.min(100, parseInt(limit) || 10));

  const offset = (page - 1) * limit;

  const { count, rows } = await model.findAndCountAll({
    ...options,
    limit,
    offset
  });

  const totalItems = typeof count === 'number' ? count : count.length;
  const totalPages = Math.ceil(totalItems / limit);

  return {
    rows,
    totalPages,
    currentPage: page,
    totalItems,
    limit
  };
}

/**
 * Build query string for pagination links preserving existing filters
 * @param {Object} query - Express req.query
 * @param {number} page - Target page number
 * @returns {string} Query string
 */
function buildPaginationQuery(query, page) {
  const params = new URLSearchParams(query);
  params.set('page', page);
  return '?' + params.toString();
}

module.exports = { paginate, buildPaginationQuery };
