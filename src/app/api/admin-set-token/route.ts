import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const token = searchParams.get("token");
  const refreshToken = searchParams.get("refreshToken");

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Token is required" },
      { status: 400 }
    );
  }

  // requestHeader.set('auth_token', token)
  if (refreshToken) {
    cookies().set("admin_refresh_token", refreshToken);
  }
  cookies().set("admin_auth_token", token);

  return NextResponse.json({
    success: true,
    message: "Token stored in cookies",
  });
}
