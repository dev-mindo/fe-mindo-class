"use server";

import { getAdminAuthToken, getAuthToken } from "../action/auth";

export type FetchMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  statusCode: number;
  data?: T;
  errorCode?: string;
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
  const templateCertificateApiKey = process.env.API_KEY;
  let authToken = await getAuthToken();
  let adminAuthToken = await getAdminAuthToken();
  const normalizedAdminAuthToken = adminAuthToken?.replace(/^Bearer\s+/i, "");
  const isPdfCoordinateBoundsEndpoint = endpoint.startsWith(
    "/pdf-lib/coordinate-bounds"
  );
  const isFormDataBody =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  console.log('authToken ', authToken)

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: options.method || "GET",
      headers: {
        ...(!isFormDataBody ? { "Content-Type": "application/json" } : {}),
        ...(authToken ? { authorization: `Bearer ${authToken}` } : {}),
        ...(normalizedAdminAuthToken
          ? {
              authorization: `Bearer ${normalizedAdminAuthToken}`,
              admin_authorization: `Bearer ${normalizedAdminAuthToken}`,
            }
          : {}),
        ...(isPdfCoordinateBoundsEndpoint && templateCertificateApiKey
          ? { "aws-api-key": templateCertificateApiKey }
          : {}),
        ...options.headers,
      },
      body: isFormDataBody
        ? options.body
        : options.body
          ? JSON.stringify(options.body)
          : undefined,
      cache: "no-store",
    });

    console.log(authToken ? { authorization: `Bearer ${authToken}` } : {});

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
