const { query } = require('../database/connection');
const logger = require('../utils/logger');

async function log({
  userId = null,
  schoolId = null,
  action,
  entityType,
  entityId = null,
  oldValues = null,
  newValues = null,
  ipAddress = null,
  userAgent = null,
}) {
  try {
    await query(
      `INSERT INTO audit_logs
       (user_id, school_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
       VALUES (:userId, :schoolId, :action, :entityType, :entityId, :oldValues, :newValues, :ip, :ua)`,
      {
        userId,
        schoolId,
        action,
        entityType,
        entityId,
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
        ip: ipAddress,
        ua: userAgent,
      }
    );
  } catch (err) {
    logger.error('Audit log failed', { error: err.message, action });
  }
}

module.exports = { log };
