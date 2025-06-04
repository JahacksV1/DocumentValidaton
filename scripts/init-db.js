const { createClient } = require("@libsql/client");
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function initDatabase() {
  try {
    const rawUrl = process.env.TURSO_DATABASE_URL;
    const rawAuthToken = process.env.TURSO_AUTH_TOKEN;

    console.log('Environment check:');
    console.log('URL:', rawUrl ? `${rawUrl.substring(0, 30)}...` : 'NOT SET');
    console.log('Auth Token:', rawAuthToken ? 'SET' : 'NOT SET');

    if (!rawUrl || !rawAuthToken) {
      console.error('\n❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
      console.error('\nPlease create a .env.local file with:');
      console.error('TURSO_DATABASE_URL=libsql://your-database.turso.io');
      console.error('TURSO_AUTH_TOKEN=your-auth-token\n');
      process.exit(1);
    }

    // Clean the URL and token
    const url = rawUrl.trim().replace(/[\r\n]/g, '').replace(/^["']|["']$/g, '').trim();
    const authToken = rawAuthToken.trim().replace(/[\r\n]/g, '').replace(/^["']|["']$/g, '').trim();

    console.log('\nCleaned URL:', url);

    const turso = createClient({ url, authToken });

    // Read and execute schema.sql
    const schema = fs.readFileSync(
      path.join(process.cwd(), 'schema.sql'),
      'utf8'
    );

    // Split and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log('\nExecuting database schema...');
    for (const statement of statements) {
      await turso.execute(statement);
      console.log('✅ Executed:', statement.split('\n')[0] + '...');
    }

    console.log('\n✅ Database initialized successfully!');
  } catch (error) {
    console.error('\n❌ Error initializing database:', error.message);
    if (error.message.includes('already exists')) {
      console.log('\n💡 Tables already exist. The database is ready to use.');
    }
    process.exit(1);
  }
}

initDatabase(); 