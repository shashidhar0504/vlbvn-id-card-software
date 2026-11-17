import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('====================================================================');
console.log('  VLBVN Community – Digital Membership & ID Card Management System');
console.log('  Veerashaiva Lingayat Business Visionary Network');
console.log('====================================================================');
console.log('  Starting server on http://localhost:5000 ...');

const serverProcess = spawn('npx', ['tsx', 'src/index.ts'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true
});

serverProcess.on('error', (err) => {
  console.error('Failed to start server:', err);
});
