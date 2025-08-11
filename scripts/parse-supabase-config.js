#!/usr/bin/env node

/**
 * Parse Supabase configuration JSON and output GitHub Actions variables
 * Usage: node parse-supabase-config.js CONFIG_VAR_NAME
 */

const fs = require('fs');

function main() {
  const configVarName = process.argv[2];
  
  if (!configVarName) {
    console.error('❌ Error: CONFIG_VAR_NAME argument required');
    console.error('Usage: node parse-supabase-config.js CONFIG_VAR_NAME');
    process.exit(1);
  }

  // Get the JSON configuration from environment variable
  const configJson = process.env[configVarName];
  
  if (!configJson) {
    console.error(`❌ No JSON configuration found for variable: ${configVarName}`);
    console.error('Available environment variables:');
    const supabaseVars = Object.keys(process.env).filter(key => key.includes('SUPABASE_CONFIG'));
    if (supabaseVars.length > 0) {
      supabaseVars.forEach(key => console.error(`  - ${key}`));
    } else {
      console.error('  No Supabase config variables found');
    }
    process.exit(1);
  }

  console.log(`✅ Found JSON configuration for variable: ${configVarName}`);
  console.log(`📋 JSON preview (first 100 chars): ${configJson.substring(0, 100)}`);
  console.log(`📏 JSON length: ${configJson.length}`);

  let config;
  try {
    config = JSON.parse(configJson);
    console.log('✅ JSON is valid');
  } catch (error) {
    console.error('❌ JSON parsing failed:', error.message);
    console.error('Raw JSON content (first 200 chars):');
    console.error(configJson.substring(0, 200));
    process.exit(1);
  }

  // Validate required structure
  if (!config.supabase || !config.database) {
    console.error('❌ Invalid JSON structure: missing supabase or database sections');
    console.error('Config structure:', Object.keys(config));
    process.exit(1);
  }

  // Extract values safely
  const outputs = {
    supabase_url: config.supabase?.url || '',
    supabase_anon_key: config.supabase?.anonKey || '',
    supabase_service_role_key: config.supabase?.serviceRoleKey || '',
    supabase_jwt_secret: config.supabase?.jwtSecret || '',
    postgres_url: config.database?.url || '',
    postgres_host: config.database?.host || '',
    postgres_user: config.database?.user || '',
    postgres_password: config.database?.password || '',
    postgres_database: config.database?.database || '',
  };

  // Check if GITHUB_OUTPUT is set (we're in GitHub Actions)
  const githubOutput = process.env.GITHUB_OUTPUT;
  
  if (githubOutput) {
    // Write to GitHub Actions output file
    console.log('📝 Writing outputs to GitHub Actions...');
    const outputLines = Object.entries(outputs)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    fs.appendFileSync(githubOutput, outputLines + '\n');
    console.log('✅ All outputs written to GitHub Actions');
  } else {
    // Local testing - just print the outputs
    console.log('🧪 Local testing mode - outputs:');
    Object.entries(outputs).forEach(([key, value]) => {
      const maskedValue = key.includes('key') || key.includes('password') || key.includes('secret') 
        ? '***' 
        : value;
      console.log(`  ${key}=${maskedValue}`);
    });
  }

  // Print summary
  console.log(`🎯 Successfully parsed configuration for branch: ${config.branch || 'unknown'}`);
  console.log(`📊 Extracted ${Object.keys(outputs).length} configuration values`);
}

main();
