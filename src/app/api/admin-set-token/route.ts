import { NextRequest, NextResponse } from "next/server";

const getCookieOptions = (req: NextRequest) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure:
    req.nextUrl.protocol === "https:" ||
    req.headers.get("x-forwarded-proto") === "https",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
});

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

  const response = NextResponse.json({
    success: true,
    message: "Token stored in cookies",
  });
  const cookieOptions = getCookieOptions(req);

  if (refreshToken) {
    response.cookies.set("admin_refresh_token", refreshToken, cookieOptions);
  }
  response.cookies.set("admin_auth_token", token, cookieOptions);

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "Admin session removed",
  });

  response.cookies.delete({
    name: "admin_auth_token",
    path: "/",
  });
  response.cookies.delete({
    name: "admin_refresh_token",
    path: "/",
  });

  return response;
}
