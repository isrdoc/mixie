#!/usr/bin/env node

const { execSync } = require('child_process');

async function checkVercelEnvLimits() {
  try {
    console.log('🔍 Checking Vercel environment variable usage...');
    
    // Get all environment variables
    const envListOutput = execSync('pnpm vercel env list preview', { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Parse the output to count variables
    const lines = envListOutput.split('\n');
    const envVarLines = lines.filter(line => 
      line.trim() && 
      !line.includes('name') && 
      !line.includes('---') &&
      !line.includes('Environment Variables found') &&
      !line.includes('Vercel CLI') &&
      !line.includes('Retrieving project')
    );
    
    const totalVars = envVarLines.length;
    const limit = 100;
    const usagePercent = Math.round((totalVars / limit) * 100);
    
    console.log('\n📊 Vercel Environment Variable Usage:');
    console.log(`   Total variables: ${totalVars}/${limit} (${usagePercent}%)`);
    
    // Analyze branch-specific variables
    const branchVars = envVarLines.filter(line => line.includes('_VITE_') || line.includes('_SUPABASE_') || line.includes('_POSTGRES_'));
    const branchCount = Math.floor(branchVars.length / 12); // Assuming 12 vars per branch
    
    console.log(`   Branch-specific vars: ${branchVars.length}`);
    console.log(`   Estimated branches: ~${branchCount}`);
    
    // Warning levels
    if (usagePercent >= 90) {
      console.log('\n🚨 WARNING: Approaching variable limit!');
      console.log('   Consider cleaning up old branch variables');
    } else if (usagePercent >= 70) {
      console.log('\n⚠️  CAUTION: High variable usage');
      console.log('   Monitor usage and plan cleanup strategy');
    } else {
      console.log('\n✅ Variable usage is within safe limits');
    }
    
    // Show branch breakdown
    console.log('\n🌿 Branch Variable Analysis:');
    const branchPrefixes = new Set();
    
    envVarLines.forEach(line => {
      const match = line.match(/^\s*([A-Z_]+)_(?:VITE_|SUPABASE_|POSTGRES_)/);
      if (match) {
        branchPrefixes.add(match[1]);
      }
    });
    
    if (branchPrefixes.size > 0) {
      console.log(`   Found ${branchPrefixes.size} branch prefixes:`);
      Array.from(branchPrefixes).sort().forEach(prefix => {
        const branchVarCount = envVarLines.filter(line => line.startsWith(`   ${prefix}_`)).length;
        console.log(`   - ${prefix}: ${branchVarCount} variables`);
      });
    } else {
      console.log('   No branch-specific variables found');
    }
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    const remainingCapacity = limit - totalVars;
    const possibleBranches = Math.floor(remainingCapacity / 12);
    
    console.log(`   Can create ~${possibleBranches} more branches (${remainingCapacity} vars remaining)`);
    
    if (possibleBranches < 2) {
      console.log('   🔧 Consider implementing cleanup automation');
      console.log('   🗂️ Consider consolidating variables into JSON objects');
    }
    
    console.log('\n📋 Vercel Limits Reference:');
    console.log('   Max variables per environment: 100');
    console.log('   Max total size: 4KB');
    console.log('   Current approach uses ~12 variables per branch');
    
  } catch (error) {
    console.error('❌ Error checking environment variables:', error.message);
    console.log('\n💡 Make sure you are logged into Vercel CLI');
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  checkVercelEnvLimits()
    .then(() => {
      console.log('\n✅ Environment variable check completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Check failed:', error.message);
      process.exit(1);
    });
}