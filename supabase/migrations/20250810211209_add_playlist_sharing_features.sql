-- Add Playlist Sharing Features

-- ============================================================================
-- PLAYLIST SHARES TABLE
-- Manages playlist sharing permissions and access
-- ============================================================================
CREATE TABLE playlist_shares (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    shared_with_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Share type and permissions
    share_type TEXT NOT NULL CHECK (share_type IN ('public_link', 'direct_share', 'friend_share')),
    permission_level TEXT DEFAULT 'view' CHECK (permission_level IN ('view', 'collaborate', 'edit')),
    
    -- Public link sharing
    share_token TEXT UNIQUE, -- For public links
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Share settings
    allow_downloads BOOLEAN DEFAULT false,
    allow_comments BOOLEAN DEFAULT true,
    require_approval BOOLEAN DEFAULT false,
    
    -- Share status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'pending')),
    accepted_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(playlist_id, shared_with_id), -- One share per user per playlist
    CHECK ((share_type = 'public_link' AND shared_with_id IS NULL AND share_token IS NOT NULL) OR 
           (share_type IN ('direct_share', 'friend_share') AND shared_with_id IS NOT NULL))
);

-- ============================================================================
-- PLAYLIST FOLLOWS TABLE
-- Tracks users following shared playlists
-- ============================================================================
CREATE TABLE playlist_follows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Follow settings
    receive_notifications BOOLEAN DEFAULT true,
    auto_sync BOOLEAN DEFAULT false, -- Auto-sync changes to personal copy
    
    -- Follow metadata
    followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Personal copy (if user creates their own copy)
    personal_copy_playlist_id UUID REFERENCES playlists(id) ON DELETE SET NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(playlist_id, follower_id) -- One follow per user per playlist
);

-- ============================================================================
-- PLAYLIST COLLABORATORS TABLE
-- Manages collaborative editing permissions
-- ============================================================================
CREATE TABLE playlist_collaborators (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
    collaborator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
    
    -- Collaboration permissions
    can_add_songs BOOLEAN DEFAULT true,
    can_remove_songs BOOLEAN DEFAULT false,
    can_reorder_songs BOOLEAN DEFAULT true,
    can_edit_details BOOLEAN DEFAULT false,
    can_invite_others BOOLEAN DEFAULT false,
    
    -- Invitation status
    invitation_status TEXT DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'accepted', 'declined', 'revoked')),
    invitation_message TEXT,
    
    -- Activity tracking
    last_activity_at TIMESTAMP WITH TIME ZONE,
    contributions_count INTEGER DEFAULT 0,
    
    -- Metadata
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(playlist_id, collaborator_id) -- One collaboration per user per playlist
);

-- ============================================================================
-- PLAYLIST COMMENTS TABLE
-- User comments on shared playlists
-- ============================================================================
CREATE TABLE playlist_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Comment content
    content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 2000),
    
    -- Comment threading
    parent_comment_id UUID REFERENCES playlist_comments(id) ON DELETE CASCADE,
    thread_depth INTEGER DEFAULT 0,
    
    -- Comment metadata
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    
    -- Moderation
    is_flagged BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    flagged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    flag_reason TEXT,
    
    -- Engagement
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CHECK (thread_depth <= 3) -- Limit comment nesting depth
);

-- ============================================================================
-- PLAYLIST ACTIVITIES TABLE
-- Activity log for shared playlists
-- ============================================================================
CREATE TABLE playlist_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
    
    -- Activity details
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'created', 'shared', 'followed', 'unfollowed', 'song_added', 'song_removed', 
        'song_reordered', 'playlist_updated', 'comment_added', 'collaboration_invited',
        'collaboration_accepted', 'collaboration_declined'
    )),
    
    -- Activity data
    activity_data JSONB, -- Store activity-specific details
    target_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- For activities involving other users
    
    -- Related entities
    song_id UUID REFERENCES songs(id) ON DELETE SET NULL,
    comment_id UUID REFERENCES playlist_comments(id) ON DELETE SET NULL,
    share_id UUID REFERENCES playlist_shares(id) ON DELETE SET NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PLAYLIST LIKES TABLE
