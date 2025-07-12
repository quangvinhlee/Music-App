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
  FETCH_ARTIST_DATA,
  FETCH_ARTIST_INFO,
} from "app/mutations/soundcloud";
import {
  FetchGlobalTrendingSongsResponse,
  FetchTrendingPlaylistSongsResponse,
  FetchArtistInfoResponse,
  Playlist,
  TrendingIdData,
  FetchRelatedSongsResponse,
  SearchTracksResponse,
  SearchUsersResponse,
  SearchAlbumsResponse,
  StreamUrlResponse,
} from "@/types/music";
import { MusicItem } from "@/types/music";
import { useState, useEffect } from "react";

export function useTrendingIdByCountry(countryCode: string) {
  return useQuery<TrendingIdData | undefined>({
    queryKey: ["trendingId", countryCode],
    queryFn: async () => {
      const response = (await graphQLRequest(print(FETCH_TRENDING_SONG), {
        fetchTrendingSongInput: { CountryCode: countryCode },
      })) as { fetchTrendingSong?: TrendingIdData };
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
  return useQuery<Playlist[]>({
    queryKey: ["trendingSongPlaylists", id],
    queryFn: async () => {
      const response = (await graphQLRequest(
        print(FETCH_TRENDING_SONG_PLAYLISTS),
        {
          fetchTrendingSongPlaylistsInput: { id },
        }
      )) as { fetchTrendingSongPlaylists?: Playlist[] };
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
      )) as { fetchTrendingPlaylistSongs?: FetchTrendingPlaylistSongsResponse };
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
      )) as { fetchGlobalTrendingSongs?: FetchGlobalTrendingSongsResponse };
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
      })) as { fetchRelatedSongs?: FetchRelatedSongsResponse };
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
      )) as { searchTracks?: SearchTracksResponse };
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
      )) as { searchUsers?: SearchUsersResponse };
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
      )) as { searchAlbums?: SearchAlbumsResponse };
      if (!response?.searchAlbums)
        throw new Error("Invalid response from server");
      return response.searchAlbums;
    },
    enabled: !!query && (options?.enabled ?? true),
    getNextPageParam: (lastPage: any) => lastPage?.nextHref || undefined,
    initialPageParam: null,
  });
}

export function useStreamUrl(
  trackId: string | null,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["streamUrl", trackId],
    queryFn: async () => {
      if (!trackId) throw new Error("No track ID provided");

      const response = (await graphQLRequest(print(FETCH_STREAM_URL), {
        fetchStreamUrlInput: { trackId },
      })) as { fetchStreamUrl?: StreamUrlResponse };

      if (!response?.fetchStreamUrl)
        throw new Error("Invalid response from server");

      return response.fetchStreamUrl;
    },
    enabled: !!trackId && (options?.enabled ?? true),
  });
}

export function useRecommendSongs(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["recommendSongs"],
    queryFn: async () => {
      try {
        const response = (await graphQLRequest(
          print(RECOMMEND_SONGS),
          {}
        )) as any;
        if (!response?.recommendSongs?.tracks)
          throw new Error("Invalid response from server");
        return response.recommendSongs.tracks;
      } catch (error) {
        console.error("Error fetching recommended songs:", error);
        // Return empty array instead of throwing
        return [];
      }
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
      try {
        const response = (await graphQLRequest(
          print(FETCH_RECOMMENDED_ARTISTS),
          {
            fetchRecommendedArtistsInput: {
              countryCode,
              limit: options?.limit || 10,
            },
          }
        )) as any;
        if (!response?.fetchRecommendedArtists?.artists)
          throw new Error("Invalid response from server");
        return response.fetchRecommendedArtists.artists;
      } catch (error) {
        console.error("Error fetching recommended artists:", error);
        // Return empty array instead of throwing
        return [];
      }
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
export function useArtistData(
  artistId: string,
  type: string,
  options?: { nextHref?: string; enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: ["artistData", artistId, type],
    queryFn: async ({ pageParam = null }) => {
      const variables = pageParam
        ? { fetchArtistDataInput: { artistId, type, nextHref: pageParam } }
        : { fetchArtistDataInput: { artistId, type } };
      const response = (await graphQLRequest(
        print(FETCH_ARTIST_DATA),
        variables
      )) as any;
      if (!response?.fetchArtistData)
        throw new Error("Invalid response from server");
      return response.fetchArtistData;
    },
    enabled: !!artistId && !!type && (options?.enabled ?? true),
    getNextPageParam: (lastPage: any) => {
      // Don't fetch next page if tracks array is empty, even if nextHref exists
      if (!lastPage?.tracks || lastPage.tracks.length === 0) {
        return undefined;
      }
      return lastPage?.nextHref || undefined;
    },
    initialPageParam: null,
  });
}

export function useArtistInfo(
  artistId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["artistInfo", artistId],
    queryFn: async () => {
      const response = (await graphQLRequest(print(FETCH_ARTIST_INFO), {
        fetchArtistInfoInput: { artistId },
      })) as { fetchArtistInfo: FetchArtistInfoResponse };
      if (!response?.fetchArtistInfo?.artist)
        throw new Error("Invalid response from server");
      return response.fetchArtistInfo.artist;
    },
    enabled: !!artistId && (options?.enabled ?? true),
  });
}

