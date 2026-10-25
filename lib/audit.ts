import { recordAuditEntry } from './data-service';
import { getClientIp } from './rate-limiter';

export async function logAuditEvent(params: {
  userId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  req?: Request;
  metadata?: Record<string, unknown>;
}) {
  let ipAddress: string | undefined;
  let userAgent: string | undefined;

  if (params.req) {
    ipAddress = getClientIp(params.req);
    userAgent = params.req.headers.get('user-agent') || undefined;
  }

  // Filter out any sensitive keys from metadata
  let safeMetadataStr: string | undefined;
  if (params.metadata) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(params.metadata)) {
      if (
        key.toLowerCase().includes('password') ||
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('secret') ||
        key.toLowerCase().includes('key')
      ) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = val;
      }
    }
    safeMetadataStr = JSON.stringify(sanitized);
  }

  try {
    await recordAuditEntry({
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      ipAddress,
      userAgent,
      metadata: safeMetadataStr,
    });
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err);
  }
}
