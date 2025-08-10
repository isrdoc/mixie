-- Add Music Streaming Services Integration Tables

-- ============================================================================
-- USER MUSIC CONNECTIONS TABLE
-- Stores OAuth connections to various music streaming services
-- ============================================================================
CREATE TABLE user_music_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    provider music_provider NOT NULL,
    
    -- OAuth credentials (encrypted)
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    
    -- Provider-specific user info
    provider_user_id TEXT NOT NULL,
    provider_username TEXT,
    provider_display_name TEXT,
    provider_email TEXT,
    provider_avatar_url TEXT,
    
    -- Connection status
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_error TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id, provider), -- One connection per provider per user
    UNIQUE(provider, provider_user_id) -- Unique provider user mapping
);

-- ============================================================================
-- IMPORTED PLAYLISTS TABLE
-- Tracks playlists imported from external services
-- ============================================================================
CREATE TABLE imported_playlists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    connection_id UUID REFERENCES user_music_connections(id) ON DELETE CASCADE NOT NULL,
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
    
    -- External playlist info
    external_playlist_id TEXT NOT NULL,
    external_playlist_name TEXT NOT NULL,
    external_playlist_url TEXT,
    external_cover_image_url TEXT,
    
    -- Import metadata
    import_status TEXT DEFAULT 'pending' CHECK (import_status IN ('pending', 'importing', 'completed', 'failed')),
    imported_at TIMESTAMP WITH TIME ZONE,
    import_error TEXT,
    
    -- Track counts
    total_tracks INTEGER DEFAULT 0,
    imported_tracks INTEGER DEFAULT 0,
    failed_tracks INTEGER DEFAULT 0,
    
    -- Sync settings
    auto_sync BOOLEAN DEFAULT false,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(connection_id, external_playlist_id)
);

-- ============================================================================
-- SONG IMPORT QUEUE TABLE
-- Queue for processing song imports from external services
-- ============================================================================
CREATE TABLE song_import_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    connection_id UUID REFERENCES user_music_connections(id) ON DELETE CASCADE NOT NULL,
    imported_playlist_id UUID REFERENCES imported_playlists(id) ON DELETE CASCADE,
    
    -- External song data
    external_song_id TEXT NOT NULL,
    external_song_data JSONB NOT NULL, -- Raw song data from provider
    
    -- Processing status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Result
    matched_song_id UUID REFERENCES songs(id) ON DELETE SET NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(connection_id, external_song_id, imported_playlist_id)
);

-- ============================================================================
-- SYNC JOBS TABLE
-- Tracks background sync jobs for music services
-- ============================================================================
CREATE TABLE sync_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    connection_id UUID REFERENCES user_music_connections(id) ON DELETE CASCADE NOT NULL,
    
    -- Job details
    job_type TEXT NOT NULL CHECK (job_type IN ('full_sync', 'playlist_sync', 'incremental_sync')),
    job_status TEXT DEFAULT 'pending' CHECK (job_status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    
    -- Progress tracking
    total_items INTEGER DEFAULT 0,
    processed_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    
    -- Job execution
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    -- Job data
    job_data JSONB, -- Store job-specific configuration and results
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- User music connections indexes
CREATE INDEX idx_user_music_connections_user_id ON user_music_connections(user_id);
CREATE INDEX idx_user_music_connections_provider ON user_music_connections(provider);
CREATE INDEX idx_user_music_connections_active ON user_music_connections(is_active) WHERE is_active = true;
CREATE INDEX idx_user_music_connections_sync ON user_music_connections(last_sync_at) WHERE is_active = true;

-- Imported playlists indexes
CREATE INDEX idx_imported_playlists_connection ON imported_playlists(connection_id);
CREATE INDEX idx_imported_playlists_status ON imported_playlists(import_status);
CREATE INDEX idx_imported_playlists_auto_sync ON imported_playlists(auto_sync, last_synced_at) WHERE auto_sync = true;

-- Song import queue indexes
CREATE INDEX idx_song_import_queue_status ON song_import_queue(status, created_at);
CREATE INDEX idx_song_import_queue_connection ON song_import_queue(connection_id);
CREATE INDEX idx_song_import_queue_playlist ON song_import_queue(imported_playlist_id);

-- Sync jobs indexes
CREATE INDEX idx_sync_jobs_connection ON sync_jobs(connection_id);
CREATE INDEX idx_sync_jobs_status ON sync_jobs(job_status, created_at);
CREATE INDEX idx_sync_jobs_type ON sync_jobs(job_type);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_music_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_import_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_jobs ENABLE ROW LEVEL SECURITY;

-- User music connections policies
CREATE POLICY "Users can view their own music connections" ON user_music_connections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own music connections" ON user_music_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own music connections" ON user_music_connections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own music connections" ON user_music_connections
    FOR DELETE USING (auth.uid() = user_id);

-- Imported playlists policies
CREATE POLICY "Users can view imported playlists from their connections" ON imported_playlists
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_music_connections umc
            WHERE umc.id = connection_id AND umc.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage imported playlists from their connections" ON imported_playlists
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_music_connections umc
            WHERE umc.id = connection_id AND umc.user_id = auth.uid()
        )
    );

-- Song import queue policies (read-only for users, managed by system)
CREATE POLICY "Users can view their import queue items" ON song_import_queue
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_music_connections umc
            WHERE umc.id = connection_id AND umc.user_id = auth.uid()
        )
    );

-- Sync jobs policies (read-only for users)
CREATE POLICY "Users can view their sync jobs" ON sync_jobs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_music_connections umc
            WHERE umc.id = connection_id AND umc.user_id = auth.uid()
        )
    );

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_user_music_connections_updated_at
    BEFORE UPDATE ON user_music_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_imported_playlists_updated_at
    BEFORE UPDATE ON imported_playlists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_song_import_queue_updated_at
    BEFORE UPDATE ON song_import_queue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sync_jobs_updated_at
    BEFORE UPDATE ON sync_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();