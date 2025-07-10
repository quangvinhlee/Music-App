import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { print } from "graphql";
import { graphQLRequest } from "@/utils/graphqlRequest";
import {
  GET_MY_PLAYLISTS,
  GET_PLAYLIST,
  CREATE_PLAYLIST,
  UPDATE_PLAYLIST,
  DELETE_PLAYLIST,
  ADD_TRACK_TO_PLAYLIST,
  REMOVE_TRACK_FROM_PLAYLIST,
} from "app/mutations/playlist";
import { PlaylistResponse } from "@/types/playlist";
import { DeletePlaylistResponse } from "@/types/music";

export function useMyPlaylists() {
  return useQuery({
    queryKey: ["myPlaylists"],
    queryFn: async () => {
      const res = (await graphQLRequest(print(GET_MY_PLAYLISTS), {})) as {
        getMyPlaylists: PlaylistResponse[];
      };
      return res.getMyPlaylists;
    },
  });
}

export function usePlaylist(playlistId: string) {
  return useQuery({
    queryKey: ["playlist", playlistId],
    queryFn: async () => {
      const res = (await graphQLRequest(print(GET_PLAYLIST), {
        playlistId,
      })) as {
        getPlaylist: PlaylistResponse;
      };
      return res.getPlaylist;
    },
    enabled: !!playlistId,
  });
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: any) => {
      const res = (await graphQLRequest(print(CREATE_PLAYLIST), { input })) as {
        createPlaylist: PlaylistResponse;
      };
      return res.createPlaylist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myPlaylists"] });
    },
  });
}

export function useUpdatePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      playlistId,
      input,
    }: {
      playlistId: string;
      input: any;
    }) => {
      const res = (await graphQLRequest(print(UPDATE_PLAYLIST), {
        playlistId,
        input,
      })) as {
        updatePlaylist: PlaylistResponse;
      };
      return res.updatePlaylist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myPlaylists"] });
    },
  });
}

export function useDeletePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (playlistId: string) => {
      const res = (await graphQLRequest(print(DELETE_PLAYLIST), {
        playlistId,
      })) as {
        deletePlaylist: DeletePlaylistResponse;
      };
      return res.deletePlaylist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myPlaylists"] });
    },
  });
}

export function useAddTrackToPlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: any) => {
      const res = (await graphQLRequest(print(ADD_TRACK_TO_PLAYLIST), {
        input,
      })) as {
        addTrackToPlaylist: PlaylistResponse;
      };
      return res.addTrackToPlaylist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myPlaylists"] });
    },
  });
}

export function useRemoveTrackFromPlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      playlistId,
      trackId,
    }: {
      playlistId: string;
      trackId: string;
    }) => {
      const res = (await graphQLRequest(print(REMOVE_TRACK_FROM_PLAYLIST), {
        playlistId,
        trackId,
      })) as {
        removeTrackFromPlaylist: PlaylistResponse;
      };
      return res.removeTrackFromPlaylist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myPlaylists"] });
    },
  });
}
