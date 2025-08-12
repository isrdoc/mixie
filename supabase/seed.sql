-- Seed data for Mixie Music Platform

-- Insert sample songs (with conflict resolution)
INSERT INTO songs (title, artist, album, duration_ms, genre, spotify_id, apple_music_id) VALUES
('Bohemian Rhapsody', 'Queen', 'A Night at the Opera', 355000, ARRAY['rock', 'progressive rock'], 'spotify:track:3z8h0TU7ReDPLIbEnYhWZb', 'apple:1234567'),
('Billie Jean', 'Michael Jackson', 'Thriller', 294000, ARRAY['pop', 'funk'], 'spotify:track:4u7EnebtmKWzUH433cf5Qv', 'apple:1234568'),
('Stairway to Heaven', 'Led Zeppelin', 'Led Zeppelin IV', 482000, ARRAY['rock', 'folk rock'], 'spotify:track:5CQ30WqJwcep0pYcV4AMNc', 'apple:1234569'),
('Hotel California', 'Eagles', 'Hotel California', 391000, ARRAY['rock', 'soft rock'], 'spotify:track:40riOy7x9W7GXjyGp4pjAv', 'apple:1234570'),
('Imagine', 'John Lennon', 'Imagine', 183000, ARRAY['pop', 'soft rock'], 'spotify:track:7pKfPomDEeI4TPT6EOYjn9', 'apple:1234571'),
('Sweet Child O Mine', 'Guns N Roses', 'Appetite for Destruction', 356000, ARRAY['rock', 'hard rock'], 'spotify:track:7o2CTH4ctstm8TNelqjb51', 'apple:1234572'),
('Smells Like Teen Spirit', 'Nirvana', 'Nevermind', 301000, ARRAY['grunge', 'alternative rock'], 'spotify:track:4CeeEOM32jQcH3eN9Q2dGj', 'apple:1234573'),
('Yesterday', 'The Beatles', 'Help!', 125000, ARRAY['pop', 'baroque pop'], 'spotify:track:3BQHpFgAp4l80e1XslIjNI', 'apple:1234574'),
('Purple Haze', 'Jimi Hendrix', 'Are You Experienced', 169000, ARRAY['rock', 'psychedelic rock'], 'spotify:track:0wJoRiX5K5BxlqZTolB2LD', 'apple:1234575'),
('Good Vibrations', 'The Beach Boys', 'Pet Sounds', 218000, ARRAY['pop', 'psychedelic pop'], 'spotify:track:5BIMPccDwShpXq784RJlJp', 'apple:1234576')
ON CONFLICT (title, artist, album) DO NOTHING;

-- Note: We cannot insert into auth.users directly in a migration
-- This would typically be done through Supabase Auth or manually in the dashboard
-- For testing, you can create users through the Supabase Dashboard or auth endpoints

-- The following would be inserted after users are created:
-- Sample profiles (these UUIDs would need to match actual auth.users)
-- INSERT INTO profiles (id, email, username, display_name, bio) VALUES 
-- ('00000000-0000-0000-0000-000000000001', 'john@example.com', 'musicjohn', 'John the Music Lover', 'I love discovering new music!'),
-- ('00000000-0000-0000-0000-000000000002', 'sarah@example.com', 'sarahbeats', 'Sarah Beats', 'Playlist curator extraordinaire');

-- Sample playlists (would be inserted after users exist)
-- INSERT INTO playlists (user_id, name, description, visibility) VALUES
-- ('00000000-0000-0000-0000-000000000001', 'Classic Rock Anthems', 'The greatest rock songs of all time', 'public'),
-- ('00000000-0000-0000-0000-000000000002', 'Chill Vibes', 'Perfect for studying or relaxing', 'public');