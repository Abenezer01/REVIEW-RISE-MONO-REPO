import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_HEX_LENGTH = 64; // 32 bytes = 64 hex chars

function getKey(): Buffer {
    const keyHex = process.env.TOKEN_ENCRYPTION_KEY;
    if (!keyHex || keyHex.length !== KEY_HEX_LENGTH) {
        throw new Error(
            `TOKEN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes). ` +
            `Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
        );
    }
    return Buffer.from(keyHex, 'hex');
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Output format: "iv:authTag:ciphertext" (all hex-encoded)
 */
export function encryptToken(plaintext: string): string {
    const key = getKey();
    const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return [
        iv.toString('hex'),
        authTag.toString('hex'),
        encrypted.toString('hex'),
    ].join(':');
}

/**
 * Decrypts a token previously encrypted with encryptToken().
 * Expected format: "iv:authTag:ciphertext" (all hex-encoded)
 */
export function decryptToken(encryptedData: string): string {
    const key = getKey();
    const parts = encryptedData.split(':');

    if (parts.length !== 3) {
        throw new Error('Invalid encrypted token format. Expected "iv:authTag:ciphertext".');
    }

    const [ivHex, authTagHex, ciphertextHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const ciphertext = Buffer.from(ciphertextHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
    ]);

    return decrypted.toString('utf8');
}

/**
 * Returns true if the string looks like an encrypted token
 * (i.e., was produced by encryptToken). Useful during migration
 * to detect whether a stored value is already encrypted.
 */
export function isEncryptedToken(value: string): boolean {
    const parts = value.split(':');
    return (
        parts.length === 3 &&
        parts[0].length === 24 && // 12-byte IV = 24 hex chars
        parts[1].length === 32 && // 16-byte auth tag = 32 hex chars
        parts[2].length > 0
    );
}
