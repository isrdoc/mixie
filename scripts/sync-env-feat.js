#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔄 Syncing preview environment variables from Vercel...');

try {
  // Pull environment variables from Vercel preview
  console.log('📥 Pulling variables from Vercel...');
  execSync('pnpm vercel env pull .env.temp --environment=preview', { stdio: 'inherit' });
  
  // Read the temporary env file
  const envContent = fs.readFileSync('.env.temp', 'utf8');
  const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  // Parse environment variables
  const envVars = {};
  envLines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').replace(/^"(.*)"$/, '$1'); // Remove quotes
      envVars[key] = value;
    }
  });
  
  console.log('🔄 Formatting variables for Vite...');
  
  // Create formatted content
  const formattedContent = `# Remote Supabase Preview
VITE_SUPABASE_URL=${envVars.NEXT_PUBLIC_SUPABASE_URL || envVars.SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || envVars.SUPABASE_ANON_KEY}

# For backend/server-side operations (migrations, etc.)
SUPABASE_URL="${envVars.SUPABASE_URL}"
SUPABASE_ANON_KEY="${envVars.SUPABASE_ANON_KEY}"
SUPABASE_SERVICE_ROLE_KEY="${envVars.SUPABASE_SERVICE_ROLE_KEY}"
SUPABASE_JWT_SECRET="${envVars.SUPABASE_JWT_SECRET}"

# Database connection strings (if needed for migrations)
POSTGRES_URL="${envVars.POSTGRES_URL}"
POSTGRES_URL_NON_POOLING="${envVars.POSTGRES_URL_NON_POOLING}"
`;

  // Write formatted content to .env.feat
  fs.writeFileSync('.env.feat', formattedContent);
  
  // Clean up temporary file
  fs.unlinkSync('.env.temp');
  
  console.log('✅ Successfully synced environment variables to .env.feat');
  console.log('🎯 Preview Supabase environment ready for use');
  
} catch (error) {
  console.error('❌ Error syncing environment variables:', error.message);
  
  // Clean up temporary file if it exists
  if (fs.existsSync('.env.temp')) {
    fs.unlinkSync('.env.temp');
  }
  
  process.exit(1);
}