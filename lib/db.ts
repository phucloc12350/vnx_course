import { neon } from '@neondatabase/serverless';

/**
 * Trả về Neon SQL client.
 * Gọi bên trong handler (không phải top-level) để tránh lỗi build trên Vercel
 * khi env vars chưa được inject lúc compile time.
 * Hỗ trợ cả DATABASE_URL (Neon trực tiếp) và POSTGRES_URL (Vercel Postgres).
 */
export function getSql() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Thêm vào Vercel → Settings → Environment Variables.'
    );
  }
  return neon(url);
}

/**
 * Tạo bảng nếu chưa tồn tại.
 * An toàn để gọi nhiều lần nhờ CREATE TABLE IF NOT EXISTS.
 */
export async function ensureTables() {
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS conversations (
      id          TEXT         PRIMARY KEY,
      user_id     VARCHAR(50)  NOT NULL DEFAULT 'admin',
      title       VARCHAR(255) NOT NULL DEFAULT 'Cuộc trò chuyện mới',
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id               TEXT         PRIMARY KEY,
      conversation_id  TEXT         NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      role             VARCHAR(20)  NOT NULL CHECK (role IN ('user', 'assistant')),
      content          TEXT         NOT NULL,
      created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_messages_conv
      ON messages(conversation_id)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_conv_user_time
      ON conversations(user_id, updated_at DESC)
  `;
}
