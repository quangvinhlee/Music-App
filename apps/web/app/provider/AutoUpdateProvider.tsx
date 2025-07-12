"use client";

import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useAutoUpdatePlaylistQueue } from "../query/useSoundcloudQueries";
import { usePlaylists } from "../query/useInteractQueries";
import { useCurrentUser } from "../query/useUserQueries";
import { useMusicPlayer } from "./MusicContext";
import { Playlist } from "app/types/playlist";

export function AutoUpdateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user } = useCurrentUser();
  const { data: playlists = [] } = usePlaylists(user);
  const { queueType, currentPlaylistId } = useSelector(
    (state: RootState) => state.song
  );
  const { appendSongsToQueue } = useMusicPlayer();

  // Find the currently playing playlist
  const currentlyPlayingPlaylist = playlists.find(
    (playlist: Playlist) => playlist.id === currentPlaylistId
  );

  // Apply auto-update to the currently playing playlist (hook handles the conditional logic)
  useAutoUpdatePlaylistQueue(
    currentlyPlayingPlaylist || null,
    currentPlaylistId || "",
    queueType,
    currentPlaylistId,
    appendSongsToQueue
  );

  return <>{children}</>;
}
