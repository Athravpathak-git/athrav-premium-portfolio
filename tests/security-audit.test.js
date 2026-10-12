import { describe, it, expect } from 'vitest';
import { sanitizeAuditData } from '../lib/audit.js';

describe('Audit Logging & Secret Redaction', () => {
  it('should redact sensitive keys including passwords, tokens, and authorization', () => {
    const rawData = {
      username: 'athrav-admin',
      password: 'MySecretPassword123!',
      passwordHash: '$argon2id$v=19$...',
      sessionToken: 'abcdef1234567890',
      action: 'LOGIN_ATTEMPT',
      headers: {
        authorization: 'Bearer secret_token_xyz',
        cookie: 'athrav_admin_session=secret',
      },
    };

    const sanitized = sanitizeAuditData(rawData);

    expect(sanitized.username).toBe('athrav-admin');
    expect(sanitized.password).toBe('[REDACTED]');
    expect(sanitized.passwordHash).toBe('[REDACTED]');
    expect(sanitized.sessionToken).toBe('[REDACTED]');
    expect(sanitized.headers.authorization).toBe('[REDACTED]');
    expect(sanitized.headers.cookie).toBe('[REDACTED]');
    expect(sanitized.action).toBe('LOGIN_ATTEMPT');
  });
});
