import { NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return NextResponse.json(
      { success: false, error: "Нэвтрэх нэр эсвэл нууц үг буруу байна." },
      { status: 401 }
    );
  }

  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "fallback-secret-change-this"
  );

  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  return response;
}
