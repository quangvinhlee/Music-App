import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useStreamUrl } from "app/query/useSongQueries";
import { setStreamUrl, clearExpiredStreamUrls } from "app/store/song";
import type { RootState } from "app/store/store";

export function useStreamUrlManager(trackId: string | null) {
  const dispatch = useDispatch();
  const streamUrlCache = useSelector(
    (state: RootState) => state.song.streamUrlCache
  );

  // Fetch stream URL if needed
  const { data: streamUrl, isLoading } = useStreamUrl(trackId);

  // Update cache when stream URL is fetched
  useEffect(() => {
    if (streamUrl && trackId) {
      dispatch(setStreamUrl({ trackId, streamUrl }));
    }
  }, [streamUrl, trackId, dispatch]);

  // Clean up expired URLs periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      dispatch(clearExpiredStreamUrls());
    }, 60000); // Every minute

    return () => clearInterval(cleanupInterval);
  }, [dispatch]);

  // Get cached stream URL
  const getCachedStreamUrl = () => {
    if (!trackId) return null;

    const cached = streamUrlCache[trackId];
    if (cached && cached.expires > Date.now()) {
      return cached.url;
    }

    return null;
  };

  return {
    streamUrl: getCachedStreamUrl(),
    isLoading,
  };
}
