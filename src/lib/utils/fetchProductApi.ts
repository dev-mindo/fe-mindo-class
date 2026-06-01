"use server";

export type ProductFetchMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type ProductApiQuery = Record<
  string,
  string | number | boolean | null | undefined
>;

export interface ProductApiErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  errorCode?: string;
}

interface ProductFetchOptions {
  method?: ProductFetchMethod;
  query?: ProductApiQuery;
  body?: any;
  headers?: HeadersInit;
}

export async function fetchProductApi<T>(
  endpoint: string,
  options: ProductFetchOptions = {}
): Promise<T | ProductApiErrorResponse> {
  const API_URL_PRODUCT = process.env.API_URL_PRODUCT;

  try {
    if (!API_URL_PRODUCT) {
      return {
        success: false,
        message: "API_URL_PRODUCT is not configured",
        statusCode: 500,
        errorCode: "ERR_API_URL_PRODUCT_NOT_CONFIGURED",
      };
    }

    const baseUrl = API_URL_PRODUCT.replace(/\/$/, "");
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = new URL(`${baseUrl}${path}`);

    Object.entries(options.query ?? {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });

    const response = await fetch(url.toString(), {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });

    const data = await response.json().catch(async () => ({
      message: await response.text(),
    }));

    if (!response.ok) {
      return {
        success: false,
        message: data?.message ?? "Failed to fetch product API",
        statusCode: response.status,
      };
    }

    return data as T;
  } catch (error) {
    console.error("Error in fetchProductApi:", error);

    return {
      success: false,
      message: "Product API Server Error",
      statusCode: 500,
      errorCode: "ERR_PRODUCT_API_SERVER_ERROR",
    };
  }
}
