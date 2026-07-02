import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

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
  const searchParams = req.nextUrl.searchParams
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Token is required" },
      { status: 400 }
    );
  }
  
  // requestHeader.set('auth_token', token)

  const response = NextResponse.json({
    success: true,
    message: "Token stored in cookies",
  });

  response.cookies.set("auth_token", token, getCookieOptions(req));

  return response;
}

export async function GET() {
  try {
    const token = cookies().get("auth_token") || null;

    console.log("Get Token:", token);

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error("Error getting token:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}
