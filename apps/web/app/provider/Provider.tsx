"use client";

import client from "@/components/lib/apoloClient";
import { ApolloProvider } from "@apollo/client";
import { Provider as ReduxProvider } from "react-redux";
import store from "../store/store";
import AuthLoader from "./AuthLoader";
import { MusicProvider } from "./MusicContext";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/components/lib/queryClient";
export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <ApolloProvider client={client}>
        <QueryClientProvider client={queryClient}>
          <MusicProvider>
            <AuthLoader />
            {children}
          </MusicProvider>
        </QueryClientProvider>
      </ApolloProvider>
    </ReduxProvider>
  );
}
