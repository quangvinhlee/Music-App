"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "app/store/store";
import { setUser, logout } from "app/store/auth";
import { print } from "graphql";
import { graphQLRequest } from "@/utils/graphqlRequest";
import { CHECK_AUTH_QUERY } from "app/mutations/auth";
import Cookies from "js-cookie";
import { useLogout } from "app/query/useAuthQueries";

export default function AuthLoader() {
  const dispatch = useDispatch<AppDispatch>();
  const logoutMutation = useLogout();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Use the new checkAuth query that doesn't require authentication
        const response = (await graphQLRequest(
          print(CHECK_AUTH_QUERY),
          {}
        )) as any;

        if (response.checkAuth) {
          dispatch(setUser(response.checkAuth));
        } else {
          logoutMutation.mutate();
        }
      } catch (error) {
        // Token is expired or invalid, clear everything
        logoutMutation.mutate();
      }
    };

    checkAuthStatus();
  }, [dispatch, logoutMutation]);

  return null; // This component doesn't render anything
}
