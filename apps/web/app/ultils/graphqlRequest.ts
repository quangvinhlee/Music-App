import { request } from "graphql-request";

const endpoint = "http://localhost:8000/graphql";

export const graphQLRequest = async (
  query: string,
  variables: any,
  p0?: { signal: AbortSignal }
) => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const headers: HeadersInit = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    const data = await request(endpoint, query, variables, headers);

    return data;
  } catch (error: any) {
    const gqlError = error.response?.errors?.[0]?.message || error.message;

    throw new Error(gqlError || "Something went wrong");
  }
};