// Auto-fetch hook for artist data that preloads 4-5 pages
export function useArtistDataWithAutoFetch(
  artistId: string,
  type: string,
  options?: { enabled?: boolean; autoFetchPages?: number }
) {
  const autoFetchPages = options?.autoFetchPages ?? 4;

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useArtistData(artistId, type, {
    enabled: !!artistId && !!type && (options?.enabled ?? true),
  });

  // Auto-fetch multiple pages when data is first loaded
  const [hasAutoFetched, setHasAutoFetched] = useState(false);

  useEffect(() => {
    if (
      data?.pages?.length === 1 &&
      hasNextPage &&
      !hasAutoFetched &&
      !isFetchingNextPage &&
      data.pages[0]?.tracks?.length > 0
    ) {
      setHasAutoFetched(true);

      // Auto-fetch additional pages
      const autoFetch = async () => {
        for (let i = 0; i < autoFetchPages - 1; i++) {
          if (hasNextPage && !isFetchingNextPage) {
            await fetchNextPage();
            // Small delay to prevent overwhelming the server
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }
      };

      autoFetch();
    }
  }, [
    data?.pages?.length,
    hasNextPage,
    hasAutoFetched,
    isFetchingNextPage,
    fetchNextPage,
    autoFetchPages,
  ]);

  // Reset auto-fetch flag when type changes
  useEffect(() => {
    setHasAutoFetched(false);
  }, [type]);

  return {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
}

// Custom hook to automatically append new songs to queue when fetched
// This hook monitors the data from infinite queries and automatically appends
// new songs to the queue when they're fetched, without affecting the currently playing song
//
// Usage:
// const { data } = useArtistData(artistId, type);
// useAutoAppendToQueue(data, playlistId, appendSongsToQueue);
//
// This ensures that when users scroll and more songs are loaded,
// they're automatically added to the queue for seamless playback
export function useAutoAppendToQueue(
  data: any,
  playlistId: string,
  appendSongsToQueue: (songs: MusicItem[], playlistId?: string) => void
) {
  const [lastProcessedPage, setLastProcessedPage] = useState(0);

  useEffect(() => {
    if (!data?.pages || data.pages.length <= lastProcessedPage) {
      return;
    }

    // Process only new pages
    const newPages = data.pages.slice(lastProcessedPage);
    const newSongs: MusicItem[] = [];

    newPages.forEach((page: any) => {
      if (page.tracks && Array.isArray(page.tracks)) {
        newSongs.push(...page.tracks);
      }
    });

    if (newSongs.length > 0) {
      appendSongsToQueue(newSongs, playlistId);
      setLastProcessedPage(data.pages.length);
    }
  }, [data?.pages, lastProcessedPage, appendSongsToQueue, playlistId]);

  // Reset when playlistId changes
  useEffect(() => {
    setLastProcessedPage(0);
  }, [playlistId]);
}
