import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { print } from "graphql";
import { graphQLRequest } from "@/utils/graphqlRequest";
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
  RECOMMEND_SONGS,
  FETCH_RECOMMENDED_ARTISTS,
} from "app/mutations/song";
import {
  FetchGlobalTrendingSongsResponse,
  FetchTrendingPlaylistSongsResponse,
  FetchRecommendedArtistsResponse,
} from "@/types/music";

// Type interfaces for responses
interface GraphQLResponse {
  [key: string]: unknown;
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
      return (
        response.fetchTrendingPlaylistSongs as FetchTrendingPlaylistSongsResponse
      ).tracks;
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
      return response.fetchGlobalTrendingSongs as FetchGlobalTrendingSongsResponse;
    },
    enabled: options?.enabled ?? true,
    getNextPageParam: (lastPage: FetchGlobalTrendingSongsResponse) =>
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
      })) as GraphQLResponse;

      if (!response?.fetchStreamUrl)
        throw new Error("Invalid response from server");

      return response.fetchStreamUrl;
    },
    enabled: !!trackId,
  });
}

export function useRecommendSongs(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["recommendSongs"],
    queryFn: async () => {
      const response = (await graphQLRequest(
        print(RECOMMEND_SONGS),
        {}
      )) as any;
      if (!response?.recommendSongs?.tracks)
        throw new Error("Invalid response from server");
      return response.recommendSongs.tracks;
    },
    enabled: options?.enabled ?? true,
    retry: false,
    retryOnMount: false,
    // Don't refetch when window regains focus
    refetchOnWindowFocus: false,
    // Don't refetch on reconnect
    refetchOnReconnect: false,
  });
}

export function useRecommendedArtists(
  countryCode: string,
  options?: { enabled?: boolean; limit?: number }
) {
  return useQuery({
    queryKey: ["recommendedArtists", countryCode, options?.limit],
    queryFn: async () => {
      const response = (await graphQLRequest(print(FETCH_RECOMMENDED_ARTISTS), {
        fetchRecommendedArtistsInput: {
          countryCode,
          limit: options?.limit || 10,
        },
      })) as any;
      if (!response?.fetchRecommendedArtists?.artists)
        throw new Error("Invalid response from server");
      return response.fetchRecommendedArtists.artists;
    },
    enabled: !!countryCode && (options?.enabled ?? true),
    retry: false,
    retryOnMount: false,
    // Don't refetch when window regains focus
    refetchOnWindowFocus: false,
    // Don't refetch on reconnect
    refetchOnReconnect: false,
  });
}
