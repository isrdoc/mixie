# Mixie

A next-generation platform for music fans and curators to discover, share, and connect through playlists, spanning multiple streaming services. Mixie is targeted at a community of highly engaged users and curators who want seamless music discovery and sharing experiences.

Test change

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

- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Authentication**: Supabase Auth with OAuth providers
- **Storage**: Supabase Storage for assets
- **Serverless**: Supabase Edge Functions
- **Deployment**: Vercel with GitHub Actions CI/CD
- **Environment Management**: Vercel-Supabase integration for automated variable sync

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

## 🗄️ Database & Backend

### Supabase Integration

Mixie uses Supabase as its backend-as-a-service solution, providing:

- **PostgreSQL Database** with advanced features like JSONB, full-text search, and custom functions
- **Row Level Security (RLS)** for secure, policy-based data access
- **Real-time subscriptions** for live playlist updates and user interactions
- **Edge Functions** for serverless backend logic
- **Built-in authentication** with social OAuth providers

### Database Schema

The database includes comprehensive tables for:

- **User Management**: `profiles` with music preferences and social settings
- **Music Catalog**: `songs` with multi-provider metadata and search optimization
- **Playlist System**: `playlists` and `playlist_songs` with collaborative features
- **Streaming Integration**: `user_music_connections`, `imported_playlists`, and sync queues
- **Social Features**: `playlist_shares`, `playlist_follows`, `playlist_comments`, and activity tracking

### Environment Management

Multiple environments for different development stages:

- **Development**: Supabase dev branch for testing migrations and new features
- **Preview**: Staging environment synchronized with Vercel preview deployments
- **Production**: Live database for the deployed application

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Supabase CLI for database management
- Vercel CLI for deployment and environment sync

### Development Workflow

1. **Clone and Install**

   ```bash
   git clone <repository-url>
   cd mixie
   pnpm install
   ```

2. **Environment Setup**

   ```bash
   # Pull development environment variables
   pnpm env:sync:feat

   # Or set up local Supabase (optional)
   pnpm db:start
   ```

3. **Database Management**

   ```bash
   # Start local Supabase
   pnpm db:start

   # Check database status
   pnpm db:status

   # Reset database with latest migrations
   pnpm db:reset
   ```

4. **Start Development**
   ```bash
   pnpm dev
   ```

### Available Scripts

#### Environment Management

- `pnpm env:sync:feat` - Sync preview environment variables from Vercel

#### Database Operations

- `pnpm db:start` - Start local Supabase services
- `pnpm db:stop` - Stop local Supabase services
- `pnpm db:status` - Check service status
- `pnpm db:reset` - Reset database with migrations and seed data

#### Development

- `pnpm dev` - Start development servers for all apps
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Lint all code
- `pnpm format` - Format code with Prettier
