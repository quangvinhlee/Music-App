"use client";

import client from "@/components/lib/apoloClient";
import { ApolloProvider } from "@apollo/client";

export default function Provider({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
