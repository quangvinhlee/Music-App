import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { print } from "graphql";
import { graphQLRequest } from "@/utils/graphqlRequest";
import { UPDATE_USER_PROFILE } from "app/mutations/user";
import { User } from "@/types/user";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = (await graphQLRequest(
        `query getUser { getUser { id email username avatar role isVerified isOurUser } }`,
        {}
      )) as { getUser: User };
      return res.getUser;
    },
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
