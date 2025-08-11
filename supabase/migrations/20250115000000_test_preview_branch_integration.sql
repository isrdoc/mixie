-- Test Migration for Supabase Preview Branches Integration
-- This migration is designed to test the preview branch workflow
-- Created: 2025-01-15

-- ============================================================================
-- TEST INTEGRATION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS test_integration (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    test_name TEXT NOT NULL,
    test_value TEXT,
    branch_name TEXT DEFAULT 'main',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TEST DATA INSERTION
-- ============================================================================
INSERT INTO test_integration (test_name, test_value, branch_name) VALUES
    ('preview_branch_test', 'This is a test value', 'main'),
    ('integration_verification', 'Testing preview branch workflow', 'main'),
    ('environment_sync', 'Verifying env var sync works', 'main');

-- ============================================================================
-- TEST FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION test_preview_branch_function()
RETURNS TEXT AS $$
BEGIN
    RETURN 'Preview branch integration test successful! Branch: ' || 
           COALESCE(current_setting('app.branch_name', true), 'unknown');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TEST VIEW
-- ============================================================================
CREATE OR REPLACE VIEW test_integration_summary AS
SELECT 
    COUNT(*) as total_tests,
    branch_name,
    MAX(created_at) as latest_test,
    STRING_AGG(test_name, ', ') as test_names
FROM test_integration 
GROUP BY branch_name;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICY
-- ============================================================================
ALTER TABLE test_integration ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read test data
CREATE POLICY "Allow authenticated users to read test data" ON test_integration
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to insert their own test data
CREATE POLICY "Allow users to insert test data" ON test_integration
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_test_integration_branch_name ON test_integration(branch_name);
CREATE INDEX idx_test_integration_created_at ON test_integration(created_at);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE test_integration IS 'Test table for verifying Supabase preview branch integration';
COMMENT ON COLUMN test_integration.branch_name IS 'Git branch name where this test was created';
COMMENT ON FUNCTION test_preview_branch_function() IS 'Test function to verify preview branch environment variables';

-- ============================================================================
-- VERIFICATION QUERIES (for testing)
-- ============================================================================
-- Uncomment these lines to test the migration:
-- SELECT test_preview_branch_function();
-- SELECT * FROM test_integration_summary;
-- SELECT * FROM test_integration ORDER BY created_at DESC LIMIT 5;
