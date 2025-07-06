"use client";

import { MusicItem } from "@/types/music";
import Image from "next/image";
import { Music, Clock, PlaySquare, Verified } from "lucide-react";
import { ArtistTooltip } from "@/components/ArtistTooltip";
import { useRouter } from "next/navigation";
import { useMusicPlayer } from "app/provider/MusicContext";
import PlayPauseButton from "@/components/PlayPauseButton";

interface TracksTooltipProps {
  playlist: MusicItem;
}

export default function TracksTooltip({ playlist }: TracksTooltipProps) {
  const router = useRouter();
  const { playFromPlaylist, currentSong } = useMusicPlayer();

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const handleArtistClick = (artist: any) => {
    router.push(`/artist/${artist.id}`);
  };

  const handlePlaySong = (track: MusicItem, index: number) => {
    if (playlist.tracks && playlist.tracks.length > 0) {
      playFromPlaylist(track, playlist.id, index, playlist.tracks);
    }
  };

  return (
    <div className="relative max-w-lg bg-gray-900 rounded-xl shadow-2xl border border-gray-700 p-4">
      <div className="flex items-center gap-3 mb-3 pb-2 border-b border-gray-700">
        <div className="w-12 h-12 rounded overflow-hidden">
          <Image
            src={playlist.artwork}
            alt={playlist.title}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-white truncate">
            {playlist.title}
          </h4>
          <p className="text-xs text-gray-400 truncate mt-1">
            {playlist.artist.username}
          </p>
          {playlist.genre && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium mt-1 inline-block">
              {playlist.genre}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {playlist.tracks && playlist.tracks.length > 0 ? (
          playlist.tracks.map((track, index) => {
            const isCurrentSong = currentSong?.id === track.id;

            return (
              <div
                key={track.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors group cursor-pointer"
                onClick={() => handlePlaySong(track, index)}
              >
                <div className="flex-shrink-0 w-8 text-center text-sm text-gray-400 font-medium">
                  {index + 1}
                </div>
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image
                    src={track.artwork}
                    alt={track.title}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover rounded"
                  />
                  {/* Conditional overlays like QueuePopup */}
                  {isCurrentSong ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
                      <PlayPauseButton
                        track={track}
                        index={index}
                        onPlaySong={handlePlaySong}
                        size={16}
                        className="text-white"
                        showOnHover={false}
                        alwaysShowWhenPlaying={true}
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 rounded transition-all duration-200 opacity-0 group-hover:opacity-100 hover:bg-black/30 flex items-center justify-center">
                      <PlayPauseButton
                        track={track}
                        index={index}
                        onPlaySong={handlePlaySong}
                        size={16}
                        className="text-white"
                        showOnHover={true}
                        alwaysShowWhenPlaying={false}
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-medium text-white truncate">
                    {track.title}
                  </h5>
                  <div className="flex items-center gap-1">
                    <ArtistTooltip artist={track.artist}>
                      <p
                        className="text-xs text-gray-400 truncate hover:text-blue-400 cursor-pointer transition-colors"
                        onClick={() => handleArtistClick(track.artist)}
                      >
                        {track.artist.username}
                      </p>
                    </ArtistTooltip>
                    {track.artist.verified && (
                      <span title="Verified Artist">
                        <Verified size={12} className="text-blue-400" />
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{formatDuration(track.duration)}</span>
                  </div>
                  {track.playbackCount && (
                    <div className="flex items-center gap-1">
                      <PlaySquare size={12} />
                      <span className="hidden sm:inline">
                        {track.playbackCount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-4 text-gray-400">
            <Music size={24} className="mx-auto mb-2 text-gray-500" />
            <p className="text-xs">No tracks available</p>
          </div>
        )}
      </div>
    </div>
  );
}
