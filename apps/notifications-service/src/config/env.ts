import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

const candidates = [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../../.env.local'),
    path.resolve(process.cwd(), '../../.env'),
    path.resolve(__dirname, '../.env.local'),
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../../.env.local'),
    path.resolve(__dirname, '../../.env'),
    path.resolve(__dirname, '../../../.env.local'),
    path.resolve(__dirname, '../../../.env')
];

for (const envPath of candidates) {
    if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath, override: false });
    }
}

