import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { print } from "graphql";
import { graphQLRequest } from "@/utils/graphqlRequest";
import {
  FETCH_RECENT_PLAYED,
  CREATE_RECENT_PLAYED,
} from "app/mutations/interact";

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

export function useRecentPlayed(user: any, options?: { enabled?: boolean }) {
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
    enabled: options?.enabled !== undefined ? options.enabled : !!user,
    retry: false,
    retryOnMount: false,
    // Don't refetch when window regains focus if user is not authenticated
    refetchOnWindowFocus: false,
    // Don't refetch on reconnect if user is not authenticated
    refetchOnReconnect: false,
  });
}
