import { NextResponse } from 'next/server';
import { sql, ensureTables } from '@/lib/db';

// PUT /api/conversations/[id] — cập nhật messages + title
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTables();

    const { id } = await params;
    const { messages } = await req.json() as {
      messages: { id: string; role: string; content: string; createdAt: string }[];
    };

    // Tính lại title từ tin nhắn user đầu tiên nếu chưa có
    const firstUser = messages.find((m) => m.role === 'user');
    const titleFromMsg = firstUser
      ? firstUser.content.slice(0, 45) + (firstUser.content.length > 45 ? '...' : '')
      : null;

    // Cập nhật title (chỉ khi title hiện tại là mặc định) + updated_at
    await sql`
      UPDATE conversations
      SET
        updated_at = NOW(),
        title = CASE
          WHEN title = 'Cuộc trò chuyện mới' AND ${titleFromMsg} IS NOT NULL
          THEN ${titleFromMsg}
          ELSE title
        END
      WHERE id = ${id} AND user_id = 'admin'
    `;

    // Xoá messages cũ và insert lại toàn bộ (đơn giản nhất cho dự án nhỏ)
    await sql`DELETE FROM messages WHERE conversation_id = ${id}`;

    if (messages.length > 0) {
      for (const m of messages) {
        await sql`
          INSERT INTO messages (id, conversation_id, role, content, created_at)
          VALUES (
            ${m.id},
            ${id},
            ${m.role},
            ${m.content},
            ${m.createdAt}
          )
          ON CONFLICT (id) DO UPDATE
            SET content = EXCLUDED.content
        `;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PUT /api/conversations/[id]]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/conversations/[id] — xoá conversation (messages xoá cascade)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await sql`
      DELETE FROM conversations
      WHERE id = ${id} AND user_id = 'admin'
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/conversations/[id]]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