-- User likes/favorites for playlists
-- ============================================================================
CREATE TABLE playlist_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(playlist_id, user_id) -- One like per user per playlist
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Playlist shares indexes
CREATE INDEX idx_playlist_shares_playlist ON playlist_shares(playlist_id);
CREATE INDEX idx_playlist_shares_owner ON playlist_shares(owner_id);
CREATE INDEX idx_playlist_shares_shared_with ON playlist_shares(shared_with_id) WHERE shared_with_id IS NOT NULL;
CREATE INDEX idx_playlist_shares_token ON playlist_shares(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX idx_playlist_shares_status ON playlist_shares(status, created_at);

-- Playlist follows indexes
CREATE INDEX idx_playlist_follows_playlist ON playlist_follows(playlist_id);
CREATE INDEX idx_playlist_follows_follower ON playlist_follows(follower_id);
CREATE INDEX idx_playlist_follows_notifications ON playlist_follows(receive_notifications, followed_at) WHERE receive_notifications = true;

-- Playlist collaborators indexes
CREATE INDEX idx_playlist_collaborators_playlist ON playlist_collaborators(playlist_id);
CREATE INDEX idx_playlist_collaborators_user ON playlist_collaborators(collaborator_id);
CREATE INDEX idx_playlist_collaborators_status ON playlist_collaborators(invitation_status);
CREATE INDEX idx_playlist_collaborators_activity ON playlist_collaborators(last_activity_at) WHERE invitation_status = 'accepted';

-- Playlist comments indexes
CREATE INDEX idx_playlist_comments_playlist ON playlist_comments(playlist_id, created_at DESC);
CREATE INDEX idx_playlist_comments_user ON playlist_comments(user_id);
CREATE INDEX idx_playlist_comments_parent ON playlist_comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;
CREATE INDEX idx_playlist_comments_flagged ON playlist_comments(is_flagged, created_at) WHERE is_flagged = true;

-- Playlist activities indexes
CREATE INDEX idx_playlist_activities_playlist ON playlist_activities(playlist_id, created_at DESC);
CREATE INDEX idx_playlist_activities_user ON playlist_activities(user_id, created_at DESC);
CREATE INDEX idx_playlist_activities_type ON playlist_activities(activity_type, created_at DESC);

-- Playlist likes indexes
CREATE INDEX idx_playlist_likes_playlist ON playlist_likes(playlist_id);
CREATE INDEX idx_playlist_likes_user ON playlist_likes(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE playlist_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_likes ENABLE ROW LEVEL SECURITY;

-- Playlist shares policies
CREATE POLICY "Users can view shares for their playlists or shares they're part of" ON playlist_shares
    FOR SELECT USING (
        auth.uid() = owner_id OR 
        auth.uid() = shared_with_id OR
        EXISTS (SELECT 1 FROM playlists p WHERE p.id = playlist_id AND p.visibility = 'public')
    );

CREATE POLICY "Users can create shares for their own playlists" ON playlist_shares
    FOR INSERT WITH CHECK (
        auth.uid() = owner_id AND
        EXISTS (SELECT 1 FROM playlists p WHERE p.id = playlist_id AND p.user_id = auth.uid())
    );

CREATE POLICY "Users can update their own shares" ON playlist_shares
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own shares" ON playlist_shares
    FOR DELETE USING (auth.uid() = owner_id);

-- Playlist follows policies
CREATE POLICY "Users can view follows for public playlists or their own" ON playlist_follows
    FOR SELECT USING (
        auth.uid() = follower_id OR
        EXISTS (
            SELECT 1 FROM playlists p 
            WHERE p.id = playlist_id 
            AND (p.visibility = 'public' OR p.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can follow playlists" ON playlist_follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can manage their own follows" ON playlist_follows
    FOR ALL USING (auth.uid() = follower_id);

-- Playlist collaborators policies
CREATE POLICY "Users can view collaborations they're part of" ON playlist_collaborators
    FOR SELECT USING (
        auth.uid() = collaborator_id OR 
        auth.uid() = invited_by OR
        EXISTS (SELECT 1 FROM playlists p WHERE p.id = playlist_id AND p.user_id = auth.uid())
    );

CREATE POLICY "Playlist owners can invite collaborators" ON playlist_collaborators
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM playlists p WHERE p.id = playlist_id AND p.user_id = auth.uid())
    );

CREATE POLICY "Users can respond to their own invitations" ON playlist_collaborators
    FOR UPDATE USING (auth.uid() = collaborator_id OR auth.uid() = invited_by);

-- Playlist comments policies
CREATE POLICY "Users can view comments on accessible playlists" ON playlist_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM playlists p 
            WHERE p.id = playlist_id 
            AND (
                p.visibility = 'public' OR 
                p.user_id = auth.uid() OR
                EXISTS (SELECT 1 FROM playlist_shares ps WHERE ps.playlist_id = p.id AND ps.shared_with_id = auth.uid() AND ps.status = 'active')
            )
        )
    );

CREATE POLICY "Users can comment on accessible playlists" ON playlist_comments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM playlists p 
            WHERE p.id = playlist_id 
            AND (
                p.visibility = 'public' OR 
                p.user_id = auth.uid() OR
                EXISTS (SELECT 1 FROM playlist_shares ps WHERE ps.playlist_id = p.id AND ps.shared_with_id = auth.uid() AND ps.status = 'active')
            )
        )
    );

