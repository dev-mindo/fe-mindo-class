import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_USER_API_URL = "https://api-v2.mindoeducation.co.id/api/v1";
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
    Math.max(1, Number(searchParams.get("limit")) || 10)
  );
  const search = searchParams.get("search")?.trim() ?? "";
  const role = searchParams.get("role")?.trim() ?? "";
  const status = searchParams.get("status")?.trim() ?? "";
  const startDate = searchParams.get("startDate")?.trim() ?? "";
  const endDate = searchParams.get("endDate")?.trim() ?? "";
  const requestedOrderBy = searchParams.get("orderBy");
  const orderBy = requestedOrderBy === "oldest" ? "oldest" : "latest";
  const orderByDate =
    searchParams.get("orderByDate") === "asc" ? "asc" : "desc";
  const adminToken = cookies().get("admin_auth_token")?.value;
  const normalizedAdminToken = adminToken?.replace(/^Bearer\s+/i, "");
  const userApiKey = process.env.USER_API_KEY ?? DEFAULT_USER_API_KEY;

  try {
    const headers = {
      Accept: "application/json",
      "x-api-key": userApiKey,
      ...(normalizedAdminToken
        ? {
            Authorization: `Bearer ${normalizedAdminToken}`,
            admin_authorization: `Bearer ${normalizedAdminToken}`,
          }
        : {}),
    };

    const baseUrl = userApiUrl.replace(/\/$/, "");
    const upstreamUrl = new URL(`${baseUrl}/users`);

    upstreamUrl.searchParams.set("page", String(page));
    upstreamUrl.searchParams.set("limit", String(limit));
    upstreamUrl.searchParams.set("orderBy", orderBy);
    upstreamUrl.searchParams.set("orderByDate", orderByDate);

    if (search) upstreamUrl.searchParams.set("search", search);
    if (role) upstreamUrl.searchParams.set("role", role);
    if (status) upstreamUrl.searchParams.set("status", status);
    if (startDate) upstreamUrl.searchParams.set("startDate", startDate);
    if (endDate) upstreamUrl.searchParams.set("endDate", endDate);

    const response = await fetch(upstreamUrl, {
      headers,
      cache: "no-store",
    });
    const responseText = await response.text();
    let data: any;

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = {
        errorCode: response.status,
        message: responseText || "User API returned an invalid response",
        error: "Invalid JSON response",
        statusCode: response.status,
        data: null,
      };
    }

    console.log("[api/users]", {
      search,
      upstreamUrl: upstreamUrl.toString(),
      resultCount: Array.isArray(data?.data)
        ? data.data.length
        : (data?.data?.results?.length ?? 0),
    });

    return NextResponse.json(data, {
      status: response.status,
    });
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
