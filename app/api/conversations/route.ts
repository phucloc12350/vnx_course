import { NextResponse } from 'next/server';
import { getSql, ensureTables } from '@/lib/db';

// GET /api/conversations
export async function GET() {
  try {
    await ensureTables();
    const sql = getSql();

    // Lấy conversations
    const conversations = await sql`
      SELECT
        id,
        title,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM conversations
      WHERE user_id = 'admin'
      ORDER BY updated_at DESC
    `;

    if (conversations.length === 0) {
      return NextResponse.json([]);
    }

    // Lấy tất cả messages của các conversations trên
    const convIds = conversations.map((c) => c.id);
    const messages = await sql`
      SELECT id, conversation_id AS "conversationId", role, content, created_at AS "createdAt"
      FROM messages
      WHERE conversation_id = ANY(${convIds})
      ORDER BY created_at ASC
    `;

    // Gắn messages vào đúng conversation
    const result = conversations.map((conv) => ({
      ...conv,
      messages: messages
        .filter((m) => m.conversationId === conv.id)
        .map(({ conversationId: _cid, ...m }) => m),
    }));

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[GET /api/conversations]', err);
    return NextResponse.json(
      { error: err?.message ?? 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/conversations
export async function POST(req: Request) {
  try {
    await ensureTables();
    const sql = getSql();

    const { id, title } = await req.json();

    const [conv] = await sql`
      INSERT INTO conversations (id, user_id, title)
      VALUES (${id}, 'admin', ${title ?? 'Cuộc trò chuyện mới'})
      RETURNING
        id,
        title,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `;

    return NextResponse.json({ ...conv, messages: [] }, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/conversations]', err);
    return NextResponse.json(
      { error: err?.message ?? 'Internal Server Error' },
      { status: 500 }
    );
  }
}
