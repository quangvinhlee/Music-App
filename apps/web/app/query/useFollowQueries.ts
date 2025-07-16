import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { print } from "graphql";
import { graphQLRequest } from "app/utils/graphqlRequest";
import {
  FOLLOW_USER,
  UNFOLLOW_USER,
  IS_FOLLOWING,
  GET_FOLLOWERS,
  GET_FOLLOWING,
} from "app/mutations/user";

export function useFollowUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (followingId: string) => {
      await graphQLRequest(print(FOLLOW_USER), { followingId });
    },
    onSuccess: (_, followingId) => {
      queryClient.invalidateQueries({ queryKey: ["isFollowing", followingId] });
      queryClient.invalidateQueries({ queryKey: ["getFollowers"] });
      queryClient.invalidateQueries({ queryKey: ["getFollowing"] });
    },
  });
}

export function useUnfollowUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (followingId: string) => {
      await graphQLRequest(print(UNFOLLOW_USER), { followingId });
    },
    onSuccess: (_, followingId) => {
      queryClient.invalidateQueries({ queryKey: ["isFollowing", followingId] });
      queryClient.invalidateQueries({ queryKey: ["getFollowers"] });
      queryClient.invalidateQueries({ queryKey: ["getFollowing"] });
    },
  });
}

export function useIsFollowing(followingId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["isFollowing", followingId],
    queryFn: async () => {
      const res = (await graphQLRequest(print(IS_FOLLOWING), {
        followingId,
      })) as { isFollowing: boolean };
      return res.isFollowing;
    },
    enabled: !!followingId && enabled,
  });
}

export function useFollowers(userId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["getFollowers", userId],
    queryFn: async () => {
      const res = (await graphQLRequest(print(GET_FOLLOWERS), { userId })) as {
        getFollowers: any[];
      };
      return res.getFollowers;
    },
    enabled: !!userId && enabled,
  });
}

export function useFollowing(userId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["getFollowing", userId],
    queryFn: async () => {
      const res = (await graphQLRequest(print(GET_FOLLOWING), { userId })) as {
        getFollowing: any[];
      };
      return res.getFollowing;
    },
    enabled: !!userId && enabled,
  });
}
