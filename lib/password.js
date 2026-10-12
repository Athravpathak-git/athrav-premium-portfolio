import * as argon2 from '@node-rs/argon2';

/**
 * Hash a plaintext password using Argon2id with production security parameters.
 * @param {string} password
 * @returns {Promise<string>}
 */
export async function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  return argon2.hash(password, {
    memoryCost: 65536, // 64 MB memory
    timeCost: 3,       // 3 iterations
    parallelism: 1,    // 1 thread
    algorithm: argon2.Algorithm.Argon2id,
  });
}

/**
 * Verify a plaintext password against an Argon2id hash.
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, hash) {
  if (!password || !hash) return false;
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    return false;
  }
}

/**
 * Validate password strength against strict production requirements.
 * Ensures initial temporary password `#Athr2007` cannot be reused.
 * @param {string} password
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validatePasswordStrength(password) {
  const errors = [];

  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required.'] };
  }

  if (password.length < 10) {
    errors.push('Password must be at least 10 characters long.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must include at least one uppercase letter.');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must include at least one lowercase letter.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must include at least one number.');
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must include at least one special character.');
  }
  if (password === '#Athr2007') {
    errors.push('You cannot reuse the initial temporary bootstrap password.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
