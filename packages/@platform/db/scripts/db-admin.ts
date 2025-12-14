
import { spawn } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';
// Load env vars from root
const envPath = path.resolve(__dirname, '../../../../.env'); // packages/@platform/db/scripts/.. -> packages/@platform/db -> packages/@platform -> packages -> root

dotenv.config({ path: envPath });

const adminUrl = process.env.DATABASE_ADMIN_URL;

if (!adminUrl) {
  console.error('Error: DATABASE_ADMIN_URL is not defined in .env');
  process.exit(1);
}

// Check if we are aiming for the same DB
// Simple check: compare host/port/dbname if possible, or just trust the user.
// This script assumes we want to run the command AGAINST the DB pointed to by adminUrl
// BUT masquerading as DATABASE_URL for Prisma.

console.log('🔒 switching to ADMIN credentials for migration...');

const env = {
  ...process.env,
  DATABASE_URL: adminUrl,
};

// get args
const args = process.argv.slice(2);
const command = args[0]; // e.g. "prisma"
const commandArgs = args.slice(1);

// Windows compatibility for spawning commands (npx, prisma, etc)
const isWin = process.platform === 'win32';
const cmd = isWin && command === 'prisma' ? 'prisma.cmd' : command;

const child = spawn(cmd, commandArgs, {
  env,
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
