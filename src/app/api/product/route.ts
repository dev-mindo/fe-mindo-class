import { fetchProductApi } from "@/lib/utils/fetchProductApi";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();

  try {
    const product = await fetchProductApi("/product", {
      query: {
        page: searchParams.get("page") ?? 1,
        limit: searchParams.get("limit") ?? 5,
        orderByDate: searchParams.get("orderByDate") ?? "desc",
        search: search || undefined,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch product";

    console.error("[api/product]", message);

    return NextResponse.json(
      {
        message,
      },
      {
        status: 500,
      }
    );
  }
}
