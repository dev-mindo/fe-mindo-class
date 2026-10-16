import { fetchProductApi } from "@/lib/utils/fetchProductApi";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const productIds = searchParams
    .get("productIds")
    ?.split(",")
    .map(Number)
    .filter((id) => Number.isInteger(id) && id >= 1);

  const getPositiveInteger = (key: string, fallback?: number) => {
    const value = searchParams.get(key);

    if (value === null) return fallback;

    const parsedValue = Number(value);
    return Number.isInteger(parsedValue) && parsedValue >= 1
      ? parsedValue
      : fallback;
  };

  const orderByDate = searchParams.get("orderByDate");

  try {
    const product = await fetchProductApi("/products", {
      query: {
        page: getPositiveInteger("page", 1),
        limit: getPositiveInteger("limit", 10),
        id: getPositiveInteger("id"),
        userId: getPositiveInteger("userId"),
        productIds: productIds?.length ? productIds : undefined,
        search: search || undefined,
        startDate: searchParams.get("startDate") || undefined,
        endDate: searchParams.get("endDate") || undefined,
        orderByDate: orderByDate === "asc" ? "asc" : "desc",
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
