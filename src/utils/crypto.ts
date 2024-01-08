import * as crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const iv = Buffer.alloc(16, 0);

export const encryptString = (string: string): string => {
    const key = crypto.scryptSync(process.env.CRYPTO_KEY, 'some-salt', 32);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(string, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

export const decryptString = (encryptedString: string): string => {
    const key = crypto.scryptSync(process.env.CRYPTO_KEY, 'some-salt', 32);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedString, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
};
