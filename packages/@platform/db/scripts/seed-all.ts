import dotenv from 'dotenv';
import path from 'path';
import { spawn } from 'child_process';

const envPath = path.resolve(__dirname, '../../../../.env');
dotenv.config({ path: envPath });

function runScript(scriptRelPath: string) {
  return new Promise<void>((resolve, reject) => {
    const isWin = process.platform === 'win32';
    const cmd = isWin ? 'tsx.cmd' : 'tsx';
    const child = spawn(cmd, [scriptRelPath], {
      stdio: 'inherit',
      shell: true,
      env: process.env,
      cwd: path.resolve(__dirname, '../')  // run from package dir to avoid Windows space path issues
    });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Script failed: ${scriptRelPath} (code ${code})`));
    });
  });
}

async function main() {
  console.log('🌱 Seeding: base data');
  await runScript('scripts/seed.ts');

  console.log('🌱 Seeding: visibility data');
  await runScript('scripts/seed-visibility.ts');

  console.log('🌱 Seeding: competitors data');
  await runScript('scripts/seed-competitors.ts');

  console.log('🌱 Seeding: brand rise data');
  await runScript('scripts/seed-brand-rise.ts');

  console.log('✅ All seeders completed');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
