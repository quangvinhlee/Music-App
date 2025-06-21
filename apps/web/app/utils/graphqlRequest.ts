import { GraphQLClient } from "graphql-request";

const client = new GraphQLClient("http://localhost:8000/graphql", {
  credentials: "include", // Send cookies automatically
});

export const graphQLRequest = async (query: string, variables: any) => {
  try {
    const data = await client.request(query, variables);
    console.log("data", data);
    return data;
  } catch (error: any) {
    console.error("GraphQL Error Details:", {
      message: error.message,
      response: error.response,
      errors: error.response?.errors,
      status: error.response?.status,
    });
    throw new Error(error.response?.errors?.[0]?.message || error.message);
  }
};
