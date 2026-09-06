const { execSync } = require('child_process');

// Ensure DATABASE_URL fallback if not explicitly set in hosting environment
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./schoolmate.db';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'schoolmate-super-secret-jwt-key-2026';
}

console.log('📦 Synchronizing Prisma database schema...');
try {
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit', env: process.env });
} catch (e) {
  console.error('Failed to push database schema:', e);
  process.exit(1);
}

console.log('🌱 Seeding initial school data and demo personas...');
try {
  execSync('npx tsx prisma/seed.ts', { stdio: 'inherit', env: process.env });
} catch (e) {
  console.warn('Seed step completed:', e.message);
}

console.log('🚀 Launching SchoolMate server...');
require('./dist/server.js');
