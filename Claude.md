# Project Structure

## Overview
Full-stack real-time chat application with authentication, direct and group messaging, media sharing, social controls, notifications, and an admin workspace.

## Tech Stack
- Framework: Next.js 15 App Router
- UI: React 19, Tailwind CSS v4, shadcn/ui, Lucide icons
- Motion: Framer Motion
- Theme: next-themes
- Auth and Database: Supabase/Nubase with direct frontend access and RLS
- File Uploads: @zoerai/integration presigned uploads

## Directory Structure
```text
src/
├── app/
│   ├── ChatApp.tsx       # Main chat workspace and feature UI
│   ├── chat-types.ts     # Chat database and UI types
│   ├── layout.tsx        # App providers and metadata
│   └── page.tsx          # Functional homepage entry
├── hooks/
│   └── useAuth.tsx       # AuthProvider and useAuth hook
├── integrations/
│   └── supabase/         # Supabase client and generated types
└── components/           # Shared UI components
```

## Core Systems

### Authentication
- Status: Implemented
- Location: `src/hooks/useAuth.tsx`
- Description: Email/password sign up, sign in, sign out, password reset, auth state listener, profile and role loading.

### Chat Workspace
- Status: Implemented
- Location: `src/app/ChatApp.tsx`
- Description: Responsive chat interface with sidebar, conversation panel, profile/settings/admin panels, direct chats, group chats, and realtime updates.

### Database Schema
- Status: Implemented
- Tables: `profiles`, `user_roles`, `notification_settings`, `conversations`, `conversation_members`, `messages`, `friend_requests`, `user_blocks`, `reports`, `notifications`, `typing_indicators`, `uploaded_files`
- Description: RLS-protected schema for users, messaging, social actions, admin moderation, notifications, and media metadata.

### Media Uploads
- Status: Implemented
- Location: `src/app/ChatApp.tsx`
- Description: Uses `@zoerai/integration` presigned uploads with metadata saved to the database and sent as media messages.

### Notifications
- Status: Implemented
- Location: `src/app/ChatApp.tsx`
- Description: In-app notifications, browser notification toggle, sound toggle, and notification settings.

### Admin Panel
- Status: Implemented
- Location: `src/app/ChatApp.tsx`
- Description: Role-gated admin area with statistics, user management, group management, and report management.

## Current State
- [x] Functional homepage replaced with chat application
- [x] Authentication flow implemented
- [x] Database schema and RLS policies implemented
- [x] Direct and group chat UI implemented
- [x] Media upload and preview implemented
- [x] Friend requests, blocking, and reports implemented
- [x] Notification settings implemented
- [x] Admin workspace implemented
- [ ] Extended production hardening and external Socket.io/Express/MongoDB deployment are not part of this platform implementation

## Maintenance Log
- 2026-06-07: Created project knowledge base after implementing the real-time chat application architecture.
