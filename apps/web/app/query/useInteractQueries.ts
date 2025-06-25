import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { print } from "graphql";
import { graphQLRequest } from "app/utils/graphqlRequest";
import {
  FETCH_RECENT_PLAYED,
  CREATE_RECENT_PLAYED,
} from "app/mutations/interact";

// Type interfaces for responses
interface GraphQLResponse {
  [key: string]: unknown;
}

export function useCreateRecentPlayed(user: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: any) => {
      if (!user) throw new Error("User not authenticated");
      const response = (await graphQLRequest(print(CREATE_RECENT_PLAYED), {
        input: input,
      })) as any;
      return response.createRecentPlayed;
    },
    onSuccess: () => {
      // Invalidate the recentPlayed query so it refetches
      queryClient.invalidateQueries({ queryKey: ["recentPlayed"] });
    },
  });
}

export function useRecentPlayed(user: any) {
  return useQuery({
    queryKey: ["recentPlayed", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const response = (await graphQLRequest(
        print(FETCH_RECENT_PLAYED),
        {}
      )) as any;
      return response.getRecentPlayed;
    },
    enabled: !!user,
  });
}
