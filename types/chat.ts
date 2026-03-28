/**
 * Chat History Types
 *
 * === DATABASE SCHEMA (Vercel Postgres / Neon / Supabase) ===
 *
 * Khi muốn migrate từ localStorage lên database thật, dùng schema sau:
 *
 * CREATE TABLE conversations (
 *   id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id     VARCHAR(50)  NOT NULL DEFAULT 'admin',
 *   title       VARCHAR(255) NOT NULL DEFAULT 'Cuộc trò chuyện mới',
 *   created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
 *   updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
 * );
 *
 * CREATE TABLE messages (
 *   id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   conversation_id  UUID         NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
 *   role             VARCHAR(20)  NOT NULL CHECK (role IN ('user', 'assistant')),
 *   content          TEXT         NOT NULL,
 *   created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
 * );
 *
 * CREATE INDEX idx_messages_conv ON messages(conversation_id);
 * CREATE INDEX idx_conversations_user ON conversations(user_id, updated_at DESC);
 * ============================================================
 */

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: StoredMessage[];
  createdAt: string;
  updatedAt: string;
}
