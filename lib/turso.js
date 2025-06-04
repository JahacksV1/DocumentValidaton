import { createClient } from "@libsql/client";

function validateTursoUrl(url) {
  if (!url) {
    throw new Error('TURSO_DATABASE_URL is not set');
  }

  // Remove any surrounding quotes, whitespace, newlines, and carriage returns
  const cleanUrl = url
    .trim()
    .replace(/[\r\n]/g, '')
    .replace(/^["']|["']$/g, '')
    .trim();
  
  if (!cleanUrl.startsWith('libsql://')) {
    throw new Error('TURSO_DATABASE_URL must start with libsql://');
  }

  // Log the cleaned URL for debugging
  console.log('Connecting to Turso database:', cleanUrl);
  
  return cleanUrl;
}

function validateAuthToken(token) {
  if (!token) {
    throw new Error('TURSO_AUTH_TOKEN is not set');
  }
  
  // Remove any surrounding quotes, whitespace, newlines, and carriage returns
  const cleanToken = token
    .trim()
    .replace(/[\r\n]/g, '')
    .replace(/^["']|["']$/g, '')
    .trim();
  
  if (cleanToken === 'your-auth-token-here') {
    console.warn('Warning: Using placeholder TURSO_AUTH_TOKEN. Please set a real token in .env.local');
  }
  
  return cleanToken;
}

let turso = null;

// Only initialize on server side
if (typeof window === 'undefined') {
  try {
    const url = validateTursoUrl(process.env.TURSO_DATABASE_URL);
    const authToken = validateAuthToken(process.env.TURSO_AUTH_TOKEN);

    turso = createClient({
      url,
      authToken
    });

    // Test the connection
    turso.execute("SELECT 1").then(() => {
      console.log('Successfully connected to Turso database');
    }).catch(error => {
      console.error('Failed to connect to Turso database:', error);
    });
  } catch (error) {
    console.error('Error initializing Turso client:', error);
    throw error;
  }
}

export default turso; 