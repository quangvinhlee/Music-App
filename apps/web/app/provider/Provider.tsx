"use client";

import client from "@/components/lib/apoloClient";
import { ApolloProvider } from "@apollo/client";
import { Provider as ReduxProvider } from "react-redux";
import store from "../store/store";
import AuthLoader from "./AuthLoader";
import { MusicProvider } from "./MusicContext";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <ApolloProvider client={client}>
        <MusicProvider>
          <AuthLoader />
          {children}
        </MusicProvider>
      </ApolloProvider>
    </ReduxProvider>
  );
}
