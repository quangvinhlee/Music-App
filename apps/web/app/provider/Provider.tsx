"use client";

import client from "@/components/lib/apoloClient";
import { ApolloProvider } from "@apollo/client";
import { Provider as ReduxProvider } from "react-redux";
import store, { persistor } from "../store/store";
import AuthLoader from "./AuthLoader";
import { MusicProvider } from "./MusicContext";
import { PersistGate } from "redux-persist/integration/react";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ApolloProvider client={client}>
          <MusicProvider>
            <AuthLoader />
            {children}
          </MusicProvider>
        </ApolloProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
