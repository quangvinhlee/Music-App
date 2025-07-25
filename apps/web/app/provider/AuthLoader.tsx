"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "app/store/store";
import { setUser } from "app/store/auth";
import { print } from "graphql";
import { graphQLRequest } from "app/utils/graphqlRequest";
import { CHECK_AUTH_QUERY } from "app/mutations/auth";
import { useLogout } from "app/query/useAuthQueries";
import { User } from "app/types/user";

export default function AuthLoader() {
  const dispatch = useDispatch<AppDispatch>();
  const logoutMutation = useLogout();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = (await graphQLRequest(
          print(CHECK_AUTH_QUERY),
          {}
        )) as { checkAuth: User };
        if (response.checkAuth) {
          dispatch(setUser(response.checkAuth));
        } else {
          logoutMutation.mutate();
        }
      } catch (error) {
        logoutMutation.mutate();
      }
    };
    checkAuthStatus();
  }, []);

  return null;
}
