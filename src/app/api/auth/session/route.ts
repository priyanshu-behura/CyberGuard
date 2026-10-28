import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return NextResponse.json({ authenticated: false, session: null }, { status: 200 });
  }

  return NextResponse.json({
    authenticated: true,
    token: sessionCookie.value,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = body?.session;

    if (!session || !session.token) {
      return NextResponse.json(
        { error: "Invalid session payload" },
        { status: 400 }
      );
    }

    const response = NextResponse.json(
      { success: true, message: "Session synchronized" },
      { status: 200 }
    );

    const maxAge = Math.floor(
      (new Date(session.expiresAt).getTime() - Date.now()) / 1000
    );

    // Set cookie on response
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: session.token,
      httpOnly: false, // Accessible by both middleware and client sync
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: maxAge > 0 ? maxAge : 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("POST /api/auth/session error:", error);
    return NextResponse.json(
      { error: "Failed to process session sync", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json(
    { success: true, message: "Session cleared" },
    { status: 200 }
  );

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });

  return response;
}
