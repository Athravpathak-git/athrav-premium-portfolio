import prisma from './prisma.js';
import { getClientIp, getUserAgent } from './session.js';

/**
 * Sanitize an object to ensure no sensitive fields (passwords, tokens, secrets) are logged.
 * @param {object} obj
 * @returns {object}
 */
export function sanitizeAuditData(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  const forbiddenKeys = [
    'password',
    'passwordhash',
    'token',
    'sessiontoken',
    'secret',
    'currentpassword',
    'newpassword',
    'confirmpassword',
    'authorization',
    'cookie',
  ];

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (forbiddenKeys.some((k) => key.toLowerCase().includes(k))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeAuditData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Record a security-relevant event into audit_logs.
 * 
 * @param {object} params
 * @param {string} [params.userId]
 * @param {string} params.action - E.g. 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'PASSWORD_CHANGED', 'PROJECT_CREATED'
 * @param {string} [params.entityType] - E.g. 'Project', 'Session', 'ContactMessage'
 * @param {string} [params.entityId]
 * @param {Request|Headers|object} [params.req]
 * @param {object} [params.metadata]
 */
export async function logAuditEvent({
  userId = null,
  action,
  entityType = null,
  entityId = null,
  req = null,
  metadata = null,
}) {
  try {
    const ipAddress = req ? getClientIp(req) : null;
    const userAgent = req ? getUserAgent(req).slice(0, 500) : null;

    const safeMetadata = metadata
      ? JSON.stringify(sanitizeAuditData(metadata))
      : null;

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId: entityId ? String(entityId) : null,
        ipAddress,
        userAgent,
        metadata: safeMetadata,
      },
    });
  } catch (error) {
    // Audit log failures must be logged to stderr without crashing the application
    console.error('Audit log write error:', error?.message || error);
  }
}
