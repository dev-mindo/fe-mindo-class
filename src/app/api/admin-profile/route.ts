import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const API_URL = process.env.API_URL;
  const adminToken = cookies().get("admin_auth_token")?.value;
  const normalizedAdminToken = adminToken?.replace(/^Bearer\s+/i, "");

  if (!API_URL) {
    return NextResponse.json(
      {
        success: false,
        message: "API_URL belum dikonfigurasi",
        statusCode: 500,
      },
      { status: 500 }
    );
  }

  if (!normalizedAdminToken) {
    return NextResponse.json(
      {
        success: false,
        message: "Token admin tidak ditemukan",
        statusCode: 401,
      },
      { status: 401 }
    );
  }

  try {
    const profileUrl = `${API_URL}/admin/user/profile`;
    const response = await fetch(profileUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        authorization: `Bearer ${normalizedAdminToken}`,
        admin_authorization: `Bearer ${normalizedAdminToken}`,
      },
      cache: "no-store",
    });
    let data = await response.json();

    if (response.status === 401 || response.status === 403) {
      const retryResponse = await fetch(profileUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          authorization: `Bearer ${normalizedAdminToken}`,
          admin_authorization: normalizedAdminToken,
        },
        cache: "no-store",
      });

      data = await retryResponse.json();

      return NextResponse.json(data, { status: retryResponse.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal memeriksa profile admin",
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}
