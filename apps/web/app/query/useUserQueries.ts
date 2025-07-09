import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { print } from "graphql";
import { graphQLRequest } from "@/utils/graphqlRequest";
import { UPDATE_USER_PROFILE, GET_CURRENT_USER, GET_USER_BY_ID, UPDATE_USER_BY_ID } from "app/mutations/user";
import { User } from "@/types/user";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = (await graphQLRequest(
        print(GET_CURRENT_USER),
        {}
      )) as { getUser: User };
      return res.getUser;
    },
  });
}

export function useGetUserById(userId: string) {
  return useQuery({
    queryKey: ["getUserById", userId],
    queryFn: async () => {
      const res = (await graphQLRequest(print(GET_USER_BY_ID), { userId })) as {
        getUserById: User;
      };
      return res.getUserById;
    },
    enabled: !!userId,
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: any) => {
      const res = (await graphQLRequest(print(UPDATE_USER_PROFILE), {
        input,
      })) as { updateUserProfile: User };
      return res.updateUserProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

export function useUpdateUserById() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, input }: { userId: string; input: any }) => {
      const res = (await graphQLRequest(print(UPDATE_USER_BY_ID), {
        userId,
        input,
      })) as { updateUserById: User };
      return res.updateUserById;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getUserById"] });
    },
  });
}
