import { NextResponse } from 'next/server';
import { getSql, ensureTables } from '@/lib/db';

// PUT /api/conversations/[id]
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTables();
    const sql = getSql();

    const { id } = await params;
    const { messages } = await req.json() as {
      messages: { id: string; role: string; content: string; createdAt: string }[];
    };

    const firstUser = messages.find((m) => m.role === 'user');
    const titleFromMsg = firstUser
      ? firstUser.content.slice(0, 45) + (firstUser.content.length > 45 ? '...' : '')
      : null;

    // Cập nhật title + updated_at
    if (titleFromMsg) {
      await sql`
        UPDATE conversations
        SET
          updated_at = NOW(),
          title = CASE
            WHEN title = 'Cuộc trò chuyện mới' THEN ${titleFromMsg}
            ELSE title
          END
        WHERE id = ${id} AND user_id = 'admin'
      `;
    } else {
      await sql`
        UPDATE conversations
        SET updated_at = NOW()
        WHERE id = ${id} AND user_id = 'admin'
      `;
    }

    // Xoá messages cũ rồi insert lại
    await sql`DELETE FROM messages WHERE conversation_id = ${id}`;

    for (const m of messages) {
      await sql`
        INSERT INTO messages (id, conversation_id, role, content, created_at)
        VALUES (${m.id}, ${id}, ${m.role}, ${m.content}, ${m.createdAt})
        ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content
      `;
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[PUT /api/conversations/[id]]', err);
    return NextResponse.json(
      { error: err?.message ?? 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getSql();
    const { id } = await params;

    await sql`
      DELETE FROM conversations
      WHERE id = ${id} AND user_id = 'admin'
    `;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[DELETE /api/conversations/[id]]', err);
    return NextResponse.json(
      { error: err?.message ?? 'Internal Server Error' },
      { status: 500 }
    );
  }
}
