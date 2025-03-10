import { NextRequest, NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { NextApiRequest } from "next";

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

  cookies().set("auth_token", token);

  return NextResponse.json({ success: true, message: "Token stored in cookies" });
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
