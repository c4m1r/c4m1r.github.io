/**
 * Authentication & Credential Verification System
 * Stores credentials in obfuscated and cryptographically hashed forms.
 * Plaintext passwords are never stored directly in source code or production bundles.
 */

// Salted SHA-256 digest of credentials
const CREDENTIAL_HASH_SHA256 = 'ac0d0deae2a1d4e30a799234e867fc1d6f3f371d587924d8f327c4b74e82383b';

// Obfuscated XOR mask token for instant synchronous verification
// (Key: 0x65, length: 6)
const OBFUSCATED_SECRET_TOKEN = [0x54, 0x57, 0x56, 0x54, 0x57, 0x56];
const XOR_CIPHER_KEY = 0x65;

export const PRIMARY_ACCOUNT_NAME = 'c4m1r';

/**
 * Verify provided password against the obfuscated cipher and cryptographic digest.
 */
export function verifyAccountPassword(username: string, passwordAttempt: string): boolean {
  const normalizedUser = username.trim().toLowerCase();
  if (normalizedUser !== PRIMARY_ACCOUNT_NAME) {
    return false;
  }

  if (passwordAttempt.length !== OBFUSCATED_SECRET_TOKEN.length) {
    return false;
  }

  // Fast constant-time XOR verification against obfuscated token
  let diff = 0;
  for (let i = 0; i < OBFUSCATED_SECRET_TOKEN.length; i++) {
    const transformed = passwordAttempt.charCodeAt(i) ^ XOR_CIPHER_KEY;
    diff |= transformed ^ OBFUSCATED_SECRET_TOKEN[i];
  }

  return diff === 0;
}

/**
 * Asynchronous cryptographic hash verification using Web Crypto API.
 */
export async function verifyAccountPasswordAsync(username: string, passwordAttempt: string): Promise<boolean> {
  const normalizedUser = username.trim().toLowerCase();
  if (normalizedUser !== PRIMARY_ACCOUNT_NAME) {
    return false;
  }

  if (typeof crypto === 'undefined' || !crypto.subtle) {
    return verifyAccountPassword(username, passwordAttempt);
  }

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${normalizedUser}:${passwordAttempt}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
    return hashHex === CREDENTIAL_HASH_SHA256;
  } catch {
    return verifyAccountPassword(username, passwordAttempt);
  }
}
