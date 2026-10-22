const parsePagination = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  let sort = { createdAt: -1 };
  if (query.sortBy) {
    const sortOrder = query.sortOrder === "asc" ? 1 : -1;
    // Sanitize sortBy field name to alphanumeric + underscore/dot
    const safeField = String(query.sortBy).replace(/[^a-zA-Z0-9_.]/g, "");
    if (safeField) {
      sort = { [safeField]: sortOrder };
    }
  }

  return { page, limit, skip, sort };
};

const buildPaginationMeta = (total, page, limit) => {
  const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
  return {
    page,
    limit,
    total,
    totalPages,
  };
};

const escapeRegex = (str = "") => {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

module.exports = {
  parsePagination,
  buildPaginationMeta,
  escapeRegex,
};
