// Runs the API (port 5000) and the Vite storefront (port 5173) together: `npm run dev`
import { spawn } from 'node:child_process';

const run = (name, args) => {
  const child = spawn('npm', ['--prefix', name, ...args], { stdio: 'inherit', shell: true });
  child.on('exit', (code) => process.exit(code ?? 0));
  return child;
};
run('backend', ['run', 'dev']);
run('frontend', ['run', 'dev']);
