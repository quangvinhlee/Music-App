import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { print } from "graphql";
import { graphQLRequest } from "app/utils/graphqlRequest";
import {
  UPDATE_USER_PROFILE,
  GET_CURRENT_USER,
  GET_USER_BY_ID,
  UPDATE_USER_BY_ID,
  UPLOAD_AVATAR,
  DELETE_AVATAR,
} from "app/mutations/user";
import { User } from "app/types/user";
import { useDispatch } from "react-redux";
import { updateUser } from "app/store/auth";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = (await graphQLRequest(print(GET_CURRENT_USER), {})) as {
        getUser: User;
      };
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

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (fileData: string) => {
      const res = (await graphQLRequest(print(UPLOAD_AVATAR), {
        input: { file: fileData },
      })) as { uploadAvatar: User };
      return res.uploadAvatar;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      // Update Redux state with new user data
      dispatch(updateUser(data));
    },
  });
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async () => {
      const res = (await graphQLRequest(print(DELETE_AVATAR), {})) as {
        deleteAvatar: User;
      };
      return res.deleteAvatar;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      // Update Redux state with new user data
      dispatch(updateUser(data));
    },
  });
}
