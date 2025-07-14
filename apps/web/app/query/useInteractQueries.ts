import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { print } from "graphql";
import { graphQLRequest } from "app/utils/graphqlRequest";
import {
  FETCH_RECENT_PLAYED,
  CREATE_RECENT_PLAYED,
  CREATE_PLAYLIST,
  ADD_TRACK_TO_PLAYLIST,
  GET_PLAYLISTS,
  GET_PLAYLIST,
  UPDATE_PLAYLIST,
  DELETE_PLAYLIST,
  CREATE_TRACK,
  UPDATE_TRACK,
  DELETE_TRACK,
  LIKE_TRACK,
  UNLIKE_TRACK,
  SEARCH_TRACKS,
  GET_LIKED_TRACKS,
  IS_TRACK_LIKED,
} from "app/mutations/interact";
import {
  CreatePlaylistInput,
  CreatePlaylistTrackInput,
  UpdatePlaylistInput,
} from "app/types/playlist";

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

// Playlist hooks
export function useCreatePlaylist(user: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreatePlaylistInput) => {
      if (!user) throw new Error("User not authenticated");
      const response = (await graphQLRequest(print(CREATE_PLAYLIST), {
        input: input,
      })) as any;
      return response.createPlaylist;
    },
    onSuccess: () => {
      // Invalidate playlists queries
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
}

export function useAddTrackToPlaylist(user: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      playlistId,
      input,
    }: {
      playlistId: string;
      input: CreatePlaylistTrackInput;
    }) => {
      if (!user) throw new Error("User not authenticated");
      const response = (await graphQLRequest(print(ADD_TRACK_TO_PLAYLIST), {
        playlistId,
        input,
      })) as any;
      return response.addTrackToPlaylist;
    },
    onSuccess: (_, { playlistId }) => {
      // Invalidate specific playlist and playlists list
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      queryClient.invalidateQueries({ queryKey: ["playlist", playlistId] });
    },
  });
}

export function usePlaylists(user: any, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["playlists", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const response = (await graphQLRequest(print(GET_PLAYLISTS), {})) as any;
      return response.getPlaylists;
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!user,
    retry: false,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function usePlaylist(
  user: any,
  playlistId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["playlist", playlistId, user?.id],
    queryFn: async () => {
      if (!user || !playlistId) return null;
      const response = (await graphQLRequest(print(GET_PLAYLIST), {
        playlistId,
      })) as any;
      return response.getPlaylist;
    },
    enabled:
      options?.enabled !== undefined ? options.enabled : !!user && !!playlistId,
    retry: false,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useUpdatePlaylist(user: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      playlistId,
      data,
    }: {
      playlistId: string;
      data: UpdatePlaylistInput;
    }) => {
      if (!user) throw new Error("User not authenticated");
      const response = (await graphQLRequest(print(UPDATE_PLAYLIST), {
        playlistId,
        data,
      })) as any;
      return response.updatePlaylist;
    },
    onSuccess: (_, { playlistId }) => {
      // Invalidate playlists queries and specific playlist
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      queryClient.invalidateQueries({ queryKey: ["playlist", playlistId] });
    },
  });
}

export function useDeletePlaylist(user: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (playlistId: string) => {
      if (!user) throw new Error("User not authenticated");
      const response = (await graphQLRequest(print(DELETE_PLAYLIST), {
        playlistId,
      })) as any;
      return response.deletePlaylist;
    },
    onSuccess: () => {
      // Invalidate playlists queries
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
}

// Track mutations
export function useCreateTrack(user: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      description?: string;
      audioData: string;
      artworkData?: string;
      duration: number;
      genre?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");
      const response = (await graphQLRequest(print(CREATE_TRACK), {
        input,
      })) as any;
      return response.createTrack;
    },
    onSuccess: () => {
      // Invalidate user queries to refresh user data with new tracks
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["getUser"] });
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
    },
  });
}

export function useUpdateTrack(user: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      trackId,
      input,
    }: {
      trackId: string;
      input: {
        title?: string;
        description?: string;
        artworkData?: string;
        genre?: string;
      };
    }) => {
      if (!user) throw new Error("User not authenticated");
      const response = (await graphQLRequest(print(UPDATE_TRACK), {
        trackId,
        input,
      })) as any;
      return response.updateTrack;
    },
    onSuccess: (_, { trackId }) => {
      // Invalidate user queries and specific track
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["getUser"] });
      queryClient.invalidateQueries({ queryKey: ["track", trackId] });
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
    },
  });
}

export function useDeleteTrack(user: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (trackId: string) => {
      if (!user) throw new Error("User not authenticated");
      const response = (await graphQLRequest(print(DELETE_TRACK), {
        trackId,
      })) as any;
      return response.deleteTrack;
    },
    onSuccess: () => {
      // Invalidate user queries and tracks queries
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["getUser"] });
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
      // Invalidate playlist queries since tracks might be removed from playlists
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      queryClient.invalidateQueries({ queryKey: ["playlist"] });
    },
  });
}

export function useLikeTrack(user: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (trackId: string) => {
      if (!user) throw new Error("User not authenticated");
      const response = (await graphQLRequest(print(LIKE_TRACK), {
        trackId,
      })) as any;
      return response.likeTrack;
    },
    onSuccess: (_, trackId) => {
      // Invalidate liked tracks and track like status
      queryClient.invalidateQueries({ queryKey: ["likedTracks"] });
      queryClient.invalidateQueries({ queryKey: ["isTrackLiked", trackId] });
    },
  });
}

export function useUnlikeTrack(user: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (trackId: string) => {
      if (!user) throw new Error("User not authenticated");
      const response = (await graphQLRequest(print(UNLIKE_TRACK), {
        trackId,
      })) as any;
      return response.unlikeTrack;
    },
    onSuccess: (_, trackId) => {
      // Invalidate liked tracks and track like status
      queryClient.invalidateQueries({ queryKey: ["likedTracks"] });
      queryClient.invalidateQueries({ queryKey: ["isTrackLiked", trackId] });
    },
  });
}

export function useSearchTracks(
  query: string,
  limit: number = 20,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["tracks", "search", query, limit],
    queryFn: async () => {
      if (!query.trim()) return [];
      const response = (await graphQLRequest(print(SEARCH_TRACKS), {
        query,
        limit,
      })) as any;
      return response.searchTracks;
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!query.trim(),
    retry: false,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useIsTrackLiked(
  user: any,
  trackId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["isTrackLiked", trackId, user?.id],
    queryFn: async () => {
      if (!user || !trackId) return false;
      const response = (await graphQLRequest(print(IS_TRACK_LIKED), {
        trackId,
      })) as any;
      return response.isTrackLiked;
    },
    enabled:
      options?.enabled !== undefined ? options.enabled : !!user && !!trackId,
    retry: false,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
