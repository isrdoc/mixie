#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");

async function createGitHubEnvironmentJSON() {
  try {
    // Get current git branch
    const currentBranch = execSync("git branch --show-current", {
      encoding: "utf8",
    }).trim();
    console.log(`🌿 Current git branch: ${currentBranch}`);

    // Read .env.feat file
    const envFilePath = ".env.feat";
    if (!fs.existsSync(envFilePath)) {
      throw new Error(
        ".env.feat file not found. Please run env:extract first."
      );
    }

    const envContent = fs.readFileSync(envFilePath, "utf8");
    console.log(`📄 Reading environment variables from ${envFilePath}...`);

    // Parse environment variables
    const envVars = {};
    const lines = envContent.split("\n");

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip comments and empty lines
      if (
        trimmedLine.startsWith("#") ||
        !trimmedLine ||
        !trimmedLine.includes("=")
      ) {
        continue;
      }

      // Parse key=value pairs
      const equalIndex = trimmedLine.indexOf("=");
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex);
        let value = trimmedLine.substring(equalIndex + 1);

        // Remove surrounding quotes if present
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        if (value && value !== "[MANUAL_SETUP_REQUIRED]") {
          envVars[key] = value;
        }
      }
    }

    const envVarCount = Object.keys(envVars).length;
    console.log(`📋 Found ${envVarCount} environment variables to consolidate`);

    // Create branch-specific JSON variable name
    const sanitizedBranch = currentBranch
      .replace(/[^a-zA-Z0-9]/g, "_")
      .toUpperCase();
    const jsonVarName = `${sanitizedBranch}_SUPABASE_CONFIG`;

    console.log(`🚀 Creating GitHub secret: ${jsonVarName}`);
    console.log("💡 This reduces from 12 variables per branch to just 1!");

    // Create JSON configuration object
    const config = {
      branch: currentBranch,
      timestamp: new Date().toISOString(),
      supabase: {
        url: envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL,
        anonKey: envVars.VITE_SUPABASE_ANON_KEY || envVars.SUPABASE_ANON_KEY,
        serviceRoleKey: envVars.SUPABASE_SERVICE_ROLE_KEY,
        jwtSecret: envVars.SUPABASE_JWT_SECRET,
      },
      database: {
        host: envVars.POSTGRES_HOST,
        user: envVars.POSTGRES_USER,
        password: envVars.POSTGRES_PASSWORD,
        database: envVars.POSTGRES_DATABASE,
        url: envVars.POSTGRES_URL,
        urlNonPooling: envVars.POSTGRES_URL_NON_POOLING,
      },
    };

    // Convert to JSON string
    const jsonConfig = JSON.stringify(config, null, 2);
    const compactJsonConfig = JSON.stringify(config);

    console.log(`📏 JSON size: ${compactJsonConfig.length} bytes`);

    // Check if it fits within reasonable limits (GitHub secrets have 64KB limit)
    if (compactJsonConfig.length > 4000) {
      console.log(
        "⚠️  JSON is quite large, but should still fit within GitHub limits (64KB)"
      );
    } else {
      console.log("✅ JSON size is optimal for GitHub secrets");
    }

    // Create local reference files
    const branchEnvFile = `.env.${currentBranch.replace(/[^a-zA-Z0-9]/g, "-")}`;
    const branchJsonFile = `.env.${currentBranch.replace(/[^a-zA-Z0-9]/g, "-")}.json`;

    console.log(`📝 Creating local reference files...`);
    fs.writeFileSync(branchEnvFile, envContent);
    fs.writeFileSync(branchJsonFile, jsonConfig);

    // Get GitHub repository info
    let repoInfo = "";
    try {
      const remoteUrl = execSync("git remote get-url origin", {
        encoding: "utf8",
      }).trim();
      // Extract owner/repo from URL (supports both SSH and HTTPS)
      const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
      if (match) {
        repoInfo = `${match[1]}/${match[2]}`;
      }
    } catch (error) {
      console.log("⚠️  Could not determine GitHub repository info");
    }

    // Check if GitHub CLI is available
    try {
      execSync("gh --version", { stdio: "pipe" });
    } catch (error) {
      console.log("\n❌ GitHub CLI (gh) is not installed or not available");
      console.log(
        "📖 Please install GitHub CLI to automatically create secrets:"
      );
      console.log("   https://cli.github.com/");
      console.log("\n📋 Manual setup instructions:");
      console.log("1. Go to your GitHub repository settings");
      console.log("2. Navigate to Secrets and variables → Actions");
      console.log('3. Click "New repository secret"');
      console.log(`4. Name: ${jsonVarName}`);
      console.log(`5. Value: ${compactJsonConfig}`);
      console.log("\n💾 Local files created for reference:");
      console.log(`   ${branchEnvFile}`);
      console.log(`   ${branchJsonFile}`);
      return;
    }

    // Create GitHub secret using GitHub CLI
    console.log(`🚀 Setting GitHub secret using GitHub CLI...`);

    try {
      // Write JSON to a temporary file to avoid command line length limits
      const tempFile = `.temp-${jsonVarName}.json`;
      fs.writeFileSync(tempFile, compactJsonConfig);

      try {
        const createCmd = `gh secret set ${jsonVarName} < ${tempFile}`;
        execSync(createCmd, { stdio: "pipe" });
        console.log(`✅ ${jsonVarName} created/updated successfully in GitHub`);
      } finally {
        // Clean up temp file
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    } catch (secretError) {
      console.log(`⚠️  Failed to set GitHub secret: ${secretError.message}`);
      console.log("\n📋 Manual setup required:");
      console.log("1. Go to your GitHub repository settings");
      console.log("2. Navigate to Secrets and variables → Actions");
      console.log('3. Click "New repository secret"');
      console.log(`4. Name: ${jsonVarName}`);
      console.log(`5. Value: ${compactJsonConfig}`);
    }

    console.log(`\n🎉 GitHub secret setup completed!`);
    console.log(`🔗 Secret name: ${jsonVarName}`);
    console.log(`📁 Local files: ${branchEnvFile}, ${branchJsonFile}`);
    if (repoInfo) {
      console.log(`📍 Repository: ${repoInfo}`);
    }

    // Show configuration preview
    console.log("\n📊 Configuration Preview:");
    console.log(`   Branch: ${config.branch}`);
    console.log(`   Supabase URL: ${config.supabase.url?.substring(0, 30)}...`);
    console.log(`   Database Host: ${config.database.host}`);
    console.log(
      `   Database Password: ${config.database.password ? "***" + config.database.password.slice(-4) : "Not set"}`
    );
    console.log(`   Timestamp: ${config.timestamp}`);

    console.log("\n💡 Usage in GitHub Actions:");
    console.log(
      '   CONFIG_JSON="${{ secrets[steps.branch.outputs.config_var] }}"'
    );
    console.log(
      "   echo \"supabase_url=$(echo '$CONFIG_JSON' | jq -r '.supabase.url')\" >> $GITHUB_OUTPUT"
    );

    console.log("\n🔧 For local development:");
    console.log(
      "   import { getSupabaseClientConfig } from './lib/supabase-config';"
    );
    console.log("   const config = getSupabaseClientConfig();");

    console.log("\n🏆 Benefits:");
    console.log("   ✅ 92% reduction in variable count (12 → 1)");
    console.log("   ✅ Automatic GitHub Actions integration");
    console.log("   ✅ Easier management and cleanup");
    console.log("   ✅ Structured configuration data");
  } catch (error) {
    console.error("❌ Error creating GitHub secret:", error.message);
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  createGitHubEnvironmentJSON()
    .then(() => {
      console.log("✅ GitHub secret creation completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 GitHub secret creation failed:", error.message);
      process.exit(1);
    });
}

module.exports = { createGitHubEnvironmentJSON };
