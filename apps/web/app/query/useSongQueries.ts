import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { print } from "graphql";
import { graphQLRequest } from "app/utils/graphqlRequest";
import {
  FETCH_TRENDING_SONG,
  FETCH_TRENDING_SONG_PLAYLISTS,
  FETCH_TRENDING_PLAYLIST_SONGS,
  FETCH_RELATED_SONGS,
  SEARCH_TRACKS,
  SEARCH_USERS,
  SEARCH_ALBUMS,
  FETCH_STREAM_URL,
  FETCH_GLOBAL_TRENDING_SONGS,
} from "app/mutations/song";

// Type interfaces for responses
interface GraphQLResponse {
  [key: string]: unknown;
}

interface StreamUrlResponse {
  fetchStreamUrl: string | null;
}

interface GlobalTrendingSongsResponse {
  tracks: Array<{
    id: string;
    title: string;
    artist: string;
    artistId: string;
    genre: string;
    artwork: string;
    duration: number;
    playbackCount: number;
  }>;
  nextHref?: string;
}

export function useTrendingIdByCountry(countryCode: string) {
  return useQuery({
    queryKey: ["trendingId", countryCode],
    queryFn: async () => {
      const response = (await graphQLRequest(print(FETCH_TRENDING_SONG), {
        fetchTrendingSongInput: { CountryCode: countryCode },
      })) as GraphQLResponse;
      if (!response?.fetchTrendingSong)
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
      const response = (await graphQLRequest(
        print(FETCH_TRENDING_SONG_PLAYLISTS),
        {
          fetchTrendingSongPlaylistsInput: { id },
        }
      )) as GraphQLResponse;
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
      const response = (await graphQLRequest(
        print(FETCH_TRENDING_PLAYLIST_SONGS),
        {
          fetchTrendingPlaylistSongsInput: { id },
        }
      )) as GraphQLResponse;
      if (!response.fetchTrendingPlaylistSongs)
        throw new Error("Invalid response from server");
      return response.fetchTrendingPlaylistSongs;
    },
    enabled: !!id && (options?.enabled ?? true),
  });
}

export function useGlobalTrendingSongs(options?: {
  enabled?: boolean;
  nextHref?: string;
}) {
  return useInfiniteQuery({
    queryKey: ["globalTrendingSongs"],
    queryFn: async ({ pageParam = null }) => {
      const variables = pageParam
        ? { fetchGlobalTrendingSongsInput: { nextHref: pageParam } }
        : { fetchGlobalTrendingSongsInput: {} };

      const response = (await graphQLRequest(
        print(FETCH_GLOBAL_TRENDING_SONGS),
        variables
      )) as GraphQLResponse;
      if (!response?.fetchGlobalTrendingSongs)
        throw new Error("Invalid response from server");
      return response.fetchGlobalTrendingSongs as GlobalTrendingSongsResponse;
    },
    enabled: options?.enabled ?? true,
    getNextPageParam: (lastPage: GlobalTrendingSongsResponse) =>
      lastPage?.nextHref || undefined,
    initialPageParam: null,
  });
}

export function useRelatedSongs(
  songId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["relatedSongs", songId],
    queryFn: async () => {
      const response = (await graphQLRequest(print(FETCH_RELATED_SONGS), {
        fetchRelatedSongsInput: { id: songId },
      })) as GraphQLResponse;
      if (!response?.fetchRelatedSongs)
        throw new Error("Invalid response from server");
      return response.fetchRelatedSongs;
    },
    enabled: !!songId && (options?.enabled ?? true),
  });
}

export function useSearchTracks(
  query: string,
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: ["searchTracks", query],
    queryFn: async ({ pageParam = null }) => {
      const variables = pageParam
        ? { searchTracksInput: { q: query, nextHref: pageParam } }
        : { searchTracksInput: { q: query } };

      const response = (await graphQLRequest(
        print(SEARCH_TRACKS),
        variables
      )) as GraphQLResponse;
      if (!response?.searchTracks)
        throw new Error("Invalid response from server");
      return response.searchTracks;
    },
    enabled: !!query && (options?.enabled ?? true),
    getNextPageParam: (lastPage: any) => lastPage?.nextHref || undefined,
    initialPageParam: null,
  });
}

export function useSearchUsers(query: string, options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: ["searchUsers", query],
    queryFn: async ({ pageParam = null }) => {
      const variables = pageParam
        ? { searchUsersInput: { q: query, nextHref: pageParam } }
        : { searchUsersInput: { q: query } };

      const response = (await graphQLRequest(
        print(SEARCH_USERS),
        variables
      )) as GraphQLResponse;
      if (!response?.searchUsers)
        throw new Error("Invalid response from server");
      return response.searchUsers;
    },
    enabled: !!query && (options?.enabled ?? true),
    getNextPageParam: (lastPage: any) => lastPage?.nextHref || undefined,
    initialPageParam: null,
  });
}

export function useSearchAlbums(
  query: string,
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: ["searchAlbums", query],
    queryFn: async ({ pageParam = null }) => {
      const variables = pageParam
        ? { searchAlbumsInput: { q: query, nextHref: pageParam } }
        : { searchAlbumsInput: { q: query } };

      const response = (await graphQLRequest(
        print(SEARCH_ALBUMS),
        variables
      )) as GraphQLResponse;
      if (!response?.searchAlbums)
        throw new Error("Invalid response from server");
      return response.searchAlbums;
    },
    enabled: !!query && (options?.enabled ?? true),
    getNextPageParam: (lastPage: any) => lastPage?.nextHref || undefined,
    initialPageParam: null,
  });
}

export function useStreamUrl(trackId: string | null) {
  return useQuery({
    queryKey: ["streamUrl", trackId],
    queryFn: async () => {
      if (!trackId) throw new Error("No track ID provided");

      const response = (await graphQLRequest(print(FETCH_STREAM_URL), {
        fetchStreamUrlInput: { trackId },
      })) as StreamUrlResponse;

      if (!response?.fetchStreamUrl)
        throw new Error("Invalid response from server");

      return response.fetchStreamUrl;
    },
    enabled: !!trackId,
  });
}
