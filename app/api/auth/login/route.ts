import { NextResponse } from 'next/server';

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASSWORD;

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('auth-token', 'vnx-admin-auth', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 ngày
      path: '/',
    });
    return response;
  }

  return NextResponse.json(
    { error: 'Sai tài khoản hoặc mật khẩu' },
    { status: 401 }
  );
}
