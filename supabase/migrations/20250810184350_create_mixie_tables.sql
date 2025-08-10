-- Create Mixie Music Platform Tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE music_provider AS ENUM ('spotify', 'apple_music', 'youtube_music', 'soundcloud');
CREATE TYPE playlist_visibility AS ENUM ('public', 'private', 'unlisted');

-- ============================================================================
-- PROFILES TABLE (extends auth.users)
-- ============================================================================
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    website TEXT,
    
    -- Music preferences
    favorite_genres TEXT[],
    music_providers music_provider[],
    
    -- Privacy settings
    profile_visibility TEXT DEFAULT 'public',
    allow_playlist_discovery BOOLEAN DEFAULT true,
    allow_friend_requests BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PLAYLISTS TABLE
-- ============================================================================
CREATE TABLE playlists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Basic info
    name TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    
    -- Settings
    visibility playlist_visibility DEFAULT 'private',
    is_collaborative BOOLEAN DEFAULT false,
    allow_comments BOOLEAN DEFAULT true,
    
    -- Music provider integration
    source_provider music_provider,
    source_playlist_id TEXT, -- ID from external provider
    sync_enabled BOOLEAN DEFAULT false,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    
    -- Stats
    play_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SONGS TABLE
-- ============================================================================
CREATE TABLE songs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Basic info
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT,
    duration_ms INTEGER, -- duration in milliseconds
    
    -- Music provider data
    spotify_id TEXT,
    apple_music_id TEXT,
    youtube_id TEXT,
    soundcloud_id TEXT,
    
    -- Metadata
    genre TEXT[],
    release_date DATE,
    cover_image_url TEXT,
    preview_url TEXT,
    
    -- Stats
    play_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    
    -- Search optimization
    search_vector tsvector,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(title, artist, album) -- Prevent exact duplicates
);

-- ============================================================================
-- PLAYLIST_SONGS TABLE (Junction table)
-- ============================================================================
CREATE TABLE playlist_songs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE NOT NULL,
    
    -- Ordering and metadata
    position INTEGER NOT NULL,
    added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(playlist_id, song_id), -- Prevent duplicate songs in same playlist
    UNIQUE(playlist_id, position) -- Ensure unique positions
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (profile_visibility = 'public');

CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Playlists policies
CREATE POLICY "Public playlists are viewable by everyone" ON playlists
    FOR SELECT USING (visibility = 'public');

CREATE POLICY "Users can view their own playlists" ON playlists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own playlists" ON playlists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" ON playlists
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" ON playlists
    FOR DELETE USING (auth.uid() = user_id);

-- Songs policies (read-only for most users)
CREATE POLICY "Songs are viewable by everyone" ON songs FOR SELECT USING (true);

-- Playlist songs policies
CREATE POLICY "Playlist songs viewable if playlist is viewable" ON playlist_songs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM playlists p 
            WHERE p.id = playlist_id 
            AND (p.visibility = 'public' OR p.user_id = auth.uid())
        )
    );

-- Users can add/remove songs from their own playlists
CREATE POLICY "Users can manage songs in their own playlists" ON playlist_songs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM playlists p 
            WHERE p.id = playlist_id 
            AND p.user_id = auth.uid()
        )
    );