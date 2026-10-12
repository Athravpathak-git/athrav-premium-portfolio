import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../lib/password.js';
import { hashToken, generateSessionToken } from '../lib/session.js';

describe('Authentication & Password Security', () => {
  it('should hash password using Argon2id algorithm', async () => {
    const password = 'StrongPassword@2026!';
    const hash = await hashPassword(password);
    expect(hash).toBeDefined();
    expect(hash.startsWith('$argon2id$')).toBe(true);
  });

  it('should verify correct password and reject incorrect password', async () => {
    const password = 'Complex#Athrav#Pass1';
    const hash = await hashPassword(password);

    const match = await verifyPassword(password, hash);
    expect(match).toBe(true);

    const mismatch = await verifyPassword('WrongPassword#123', hash);
    expect(mismatch).toBe(false);
  });

  it('should enforce password strength rules', () => {
    // Too short
    expect(validatePasswordStrength('Short1!').valid).toBe(false);

    // Missing uppercase
    expect(validatePasswordStrength('lowercase123!@#').valid).toBe(false);

    // Missing symbol
    expect(validatePasswordStrength('UppercaseDigit123').valid).toBe(false);

    // Valid strong password
    expect(validatePasswordStrength('SuperSecurePass#2026').valid).toBe(true);
  });

  it('should strictly reject reuse of temporary bootstrap password #Athr2007', () => {
    const result = validatePasswordStrength('#Athr2007');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('You cannot reuse the initial temporary bootstrap password.');
  });

  it('should generate secure random session tokens and compute consistent SHA-256 hashes', () => {
    const token = generateSessionToken();
    expect(token).toHaveLength(64);

    const hash1 = hashToken(token);
    const hash2 = hashToken(token);
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });
});
