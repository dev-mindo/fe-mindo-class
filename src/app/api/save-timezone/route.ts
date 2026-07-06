import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { classSlug, timezone, token } = await request.json();

    if (!classSlug || !timezone || !token) {
      return NextResponse.json(
        { success: false, message: "classSlug, timezone, and token are required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${process.env.API_URL}/user-class/save-timezone/${encodeURIComponent(
        classSlug
      )}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ timezone }),
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[api/save-timezone]", error);

    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}
