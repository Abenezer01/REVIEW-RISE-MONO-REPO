import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;

/**
 * Get encryption key from environment variable
 * The key should be a 32-byte (256-bit) base64-encoded string
 */
function getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;

    if (!key) {
        throw new Error('ENCRYPTION_KEY environment variable is not set');
    }

    // If the key is base64-encoded, decode it
    try {
        const decodedKey = Buffer.from(key, 'base64');
        if (decodedKey.length === 32) {
            return decodedKey;
        }
    } catch (error) {
        // If decoding fails, try to use the key as-is
    }

    // If the key is a plain string, derive a 32-byte key from it
    return crypto.scryptSync(key, 'salt', 32);
}

/**
 * Encrypt sensitive data using AES-256-GCM
 * @param plaintext - The data to encrypt
 * @returns Base64-encoded encrypted data with IV and auth tag prepended
 */
export function encrypt(plaintext: string): string {
    if (!plaintext) {
        throw new Error('Cannot encrypt empty string');
    }

    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const authTag = cipher.getAuthTag();

    // Combine IV + authTag + encrypted data
    const combined = Buffer.concat([
        iv,
        authTag,
        Buffer.from(encrypted, 'base64')
    ]);

    return combined.toString('base64');
}

/**
 * Decrypt data encrypted with the encrypt function
 * @param ciphertext - Base64-encoded encrypted data with IV and auth tag
 * @returns Decrypted plaintext
 */
export function decrypt(ciphertext: string): string {
    if (!ciphertext) {
        throw new Error('Cannot decrypt empty string');
    }

    const key = getEncryptionKey();
    const combined = Buffer.from(ciphertext, 'base64');

    // Extract IV, authTag, and encrypted data
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted.toString('base64'), 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

/**
 * Generate a secure random encryption key
 * This should be run once and the output stored securely
 * @returns Base64-encoded 32-byte encryption key
 */
export function generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('base64');
}
