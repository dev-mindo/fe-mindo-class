import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_USER_API_URL = "http://localhost:3004";
const DEFAULT_USER_API_KEY =
  "630272a0cce694b7cde179c214de148185753e42102ca6bddee92ccebda8cc76";

const getResultCount = (data: any) => {
  if (Array.isArray(data?.data?.results)) return data.data.results.length;
  if (Array.isArray(data?.data)) return data.data.length;
  if (Array.isArray(data?.results)) return data.results.length;
  if (Array.isArray(data?.data?.data?.results)) {
    return data.data.data.results.length;
  }

  return 0;
};

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

    const buildUrl = (options?: {
      queryKey?: "search" | "username";
      includeRole?: boolean;
      includeStatus?: boolean;
    }) => {
      const upstreamUrl = new URL("/v1/user", userApiUrl);

      upstreamUrl.searchParams.set("page", String(page));
      upstreamUrl.searchParams.set("limit", String(limit));
      upstreamUrl.searchParams.set("orderBy", orderBy);

      if (options?.includeRole ?? true) {
        upstreamUrl.searchParams.set("role", "peserta");
      }

      if (options?.includeStatus ?? true) {
        upstreamUrl.searchParams.set("status", "mahasiswa");
      }

      if (search && options?.queryKey) {
        upstreamUrl.searchParams.set(options.queryKey, search);
      }

      return upstreamUrl;
    };

    const fetchUsers = async (url: URL) => {
      const response = await fetch(url, {
        headers,
        cache: "no-store",
      });
      const data = await response.json();

      return { response, data, url };
    };

    const attempts = search
      ? [
          buildUrl({ queryKey: "search", includeRole: true, includeStatus: true }),
          buildUrl({
            queryKey: "search",
            includeRole: true,
            includeStatus: false,
          }),
          buildUrl({
            queryKey: "search",
            includeRole: false,
            includeStatus: false,
          }),
          buildUrl({
            queryKey: "username",
            includeRole: true,
            includeStatus: true,
          }),
          buildUrl({
            queryKey: "username",
            includeRole: true,
            includeStatus: false,
          }),
          buildUrl({
            queryKey: "username",
            includeRole: false,
            includeStatus: false,
          }),
        ]
      : [buildUrl({ includeRole: true, includeStatus: true })];

    let latestResult = await fetchUsers(attempts[0]);

    for (const attempt of attempts.slice(1)) {
      if (!latestResult.response.ok || getResultCount(latestResult.data) > 0) {
        break;
      }

      latestResult = await fetchUsers(attempt);
    }

    console.log("[api/users]", {
      search,
      upstreamUrl: latestResult.url.toString(),
      resultCount: getResultCount(latestResult.data),
    });

    return NextResponse.json(latestResult.data, {
      status: latestResult.response.status,
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
