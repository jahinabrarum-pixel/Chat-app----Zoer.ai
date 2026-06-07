// Chat app types

export interface DBProfile {
  id?: string;
  user_id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  bio: string | null;
  presence_status: string | null;
  activity_status: string | null;
  last_seen_at: string | null;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBRole {
  user_id: string;
  role: string;
  created_at: string;
}

export interface DBConversation {
  id: string;
  type: "direct" | "group";
  title: string | null;
  created_at: string;
  created_by: string;
  avatar_url: string | null;
  description: string | null;
  last_message_preview: string | null;
  last_message_at: string | null;
  wallpaper: string | null;
  is_archived: boolean;
  updated_at: string;
}

export interface DBConversationMember {
  id: string;
  conversation_id: string;
  user_id: string;
  role: string;
  unread_count: number;
  muted: boolean;
  archived: boolean;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface DBMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  type: string;
  media_url: string | null;
  media_key: string | null;
  media_name: string | null;
  media_size: number | null;
  media_mime_type: string | null;
  status: string;
  reply_to_message_id: string | null;
  is_edited: boolean;
  is_deleted: boolean;
  deleted_for_everyone: boolean;
  pinned: boolean;
  starred_by: string[];
  seen_by: string[];
  delivered_to: string[];
  created_at: string;
  updated_at: string;
}

export interface DBFriendRequest {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export interface DBUserBlock {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export interface DBReport {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  conversation_id: string | null;
  message_id: string | null;
  reason: string;
  details: string | null;
  status: "pending" | "resolved" | "dismissed";
  resolved_by: string | null;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBTypingIndicator {
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
  expires_at: string;
}

export interface DBUploadedFile {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_key: string;
  file_size: number;
  file_type: string;
  created_at: string;
}

export interface DBNotificationSettings {
  user_id: string;
  browser_enabled: boolean;
  sound_enabled: boolean;
  message_preview: boolean;
  group_notifications: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
}

// UI helper types
export interface ConversationWithMembers extends DBConversation {
  members?: DBProfile[];
  last_message?: DBMessage | null;
  unread_count?: number;
}

export interface MessageWithSender extends DBMessage {
  sender?: DBProfile;
}

// Alias for convenience
export type ConvType = ConversationWithMembers;
