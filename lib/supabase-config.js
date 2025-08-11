/**
 * Supabase Configuration Parser for Branch-Specific JSON Environment Variables
 * 
 * This utility helps parse the JSON-based environment variables created by 
 * our branch-specific Supabase environment setup.
 */

/**
 * Get the current branch name (sanitized for environment variable names)
 * @param {string} branch - The raw branch name (e.g., from GitHub Actions or process.env)
 * @returns {string} Sanitized branch name for environment variable lookup
 */
function sanitizeBranchName(branch) {
  return branch.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
}

/**
 * Get Supabase configuration for the current branch
 * @param {string} branch - The branch name (optional, will try to detect)
 * @returns {Object} Supabase configuration object
 */
function getSupabaseConfig(branch = null) {
  // Try to determine branch name from various sources
  let branchName = branch;
  
  if (!branchName) {
    // Try common environment variables
    branchName = 
      process.env.GITHUB_REF_NAME ||           // GitHub Actions
      process.env.VERCEL_GIT_BRANCH ||        // Vercel deployment
      process.env.BRANCH ||                    // Netlify
      process.env.CI_COMMIT_REF_NAME ||        // GitLab CI
      'main';                                  // Fallback
  }
  
  const sanitizedBranch = sanitizeBranchName(branchName);
  const configVarName = `${sanitizedBranch}_SUPABASE_CONFIG`;
  
  console.log(`🔍 Looking for config: ${configVarName} (branch: ${branchName})`);
  
  // Get the JSON configuration from environment variables
  const configJson = process.env[configVarName];
  
  if (!configJson) {
    console.warn(`⚠️  No configuration found for branch: ${branchName}`);
    console.warn(`   Expected environment variable: ${configVarName}`);
    
    // Fallback to standard environment variables if JSON config not found
    console.log('📋 Falling back to standard environment variables...');
    return {
      branch: branchName,
      supabase: {
        url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
        anonKey: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        jwtSecret: process.env.SUPABASE_JWT_SECRET
      },
      database: {
        host: process.env.POSTGRES_HOST,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DATABASE,
        url: process.env.POSTGRES_URL,
        urlNonPooling: process.env.POSTGRES_URL_NON_POOLING
      }
    };
  }
  
  try {
    const config = JSON.parse(configJson);
    console.log(`✅ Loaded configuration for branch: ${config.branch}`);
    return config;
  } catch (error) {
    console.error(`❌ Failed to parse JSON configuration for ${configVarName}:`, error.message);
    throw new Error(`Invalid JSON configuration for branch: ${branchName}`);
  }
}

/**
 * Get Supabase client configuration
 * @param {string} branch - The branch name (optional)
 * @returns {Object} Configuration object for creating Supabase client
 */
function getSupabaseClientConfig(branch = null) {
  const config = getSupabaseConfig(branch);
  
  return {
    url: config.supabase.url,
    anonKey: config.supabase.anonKey,
    serviceRoleKey: config.supabase.serviceRoleKey
  };
}

/**
 * Get database connection configuration
 * @param {string} branch - The branch name (optional)
 * @returns {Object} Database configuration object
 */
function getDatabaseConfig(branch = null) {
  const config = getSupabaseConfig(branch);
  
  return {
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database,
    url: config.database.url,
    urlNonPooling: config.database.urlNonPooling
  };
}

/**
 * Create environment variables object from JSON config (for compatibility)
 * @param {string} branch - The branch name (optional)
 * @returns {Object} Environment variables object
 */
function createEnvVars(branch = null) {
  const config = getSupabaseConfig(branch);
  
  return {
    VITE_SUPABASE_URL: config.supabase.url,
    VITE_SUPABASE_ANON_KEY: config.supabase.anonKey,
    SUPABASE_URL: config.supabase.url,
    SUPABASE_ANON_KEY: config.supabase.anonKey,
    SUPABASE_SERVICE_ROLE_KEY: config.supabase.serviceRoleKey,
    SUPABASE_JWT_SECRET: config.supabase.jwtSecret,
    POSTGRES_HOST: config.database.host,
    POSTGRES_USER: config.database.user,
    POSTGRES_PASSWORD: config.database.password,
    POSTGRES_DATABASE: config.database.database,
    POSTGRES_URL: config.database.url,
    POSTGRES_URL_NON_POOLING: config.database.urlNonPooling
  };
}

module.exports = {
  sanitizeBranchName,
  getSupabaseConfig,
  getSupabaseClientConfig,
  getDatabaseConfig,
  createEnvVars
};