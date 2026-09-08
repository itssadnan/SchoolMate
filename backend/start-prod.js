const { execSync } = require('child_process');

// Validate DATABASE_URL for PostgreSQL
if (!process.env.DATABASE_URL) {
  console.error('⚠️ Warning: DATABASE_URL environment variable is not defined!');
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

console.log('🌱 Checking database initialization state...');
try {
  execSync('npx tsx prisma/seed.ts', { stdio: 'inherit', env: process.env });
} catch (e) {
  console.warn('Seed step completed with notice:', e.message);
}

console.log('🚀 Launching SchoolMate server...');
require('./dist/server.js');
