import crypto from 'crypto';

const secretKey = process.env.AES_SECRET_KEY_FOR_STUDENT;

export function encryptImage(buffer) {
    const key = Buffer.from(secretKey, 'base64');

    if (key.length !== 32) {
        throw new Error(`Invalid key length: ${key.length} bytes. AES-256 requires 32 bytes.`);
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return {
        encryptedData: Buffer.concat([iv, encrypted]),
    };
}

export function decryptImage(encryptedBuffer) {
    const key = Buffer.from(secretKey, 'base64');

    if (key.length !== 32) {
        throw new Error(`Invalid key length: ${key.length} bytes. AES-256 requires 32 bytes.`);
    }

    const iv = encryptedBuffer.slice(0, 16); 
    const encryptedData = encryptedBuffer.slice(16); 

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

    return decrypted;
}

