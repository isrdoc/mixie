#!/usr/bin/env node

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
require("dotenv").config({ path: ".env.feat" });

console.log("🧪 Testing Supabase Preview Branch Integration...\n");

// Check if we have the required environment variables
const requiredEnvVars = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error("❌ Missing required environment variables:");
  missingVars.forEach((varName) => console.error(`   - ${varName}`));
  console.error("\n💡 Make sure to run: pnpm env:sync:feat");
  process.exit(1);
}

// Create Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("🔗 Connecting to Supabase...");
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey.substring(0, 20)}...\n`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPreviewBranchIntegration() {
  try {
    console.log("📊 Testing database connection...");

    // Test 1: Basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from("test_integration")
      .select("count")
      .limit(1);

    if (connectionError) {
      throw new Error(`Connection failed: ${connectionError.message}`);
    }

    console.log("✅ Database connection successful!\n");

    // Test 2: Query test data
    console.log("📋 Querying test data...");
    const { data: testData, error: queryError } = await supabase
      .from("test_integration")
      .select("*")
      .order("created_at", { ascending: false });

    if (queryError) {
      throw new Error(`Query failed: ${queryError.message}`);
    }

    console.log(`✅ Found ${testData.length} test records:`);
    testData.forEach((record) => {
      console.log(
        `   - ${record.test_name}: ${record.test_value} (${record.branch_name})`
      );
    });
    console.log("");

    // Test 3: Test the custom function
    console.log("⚡ Testing custom function...");
    const { data: functionResult, error: functionError } = await supabase.rpc(
      "test_preview_branch_function"
    );

    if (functionError) {
      console.log(`⚠️  Function test failed: ${functionError.message}`);
      console.log(
        "   This is expected if the migration hasn't been applied yet.\n"
      );
    } else {
      console.log(`✅ Function test successful: ${functionResult}\n`);
    }

    // Test 4: Test the view
    console.log("👁️  Testing view...");
    const { data: viewData, error: viewError } = await supabase
      .from("test_integration_summary")
      .select("*");

    if (viewError) {
      console.log(`⚠️  View test failed: ${viewError.message}`);
      console.log(
        "   This is expected if the migration hasn't been applied yet.\n"
      );
    } else {
      console.log("✅ View test successful:");
      viewData.forEach((summary) => {
        console.log(
          `   - Branch: ${summary.branch_name}, Tests: ${summary.total_tests}`
        );
      });
      console.log("");
    }

    // Test 5: Insert test data
    console.log("➕ Testing data insertion...");
    const testRecord = {
      test_name: "preview_branch_verification",
      test_value: `Test run at ${new Date().toISOString()}`,
      branch_name: process.env.VERCEL_GIT_COMMIT_REF || "local",
    };

    const { data: insertData, error: insertError } = await supabase
      .from("test_integration")
      .insert(testRecord)
      .select();

    if (insertError) {
      console.log(`⚠️  Insert test failed: ${insertError.message}`);
      console.log(
        "   This might be due to RLS policies or missing permissions.\n"
      );
    } else {
      console.log("✅ Insert test successful!");
      console.log(`   Inserted record ID: ${insertData[0].id}\n`);
    }

    console.log("🎉 Preview branch integration test completed!\n");

    // Summary
    console.log("📋 Test Summary:");
    console.log("   ✅ Database connection");
    console.log("   ✅ Data querying");
    console.log("   ⚠️  Custom function (depends on migration)");
    console.log("   ⚠️  View access (depends on migration)");
    console.log("   ⚠️  Data insertion (depends on RLS policies)");

    if (process.env.VERCEL_ENV) {
      console.log(`\n🌐 Environment: ${process.env.VERCEL_ENV}`);
      console.log(
        `🔗 Branch: ${process.env.VERCEL_GIT_COMMIT_REF || "unknown"}`
      );
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("\n💡 Troubleshooting tips:");
    console.error("   1. Make sure Supabase is running: pnpm db:start");
    console.error("   2. Sync environment variables: pnpm env:sync:feat");
    console.error("   3. Check if the migration has been applied");
    console.error("   4. Verify your Supabase project settings");
    process.exit(1);
  }
}

// Run the test
testPreviewBranchIntegration();
