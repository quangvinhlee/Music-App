import { GraphQLClient } from "graphql-request";

const client = new GraphQLClient("http://localhost:8000/graphql", {
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
