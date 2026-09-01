const { spawn } = require('child_process');
const path = require('path');

console.log('================================================================');
console.log('🚀 Menjalankan Server SiPesand (Sistem Terpadu Pesantren Digital)');
console.log('================================================================\n');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// 1. Jalankan Backend (Port 5000)
const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'pipe',
  shell: true,
  env: { ...process.env, FORCE_COLOR: '1' }
});

backend.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach(line => {
    if (line.trim()) {
      console.log(`\x1b[32m[BACKEND 5000]\x1b[0m ${line}`);
    }
  });
});

backend.stderr.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach(line => {
    if (line.trim()) {
      console.error(`\x1b[31m[BACKEND ERR]\x1b[0m ${line}`);
    }
  });
});

// 2. Jalankan Frontend Vite (Port 3000)
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'pipe',
  shell: true,
  env: { ...process.env, FORCE_COLOR: '1' }
});

frontend.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach(line => {
    if (line.trim()) {
      console.log(`\x1b[33m[FRONTEND 3000]\x1b[0m ${line}`);
    }
  });
});

frontend.stderr.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach(line => {
    if (line.trim()) {
      console.error(`\x1b[31m[FRONTEND ERR]\x1b[0m ${line}`);
    }
  });
});

// Handling Graceful Shutdown
const cleanup = () => {
  console.log('\n🛑 Menghentikan server backend & frontend...');
  if (isWindows) {
    if (backend.pid) spawn('taskkill', ['/pid', backend.pid, '/f', '/t']);
    if (frontend.pid) spawn('taskkill', ['/pid', frontend.pid, '/f', '/t']);
  } else {
    backend.kill();
    frontend.kill();
  }
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
