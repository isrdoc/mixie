#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs');
const { execSync } = require('child_process');

// Get current git branch
function getCurrentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    console.warn('⚠️  Could not detect git branch, using default');
    return 'unknown';
  }
}

// Configuration
const currentBranch = getCurrentBranch();
const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'ubdnktdcobjijsppprte';
const SUPABASE_DASHBOARD_URL = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}`;

async function extractSupabaseEnvVars() {
  console.log('🚀 Starting complete Supabase environment extraction...');
  console.log(`🌿 Current git branch: ${currentBranch}`);
  
  // Check if we're on a feature branch
  if (currentBranch.startsWith('feat/')) {
    console.log('');
    console.log('🎯 FEATURE BRANCH DETECTED!');
    console.log('');
    console.log('⚠️  IMPORTANT: Make sure you have the correct Supabase project selected!');
    console.log('');
    
    if (!process.env.SUPABASE_PROJECT_REF) {
      console.log('❌ No SUPABASE_PROJECT_REF provided for feature branch!');
      console.log('');
      console.log('🔧 Please set the project reference for your feature branch:');
      console.log('   SUPABASE_PROJECT_REF=your-feature-project-ref npm run env:extract');
      console.log('');
      process.exit(1);
    }
  }
  
  console.log(`📁 Target project: ${SUPABASE_PROJECT_REF}`);
  console.log(`🔗 Dashboard URL: ${SUPABASE_DASHBOARD_URL}`);
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 500 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Step 1: Navigate and handle authentication
    console.log('🌐 Opening Supabase dashboard...');
    await page.goto(SUPABASE_DASHBOARD_URL, { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    // Wait for authentication if needed
    console.log('🔐 Checking authentication status...');
    const maxAuthWait = 60000; // 1 minute
    const authStart = Date.now();
    
    while (Date.now() - authStart < maxAuthWait) {
      const currentUrl = page.url();
      console.log(`   Current URL: ${currentUrl.substring(0, 80)}...`);
      
      // Check if we're on a dashboard page
      if (currentUrl.includes('/dashboard/project/') && !currentUrl.includes('/sign-in')) {
        console.log('✅ Successfully authenticated!');
        break;
      }
      
      // Check if we need to authenticate
      if (currentUrl.includes('github.com') || currentUrl.includes('sign-in')) {
        console.log('⏳ Please complete authentication in the browser...');
        console.log('   Waiting for you to reach the project dashboard...');
      }
      
      await page.waitForTimeout(3000);
    }
    
    // Navigate to API keys settings (correct URL)
    console.log('🔧 Navigating to API keys settings...');
    await page.goto(`${SUPABASE_DASHBOARD_URL}/settings/api-keys`, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    await page.waitForTimeout(5000);
    
    // Step 2: Extract Project URL
    console.log('📡 Extracting project URL...');
    let projectUrl = `https://${SUPABASE_PROJECT_REF}.supabase.co`; // Default fallback
    
    try {
      // Look for project URL with more specific selectors
      const projectUrlElement = await page.locator('input[readonly][value*=".supabase.co"]').first().waitFor({ timeout: 5000 });
      projectUrl = await projectUrlElement.inputValue();
      console.log(`✅ Found project URL: ${projectUrl}`);
    } catch (error) {
      console.log(`⚠️  Using fallback project URL: ${projectUrl}`);
    }
    
    // Step 3: Reveal and extract API keys
    console.log('🔑 Revealing and extracting API keys...');
    
    // First, click the "Reveal" span to show the service role key
    console.log('🔍 Looking for Reveal span for service role key...');
    const revealSpan = page.locator('span:has-text("Reveal")');
    const revealCount = await revealSpan.count();
    console.log(`   Found ${revealCount} reveal spans`);
    
    for (let i = 0; i < revealCount; i++) {
      try {
        const span = revealSpan.nth(i);
        if (await span.isVisible({ timeout: 2000 })) {
          await span.click();
          console.log(`   Clicked reveal span ${i + 1}`);
          await page.waitForTimeout(2000);
        }
      } catch (e) {
        console.log(`   Span ${i + 1} not clickable`);
      }
    }
    
    // Wait for reveals to complete
    await page.waitForTimeout(3000);
    
    // Extract API keys directly from input fields (based on your HTML structure)
    let anonKey = '';
    let serviceRoleKey = '';
    let jwtSecret = '';
    
    console.log('🔍 Extracting API keys from input fields...');
    
    // Get all input fields with JWT values
    const jwtInputs = page.locator('input[readonly][value^="eyJ"]');
    const jwtCount = await jwtInputs.count();
    console.log(`   Found ${jwtCount} JWT input fields`);
    
    for (let i = 0; i < jwtCount; i++) {
      try {
        const input = jwtInputs.nth(i);
        const value = await input.inputValue();
        
        if (value && value.startsWith('eyJ')) {
          console.log(`   Checking JWT ${i + 1}: ${value.substring(0, 20)}...`);
          
          try {
            const payload = JSON.parse(atob(value.split('.')[1]));
            console.log(`   JWT ${i + 1} role: ${payload.role}`);
            
            if (payload.role === 'anon') {
              anonKey = value;
              console.log('✅ Extracted anon key');
            } else if (payload.role === 'service_role') {
              serviceRoleKey = value;
              console.log('✅ Extracted service_role key');
            }
          } catch (e) {
            console.log(`   JWT ${i + 1} not parseable`);
          }
        }
      } catch (e) {
        // Continue with next input
      }
    }
    
    // Step 3.5: Navigate to JWT settings to get JWT secret
    console.log('🔐 Navigating to JWT settings for JWT secret...');
    await page.goto(`${SUPABASE_DASHBOARD_URL}/settings/jwt`, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    await page.waitForTimeout(5000);
    
    // Click reveal span for JWT secret
    console.log('🔍 Looking for JWT secret reveal span...');
    const jwtRevealSpan = page.locator('span:has-text("Reveal")');
    const jwtRevealCount = await jwtRevealSpan.count();
    console.log(`   Found ${jwtRevealCount} reveal spans on JWT page`);
    
    for (let i = 0; i < jwtRevealCount; i++) {
      try {
        const span = jwtRevealSpan.nth(i);
        if (await span.isVisible({ timeout: 2000 })) {
          await span.click();
          console.log(`   Clicked JWT reveal span ${i + 1}`);
          await page.waitForTimeout(2000);
        }
      } catch (e) {
        console.log(`   JWT span ${i + 1} not clickable`);
      }
    }
    
    // Extract JWT secret from input field
    console.log('🔍 Extracting JWT secret from input field...');
    const jwtSecretInputs = page.locator('input[readonly]:not([value^="eyJ"])');
    const jwtSecretCount = await jwtSecretInputs.count();
    console.log(`   Found ${jwtSecretCount} potential JWT secret inputs`);
    
    for (let i = 0; i < jwtSecretCount; i++) {
      try {
        const input = jwtSecretInputs.nth(i);
        const value = await input.inputValue();
        
        // JWT secrets are long base64 strings like the one you provided
        if (value && value.length > 50 && !value.includes('.supabase.co') && 
            !value.includes('postgres://') && !value.includes('@') && !value.startsWith('eyJ')) {
          jwtSecret = value;
          console.log('✅ Extracted JWT secret from JWT settings page');
          console.log(`   JWT Secret preview: ${value.substring(0, 20)}...`);
          break;
        }
      } catch (e) {
        // Continue with next input
      }
    }
    
    // Step 4: Reset database password
    console.log('🔄 Navigating to database settings to reset password...');
    await page.goto(`${SUPABASE_DASHBOARD_URL}/database/settings`, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    await page.waitForTimeout(5000);
    
    let dbPassword = '';
    
    try {
      // Step 1: Click "Reset database password" span to open modal
      console.log('🔄 Looking for "Reset database password" button...');
      const resetDatabasePasswordButton = page.locator('span:has-text("Reset database password")');
      
      if (await resetDatabasePasswordButton.first().isVisible({ timeout: 10000 })) {
        console.log('🔄 Found "Reset database password" button, clicking...');
        await resetDatabasePasswordButton.first().click();
        await page.waitForTimeout(3000);
        
        // Step 2: Click "Generate a password" span
        console.log('🔄 Looking for "Generate a password" span...');
        const generatePasswordButton = page.locator('span.cursor-pointer:has-text("Generate a password"), span:has-text("Generate a password")');
        
        if (await generatePasswordButton.first().isVisible({ timeout: 5000 })) {
          console.log('🔄 Found "Generate a password" span, clicking...');
          await generatePasswordButton.first().click();
          
          // Wait for password generation and copy button
          console.log('⏳ Waiting for password generation and copy button...');
          await page.waitForTimeout(8000);
          
          // Step 3: Click copy button to get password
          console.log('🔍 Looking for copy button...');
          const copyButton = page.locator('button:has-text("Copy"), button:has(svg[class*="copy"]), button:has([class*="copy"])').first();
          
          if (await copyButton.isVisible({ timeout: 5000 })) {
            console.log('✅ Found copy button - password was generated!');
            
            // Click the copy button to copy password to clipboard
            console.log('📋 Clicking copy button to get password...');
            await copyButton.click();
            await page.waitForTimeout(1000);
            
            // Get password from clipboard
            try {
              const clipboardContent = await page.evaluate(async () => {
                try {
                  return await navigator.clipboard.readText();
                } catch (e) {
                  return '';
                }
              });
              
              if (clipboardContent && clipboardContent.length > 15) {
                dbPassword = clipboardContent.trim();
                console.log('✅ Successfully extracted password from clipboard');
                console.log(`   Password preview: ${dbPassword.substring(0, 8)}...`);
              } else {
                console.log('⚠️  Clipboard content seems invalid');
              }
            } catch (e) {
              console.log('⚠️  Could not read from clipboard:', e.message);
            }
            
            // Step 4: Click "Reset password" button to close modal
            console.log('🔄 Looking for "Reset password" button to close modal...');
            const resetPasswordCloseButton = page.locator('button:has-text("Reset password"), span:has-text("Reset password")');
            
            if (await resetPasswordCloseButton.first().isVisible({ timeout: 3000 })) {
              console.log('🔄 Clicking "Reset password" to close modal...');
              await resetPasswordCloseButton.first().click();
              await page.waitForTimeout(2000);
              console.log('✅ Modal closed successfully');
            } else {
              console.log('⚠️  Reset password close button not found, modal may still be open');
            }
          } else {
            console.log('⚠️  Copy button not found after password generation');
            console.log('   Trying fallback method to extract password from visible elements...');
            
            // Fallback: Look for password in input fields if clipboard fails
            const passwordInputs = page.locator('input[readonly][value]:not([value=""]):not([value*="@"]):not([value*=".supabase.co"])');
            const inputCount = await passwordInputs.count();
            
            for (let i = 0; i < inputCount; i++) {
              try {
                const input = passwordInputs.nth(i);
                const value = await input.inputValue();
                
                if (value && value.length > 15 && !value.startsWith('eyJ') && 
                    !value.includes('postgres://') && !value.includes(' ')) {
                  dbPassword = value.trim();
                  console.log('✅ Extracted password from input field (fallback)');
                  console.log(`   Password preview: ${dbPassword.substring(0, 8)}...`);
                  break;
                }
              } catch (e) {
                // Continue
              }
            }
          }
        } else {
          console.log('⚠️  Generate a password span not found');
        }
        
      } else {
        console.log('⚠️  Reset database password button not found');
      }
    } catch (error) {
      console.log('⚠️  Error during password generation:', error.message);
    }
    
    // Step 5: Build Environment Variables
    console.log('📝 Building environment configuration...');
    
    const envVars = {
      VITE_SUPABASE_URL: projectUrl,
      VITE_SUPABASE_ANON_KEY: anonKey,
      SUPABASE_URL: projectUrl,
      SUPABASE_ANON_KEY: anonKey,
      SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
      SUPABASE_JWT_SECRET: jwtSecret,
      POSTGRES_HOST: `db.${SUPABASE_PROJECT_REF}.supabase.co`,
      POSTGRES_USER: `postgres.${SUPABASE_PROJECT_REF}`,
      POSTGRES_PASSWORD: dbPassword || '[MANUAL_SETUP_REQUIRED]',
      POSTGRES_DATABASE: 'postgres'
    };
    
    // Build connection strings
    if (dbPassword) {
      envVars.POSTGRES_URL = `postgres://postgres.${SUPABASE_PROJECT_REF}:${dbPassword}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x`;
      envVars.POSTGRES_URL_NON_POOLING = `postgres://postgres.${SUPABASE_PROJECT_REF}:${dbPassword}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require`;
    }
    
    // Step 6: Write to .env.feat
    console.log('💾 Writing environment variables to .env.feat...');
    
    const envContent = `# Supabase Environment Variables (Extracted: ${new Date().toISOString()})
# Project: ${SUPABASE_PROJECT_REF}

# Vite/Frontend variables (exposed to browser)
VITE_SUPABASE_URL=${envVars.VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${envVars.VITE_SUPABASE_ANON_KEY}

# Backend/Server variables (for migrations, etc.)
SUPABASE_URL="${envVars.SUPABASE_URL}"
SUPABASE_ANON_KEY="${envVars.SUPABASE_ANON_KEY}"
SUPABASE_SERVICE_ROLE_KEY="${envVars.SUPABASE_SERVICE_ROLE_KEY}"
SUPABASE_JWT_SECRET="${envVars.SUPABASE_JWT_SECRET}"

# Database connection strings
POSTGRES_HOST="${envVars.POSTGRES_HOST}"
POSTGRES_USER="${envVars.POSTGRES_USER}"
POSTGRES_PASSWORD="${envVars.POSTGRES_PASSWORD}"
POSTGRES_DATABASE="${envVars.POSTGRES_DATABASE}"
${envVars.POSTGRES_URL ? `POSTGRES_URL="${envVars.POSTGRES_URL}"` : '# POSTGRES_URL=[SETUP_PASSWORD_FIRST]'}
${envVars.POSTGRES_URL_NON_POOLING ? `POSTGRES_URL_NON_POOLING="${envVars.POSTGRES_URL_NON_POOLING}"` : '# POSTGRES_URL_NON_POOLING=[SETUP_PASSWORD_FIRST]'}
`;
    
    fs.writeFileSync('.env.feat', envContent);
    
    console.log('\n🎉 Complete extraction finished!');
    console.log('📋 Extraction Summary:');
    console.log(`   Project URL: ${envVars.VITE_SUPABASE_URL}`);
    console.log(`   Anon Key: ${envVars.VITE_SUPABASE_ANON_KEY ? 'Extracted ✅' : 'Missing ❌'}`);
    console.log(`   Service Role: ${envVars.SUPABASE_SERVICE_ROLE_KEY ? 'Extracted ✅' : 'Missing ❌'}`);
    console.log(`   JWT Secret: ${envVars.SUPABASE_JWT_SECRET ? 'Extracted ✅' : 'Missing ❌'}`);
    console.log(`   DB Password: ${envVars.POSTGRES_PASSWORD !== '[MANUAL_SETUP_REQUIRED]' ? 'Reset & Extracted ✅' : 'Failed to Reset ❌'}`);
    
    if (dbPassword) {
      console.log('\n🔒 Database password was successfully reset for security!');
      console.log('   New password has been automatically extracted and configured.');
    }
    
    const missingCount = [anonKey, serviceRoleKey, jwtSecret, dbPassword].filter(x => !x).length;
    if (missingCount > 0) {
      console.log(`\n⚠️  ${missingCount} values still need manual extraction.`);
      console.log('   Please ensure you clicked all "Reveal" buttons in the dashboard');
      console.log('   Check the browser window for any missing steps');
    } else {
      console.log('\n🎯 All environment variables successfully extracted!');
      console.log('   Your .env.feat file is ready for use');
    }
    
    return envVars;
    
  } catch (error) {
    console.error('❌ Error during complete extraction:', error.message);
    throw error;
  } finally {
    console.log('\n⏸️  Browser will stay open for 20 seconds for verification...');
    await page.waitForTimeout(20000);
    await browser.close();
  }
}

// Main execution
if (require.main === module) {
  extractSupabaseEnvVars()
    .then(() => {
      console.log('✅ Complete environment extraction finished!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Extraction failed:', error.message);
      process.exit(1);
    });
}