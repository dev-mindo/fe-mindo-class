import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_USER_API_URL = "http://localhost:3004";
const DEFAULT_USER_API_KEY =
  "630272a0cce694b7cde179c214de148185753e42102ca6bddee92ccebda8cc76";

export async function GET(request: NextRequest) {
  const userApiUrl =
    process.env.USER_API_URL ??
    process.env.NEXT_PUBLIC_USER_API_URL ??
    DEFAULT_USER_API_URL;
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get("limit")) || 5)
  );
  const search = searchParams.get("search")?.trim() ?? "";
  const requestedOrderBy = searchParams.get("orderBy");
  const orderBy = requestedOrderBy === "oldest" ? "oldest" : "latest";
  const adminToken = cookies().get("admin_auth_token")?.value;
  const normalizedAdminToken = adminToken?.replace(/^Bearer\s+/i, "");
  const userApiKey = process.env.USER_API_KEY ?? DEFAULT_USER_API_KEY;

  const upstreamUrl = new URL("/v1/user", userApiUrl);
  upstreamUrl.searchParams.set("page", String(page));
  upstreamUrl.searchParams.set("limit", String(limit));
  upstreamUrl.searchParams.set("orderBy", orderBy);
  upstreamUrl.searchParams.set("role", "peserta");
  upstreamUrl.searchParams.set("status", "mahasiswa");

  if (search) {
    upstreamUrl.searchParams.set("search", search);
  }

  try {
    const response = await fetch(upstreamUrl, {
      headers: {
        Accept: "application/json",
        "x-api-key": userApiKey,
        ...(normalizedAdminToken
          ? {
              Authorization: `Bearer ${normalizedAdminToken}`,
              admin_authorization: `Bearer ${normalizedAdminToken}`,
            }
          : {}),
      },
      cache: "no-store",
    });
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[api/users]", error);

    return NextResponse.json(
      {
        errorCode: 500,
        message: "Gagal mengambil daftar peserta",
        error: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
        data: {
          results: [],
          total: 0,
          page,
          limit,
          hasNext: false,
          hasPrevious: false,
        },
      },
      { status: 500 }
    );
  }
}
