require('dotenv').config({ path: '.env.local' });

console.log('Checking environment variables...\n');

const requiredVars = ['TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN'];
let allPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: Set (${value.substring(0, 20)}...)`);
  } else {
    console.log(`❌ ${varName}: Not set`);
    allPresent = false;
  }
});

console.log('\n');

if (!allPresent) {
  console.log('⚠️  Please ensure your .env.local file contains:');
  console.log('TURSO_DATABASE_URL=libsql://your-database.turso.io');
  console.log('TURSO_AUTH_TOKEN=your-auth-token\n');
  process.exit(1);
} else {
  console.log('✅ All environment variables are set!');
} 