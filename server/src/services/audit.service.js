const AuditLog = require('../models/AuditLog.model');
const { logger } = require('../utils');

class AuditService {
  async log({
    user,
    action,
    module,
    resourceId = null,
    resourceType = null,
    description = '',
    changes = null,
    ip = '',
    userAgent = '',
    metadata = {},
  }) {
    try {
      const logEntry = await AuditLog.create({
        user,
        action,
        module,
        resourceId: resourceId ? String(resourceId) : undefined,
        resourceType,
        description,
        changes,
        ip,
        userAgent,
        metadata,
      });

      return logEntry;
    } catch (error) {
      logger.error('Failed to create audit log:', error);
      return null;
    }
  }

  async getLogs(query = {}, options = {}) {
    const { page = 1, limit = 20, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;

    const filter = { ...query };

    if (filter.startDate || filter.endDate) {
      filter.createdAt = {};
      if (filter.startDate) {
        filter.createdAt.$gte = new Date(filter.startDate);
        delete filter.startDate;
      }
      if (filter.endDate) {
        filter.createdAt.$lte = new Date(filter.endDate);
        delete filter.endDate;
      }
    }

    const [data, total] = await Promise.all([
      AuditLog.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('user', 'fullName email role')
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async getLogsByUser(userId, options = {}) {
    return this.getLogs({ user: userId }, options);
  }

  async getLogsByModule(module, options = {}) {
    return this.getLogs({ module }, options);
  }

  async getLogsByAction(action, options = {}) {
    return this.getLogs({ action }, options);
  }

  async getRecentLogs(limit = 10) {
    return this.getLogs({}, { limit, sort: { createdAt: -1 } });
  }

  async getLogStats() {
    const stats = await AuditLog.aggregate([
      {
        $group: {
          _id: '$module',
          total: { $sum: 1 },
          lastActivity: { $max: '$createdAt' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const totalLogs = await AuditLog.countDocuments();
    const recentLogs = await AuditLog.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    return { totalLogs, recentLogs, byModule: stats };
  }
}

module.exports = new AuditService();