CREATE POLICY "Users can edit their own comments" ON playlist_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON playlist_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Playlist activities policies (read-only for users)
CREATE POLICY "Users can view activities for accessible playlists" ON playlist_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM playlists p 
            WHERE p.id = playlist_id 
            AND (
                p.user_id = auth.uid() OR
                EXISTS (SELECT 1 FROM playlist_shares ps WHERE ps.playlist_id = p.id AND ps.shared_with_id = auth.uid() AND ps.status = 'active')
            )
        )
    );

-- Playlist likes policies
CREATE POLICY "Users can view likes on accessible playlists" ON playlist_likes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM playlists p 
            WHERE p.id = playlist_id 
            AND (
                p.visibility = 'public' OR 
                p.user_id = auth.uid() OR
                EXISTS (SELECT 1 FROM playlist_shares ps WHERE ps.playlist_id = p.id AND ps.shared_with_id = auth.uid() AND ps.status = 'active')
            )
        )
    );

CREATE POLICY "Users can like accessible playlists" ON playlist_likes
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM playlists p 
            WHERE p.id = playlist_id 
            AND (
                p.visibility = 'public' OR 
                p.user_id = auth.uid() OR
                EXISTS (SELECT 1 FROM playlist_shares ps WHERE ps.playlist_id = p.id AND ps.shared_with_id = auth.uid() AND ps.status = 'active')
            )
        )
    );

CREATE POLICY "Users can manage their own likes" ON playlist_likes
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Apply updated_at triggers
CREATE TRIGGER update_playlist_shares_updated_at
    BEFORE UPDATE ON playlist_shares
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playlist_follows_updated_at
    BEFORE UPDATE ON playlist_follows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playlist_collaborators_updated_at
    BEFORE UPDATE ON playlist_collaborators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playlist_comments_updated_at
    BEFORE UPDATE ON playlist_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate share tokens
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically set share token for public links
CREATE OR REPLACE FUNCTION set_share_token()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.share_type = 'public_link' AND NEW.share_token IS NULL THEN
        NEW.share_token = generate_share_token();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_playlist_share_token
    BEFORE INSERT ON playlist_shares
    FOR EACH ROW EXECUTE FUNCTION set_share_token();

-- Function to update playlist like count
CREATE OR REPLACE FUNCTION update_playlist_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE playlists SET like_count = like_count + 1 WHERE id = NEW.playlist_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE playlists SET like_count = like_count - 1 WHERE id = OLD.playlist_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_playlist_like_count_trigger
    AFTER INSERT OR DELETE ON playlist_likes
    FOR EACH ROW EXECUTE FUNCTION update_playlist_like_count();