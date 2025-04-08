import { QueryClient } from "@tanstack/react-query";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export const apiRequest = async (
  method: string,
  url: string,
  data?: any,
  options?: RequestInit,
): Promise<Response> => {
  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    ...options,
  };

  if (data && method !== "GET") {
    fetchOptions.body = JSON.stringify(data);
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorText = await response.text();
    let errorMsg: string;
    try {
      const errorJson = JSON.parse(errorText);
      errorMsg = errorJson.error || errorJson.message || `HTTP error ${response.status}`;
    } catch (e) {
      errorMsg = errorText || `HTTP error ${response.status}`;
    }
    throw new Error(errorMsg);
  }

  return response;
};

export const getQueryFn = (options?: { on401?: "throw" | "returnNull" }) => {
  return async ({ queryKey }: { queryKey: (string | number | object)[] }) => {
    const url = queryKey[0] as string;
    try {
      const response = await apiRequest("GET", url);
      
      // For empty responses (204 No Content)
      if (response.status === 204) {
        return null;
      }
      
      // Handle JSON responses
      return await response.json();
    } catch (error) {
      if (
        options?.on401 === "returnNull" &&
        error instanceof Error &&
        error.message.includes("401")
      ) {
        return null;
      }
      throw error;
    }
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});