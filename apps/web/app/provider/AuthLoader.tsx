"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "app/store/store";
import { setUser, logout } from "app/store/auth";
import { print } from "graphql";
import { graphQLRequest } from "app/utils/graphqlRequest";
import { CHECK_AUTH_QUERY } from "app/mutations/auth";
import Cookies from "js-cookie";

export default function AuthLoader() {
  const dispatch = useDispatch<AppDispatch>();

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
          // Token is expired or invalid, clear everything
          dispatch(logout());
          Cookies.remove("token", { path: "/" });
        }
      } catch (error) {
        // Token is expired or invalid, clear everything
        dispatch(logout());
        Cookies.remove("token", { path: "/" });
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  return null; // This component doesn't render anything
}
