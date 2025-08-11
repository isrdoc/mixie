#!/usr/bin/env node

// Test script to demonstrate the JSON configuration utility
const { getSupabaseConfig, getSupabaseClientConfig, getDatabaseConfig, createEnvVars, sanitizeBranchName } = require('../lib/supabase-config.js');

// Simulate the environment variable (normally set by Vercel)
const testBranch = 'feat/test-supabase-branch';
const sanitizedBranch = sanitizeBranchName(testBranch);
const configVarName = `${sanitizedBranch}_SUPABASE_CONFIG`;

// Set the test environment variable with the JSON we just created
const fs = require('fs');
try {
  const jsonFile = `.env.feat-test-supabase-branch.json`;
  if (fs.existsSync(jsonFile)) {
    const jsonContent = fs.readFileSync(jsonFile, 'utf8');
    process.env[configVarName] = jsonContent;
    console.log(`✅ Loaded test configuration: ${configVarName}`);
  } else {
    console.log('⚠️  JSON config file not found, using fallback');
  }
} catch (error) {
  console.log('⚠️  Could not load JSON config file:', error.message);
}

console.log('\n🧪 Testing JSON Configuration Utility...\n');

try {
  // Test 1: Get full configuration
  console.log('📋 Test 1: Get full Supabase configuration');
  const fullConfig = getSupabaseConfig(testBranch);
  console.log(`   Branch: ${fullConfig.branch}`);
  console.log(`   Timestamp: ${fullConfig.timestamp}`);
  console.log(`   Supabase URL: ${fullConfig.supabase.url}`);
  console.log(`   Database Host: ${fullConfig.database.host}`);
  console.log(`   ✅ Success\n`);

  // Test 2: Get Supabase client config
  console.log('🔧 Test 2: Get Supabase client configuration');
  const clientConfig = getSupabaseClientConfig(testBranch);
  console.log(`   URL: ${clientConfig.url}`);
  console.log(`   Anon Key: ${clientConfig.anonKey.substring(0, 20)}...`);
  console.log(`   Service Role Key: ${clientConfig.serviceRoleKey ? 'Present' : 'Missing'}`);
  console.log(`   ✅ Success\n`);

  // Test 3: Get database config
  console.log('🗄️  Test 3: Get database configuration');
  const dbConfig = getDatabaseConfig(testBranch);
  console.log(`   Host: ${dbConfig.host}`);
  console.log(`   User: ${dbConfig.user}`);
  console.log(`   Database: ${dbConfig.database}`);
  console.log(`   Password: ${dbConfig.password ? '***' + dbConfig.password.slice(-4) : 'Not set'}`);
  console.log(`   ✅ Success\n`);

  // Test 4: Create environment variables object
  console.log('🌍 Test 4: Create environment variables object (compatibility)');
  const envVars = createEnvVars(testBranch);
  console.log(`   VITE_SUPABASE_URL: ${envVars.VITE_SUPABASE_URL}`);
  console.log(`   POSTGRES_HOST: ${envVars.POSTGRES_HOST}`);
  console.log(`   Total variables: ${Object.keys(envVars).length}`);
  console.log(`   ✅ Success\n`);

  // Test 5: Automatic branch detection
  console.log('🎯 Test 5: Automatic branch detection');
  process.env.GITHUB_REF_NAME = testBranch;  // Simulate GitHub Actions
  const autoConfig = getSupabaseConfig();  // No branch parameter
  console.log(`   Detected branch: ${autoConfig.branch}`);
  console.log(`   ✅ Success\n`);

  console.log('🎉 All tests passed!');
  console.log('\n💡 Usage Examples:');
  console.log('   // In your Next.js app:');
  console.log('   import { getSupabaseClientConfig } from "./lib/supabase-config";');
  console.log('   const config = getSupabaseClientConfig();');
  console.log('   const supabase = createClient(config.url, config.anonKey);');
  console.log('');
  console.log('   // In serverless functions:');
  console.log('   import { getDatabaseConfig } from "./lib/supabase-config";');
  console.log('   const dbConfig = getDatabaseConfig();');
  console.log('   const client = new Client({ connectionString: dbConfig.url });');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}