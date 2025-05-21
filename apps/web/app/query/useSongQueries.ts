import { useQuery } from "@tanstack/react-query";
import { print } from "graphql";
import { graphQLRequest } from "app/ultils/graphqlRequest";
import {
  FETCH_TRENDING_SONG,
  FETCH_TRENDING_SONG_PLAYLISTS,
  FETCH_TRENDING_PLAYLIST_SONGS,
  FETCH_RELATED_SONGS,
} from "app/mutations/song";

export function useTrendingIdByCountry(countryCode: string) {
  return useQuery({
    queryKey: ["trendingId", countryCode],
    queryFn: async () => {
      const response = await graphQLRequest(print(FETCH_TRENDING_SONG), {
        fetchTrendingSongInput: { CountryCode: countryCode },
      });
      if (!response.fetchTrendingSong)
        throw new Error("Invalid response from server");
      return response.fetchTrendingSong;
    },
    enabled: !!countryCode,
  });
}

export function useTrendingSongPlaylists(
  id: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["trendingSongPlaylists", id],
    queryFn: async () => {
      const response = await graphQLRequest(
        print(FETCH_TRENDING_SONG_PLAYLISTS),
        {
          fetchTrendingSongPlaylistsInput: { id },
        }
      );
      if (!response.fetchTrendingSongPlaylists)
        throw new Error("Invalid response from server");
      return response.fetchTrendingSongPlaylists;
    },
    enabled: !!id && (options?.enabled ?? true),
  });
}

export function useTrendingPlaylistSongs(
  id: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["trendingPlaylistSongs", id],
    queryFn: async () => {
      const response = await graphQLRequest(
        print(FETCH_TRENDING_PLAYLIST_SONGS),
        {
          fetchTrendingPlaylistSongsInput: { id },
        }
      );
      if (!response.fetchTrendingPlaylistSongs)
        throw new Error("Invalid response from server");
      return response.fetchTrendingPlaylistSongs;
    },
    enabled: !!id && (options?.enabled ?? true),
  });
}

export function useRelatedSongs(
  songId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["relatedSongs", songId],
    queryFn: async () => {
      const response = await graphQLRequest(print(FETCH_RELATED_SONGS), {
        fetchRelatedSongsInput: { id: songId },
      });
      if (!response.fetchRelatedSongs)
        throw new Error("Invalid response from server");
      return response.fetchRelatedSongs;
    },
    enabled: !!songId && (options?.enabled ?? true),
  });
}
