import { GraphQLClient } from "graphql-request";

// Use environment variable, fallback to localhost for dev
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const client = new GraphQLClient(`${apiUrl}/graphql`, {
  credentials: "include", // Send cookies automatically
});

export const graphQLRequest = async (query: string, variables: any) => {
  try {
    const data = await client.request(query, variables);
    return data;
  } catch (error: any) {
    console.error("Full error object:", error);

    throw new Error(error.response?.errors?.[0]?.message || error.message);
  }
};
