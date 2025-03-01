"use server";
export type FetchMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: number;
}

interface FetchOptions {
  method?: FetchMethod;
  body?: any;
  headers?: HeadersInit;
}

export async function fetchApi<ApiResponse>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse> {
  const API_URL = process.env.API_URL;

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });

    // if (!response.ok) {
    //   return
    // }

    return await response.json();
  } catch (error) {
    console.error("Error in fetchApi:", error);
    return {
      success: false,
      message: "Server Error",
      errorCode: 500,
    } as ApiResponse;
  }
}
