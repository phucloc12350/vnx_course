import { NextResponse } from 'next/server';
import { getSql, ensureTables } from '@/lib/db';

// GET /api/conversations — lấy danh sách conversations + messages
export async function GET() {
  try {
    await ensureTables();
    const sql = getSql();

    const rows = await sql`
      SELECT
        c.id,
        c.title,
        c.created_at  AS "createdAt",
        c.updated_at  AS "updatedAt",
        COALESCE(
          json_agg(
            json_build_object(
              'id',        m.id,
              'role',      m.role,
              'content',   m.content,
              'createdAt', m.created_at
            )
            ORDER BY m.created_at ASC
          ) FILTER (WHERE m.id IS NOT NULL),
          '[]'
        ) AS messages
      FROM conversations c
      LEFT JOIN messages m ON m.conversation_id = c.id
      WHERE c.user_id = 'admin'
      GROUP BY c.id
      ORDER BY c.updated_at DESC
    `;

    return NextResponse.json(rows);
  } catch (err) {
    console.error('[GET /api/conversations]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/conversations — tạo conversation mới
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
  } catch (err) {
    console.error('[POST /api/conversations]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
