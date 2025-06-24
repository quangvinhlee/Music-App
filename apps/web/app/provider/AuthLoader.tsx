"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "app/store/store";
import { setUser } from "app/store/auth";
import { print } from "graphql";
import { graphQLRequest } from "app/utils/graphqlRequest";
import { GET_USER_QUERY } from "app/mutations/auth";

export default function AuthLoader() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Use your existing GraphQL endpoint
        // This will automatically include HTTP-only cookies
        const response = (await graphQLRequest(
          print(GET_USER_QUERY),
          {}
        )) as any;

        if (response.getUser) {
          dispatch(setUser(response.getUser));
        }
      } catch (error) {
        // Don't set error, just leave user as null
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  return null; // This component doesn't render anything
}
