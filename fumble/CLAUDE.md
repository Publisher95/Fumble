# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fumble is a dating app built with Next.js 16, React 19, and Socket.IO for real-time communication. It features a Tinder-like card swiping interface with profiles, chat functionality, and user authentication. The app includes an AI-powered message rewriting system using Google's Gemini API to match user stereotypes.

## Running the Application

```bash
# Install dependencies
npm install

# Set up environment variables (optional - for AI features)
# Create a .env file with:
# GEMINI_API_KEY=your_api_key_here

# Run development server (uses custom server.js with Socket.IO)
npm run dev

# Build for production
npm run build

# Run production server
npm run start

# Lint code
npm run lint
```

The app runs on http://localhost:3000 by default and binds to all network interfaces (0.0.0.0), making it accessible from other devices on your local network.

## Architecture

**Custom Server Setup:**
- Uses a custom Node.js server (`server.js`) instead of the default Next.js server
- Integrates Socket.IO with Next.js for real-time features
- Server creates both HTTP server and Socket.IO instance

**Tech Stack:**
- Next.js 16 with App Router (not Pages Router)
- React 19 with client components
- TypeScript
- Tailwind CSS 4 (inline theme configuration in globals.css)
- Framer Motion for animations and swipe gestures
- Socket.IO for real-time chat
- Lucide React for icons
- Google Gemini API (@google/genai) for AI message rewriting
- dotenv for environment configuration

**Project Structure:**
- `/app` - Next.js App Router directory
  - `/components` - All UI components (10 total)
  - `/data` - JSON-based data persistence
    - `users.json` - User profiles with stereotypes
    - `messages.json` - Chat message history (persisted across server restarts)
  - `/types` - TypeScript type definitions
  - `page.tsx` - Main application entry point with tab navigation
  - `layout.tsx` - Root layout with custom font (Alliance No.1 Light)
  - `globals.css` - Tailwind imports and custom CSS variables
  - `socket.js` - Socket.IO client initialization
- `/public` - Static assets (profile images organized by user ID)
- `server.js` - Custom HTTP server with Socket.IO and AI integration
- `.env` - Environment variables (GEMINI_API_KEY)

**Component Architecture:**
The app uses a tab-based navigation with three main views:
1. **SwipingView** - Card-based profile browsing with swipe gestures
2. **ChatView** - List of chat conversations
3. **SelfProfileView** - User's own profile

**Key Components:**
- `SwipeableCard` (app/components/SwipeableCard.tsx:14) - Wrapper providing swipe gesture handling with Framer Motion drag controls, visual feedback overlays (like/nope indicators), and threshold-based swipe detection
- `ProfileCard`, `PhotoCard`, `PromptCard`, `VitalsCard` - Different card types for profile content
- `ChatDetailView` - Individual chat conversation interface
- `LoginView` - Authentication interface

## Authentication & Data

**Authentication System:**
- Access code-based authentication (no passwords)
- Users stored in `app/data/users.json` with unique access codes
- Each user has a 4-character access code (e.g., "A7K2", "B3M9")
- Current user state stored in React (app/page.tsx:16)
- User profiles include optional `stereotype` field for AI personality matching

**Data Persistence:**
- User data: Static JSON file (`app/data/users.json`)
- Chat messages: JSON file updated in real-time (`app/data/messages.json`)
- Messages persist across server restarts
- No database - file-based storage only

## State Management

- React useState hooks for local component state
- No global state management library (Redux, Zustand, etc.)
- Socket.IO connection state managed in main page.tsx (app/page.tsx:20-32)
- Current user object (UserProfile) stored after login (app/page.tsx:16)

## Styling

- Uses Tailwind CSS 4 with inline theme configuration
- Custom CSS variables defined in globals.css (--background, --foreground, --card-bg)
- Custom font: Alliance No.1 Light loaded via Next.js localFont
- Mobile-first responsive design with max-w-md container
- Color palette: Rose-500 for primary actions, Zinc grays for UI

## Socket.IO Integration

**Client-Side (app/socket.js):**
- Singleton socket instance with `autoConnect: false`
- Manually connected when user logs in (app/page.tsx:22)
- Disconnected on logout or unmount

**Server-Side (server.js:105-199):**
- Socket.IO server integrated with Next.js custom server
- User socket tracking via Map: userId → socketId
- **Socket Events:**
  - `join` - Associate socket with user ID
  - `send_message` - Send chat message with AI rewriting
  - `get_messages` - Retrieve conversation history
  - `get_all_last_messages` - Get last message for each conversation
  - `receive_message` - Client receives new messages
  - `message_sent` - Confirm message delivery to sender
  - `messages_history` - Return conversation history
  - `all_last_messages` - Return all last messages

**Message Flow:**
1. Sender emits `send_message` with message text and recipient ID
2. Server checks if sender has a `stereotype` field
3. If stereotype exists, message is rewritten using Gemini API (server.js:53-83)
4. Message saved to `messages.json` with conversation ID format: `min(id1,id2)_max(id1,id2)`
5. Message emitted to recipient if online
6. Confirmation sent back to sender with message ID and timestamp

## AI Integration

**Gemini API Message Rewriting (server.js:53-83):**
- Optional feature requiring `GEMINI_API_KEY` environment variable
- Uses Google's Gemini 3 Flash Preview model
- Rewrites messages to match user's stereotype while preserving intent
- Falls back to original message if API key missing or request fails
- Triggered automatically on `send_message` event if user has `stereotype` field
- Prompt engineered to maintain natural, conversational tone

## TypeScript Configuration

- Target: ES2017
- Uses `"use client"` directive for all interactive components
- Path alias: `@/*` maps to project root
- Strict mode enabled
