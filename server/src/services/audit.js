import { getStore } from '../data/index.js';
import { nowIso } from '../lib/ids.js';
import { logger } from '../lib/logger.js';

/**
 * Append an audit log entry. Never throws — auditing must not break the main action.
 * @param {object|null} actor  req.user (or null for system actions)
 */
export async function audit(actor, action, entityType, entityId, details, ip) {
  try {
    await getStore().insert('AuditLogs', {
      timestamp: nowIso(),
      actor_id: actor?.user_id || 'system',
      actor_role: actor?.role || 'system',
      actor_name: actor?.name || 'System',
      action,
      entity_type: entityType || '',
      entity_id: entityId ? String(entityId) : '',
      details: typeof details === 'string' ? details : details ? JSON.stringify(details) : '',
      ip: ip || '',
    });
  } catch (err) {
    logger.error('Audit log failed:', err.message);
  }
}

export function auditFromReq(req, action, entityType, entityId, details) {
  return audit(req.user, action, entityType, entityId, details, req.ip);
}
