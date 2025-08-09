# Mixie

A next-generation platform for music fans and curators to discover, share, and connect through playlists, spanning multiple streaming services. Mixie is targeted at a community of highly engaged users and curators who want seamless music discovery and sharing experiences.

## ✨ Key Features

### 🎵 Music Discovery & Sharing
- **Playlist Discovery**: Browse curated playlists across genres, moods, and user affinities
- **Multi-service Integration**: Connect with Spotify, Apple Music, and YouTube using OAuth
- **Playlist Syncing**: Import/export playlists between different streaming services
- **Cross-platform Sharing**: Share individual tracks or entire playlists with other users

### 👥 Community & Social Features
- **User Profiles**: Customizable profiles with listening stats, favorite tracks, and playlists
- **Activity Feed**: Live feed showing new playlists, trending tracks, and user activity
- **Social Interactions**: Like, comment on playlists/tracks, follow users/curators, and direct messaging

### 🎨 Curation Tools
- **Playlist Creation**: Drag-and-drop interface for building and editing playlists
- **Collaboration**: Invite other users to co-curate playlists
- **AI Recommendations**: Smart suggestions based on listening history and collaborative filtering

## 🛠 Tech Stack

### Frontend
- **Framework**: React + TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **Build System**: Vite
- **Monorepo**: Turborepo for scalable code organization

### Backend & Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage for assets
- **Serverless**: Supabase Edge Functions
- **Deployment**: Vercel with GitHub Actions CI/CD

## 📁 Project Structure

This Turborepo includes the following packages and apps:

### Apps and Packages
- `mixie-web`: Main React application built with Vite
- `@repo/ui`: Shared component library for the mixie-web application
- `@repo/eslint-config`: Shared ESLint configurations
- `@repo/typescript-config`: TypeScript configurations used throughout the monorepo

Each package and app is 100% [TypeScript](https://www.typescriptlang.org/).

### Development Tools
- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- AI-assisted development workflows (Cursor AI, Linear for issue tracking)
