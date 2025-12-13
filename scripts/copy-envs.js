const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const ignoreDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];

function walkDir(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!ignoreDirs.includes(file)) {
                walkDir(fullPath);
            }
        } else if (file === '.env.example') {
            const envPath = path.join(dir, '.env');
            if (!fs.existsSync(envPath)) {
                fs.copyFileSync(fullPath, envPath);
                console.log(`Created .env from .env.example in ${dir}`);
            } else {
                console.log(`Skipped ${dir} (.env already exists)`);
            }
        }
    }
}

console.log('Scanning for .env.example files...');
walkDir(rootDir);
console.log('Done.');
