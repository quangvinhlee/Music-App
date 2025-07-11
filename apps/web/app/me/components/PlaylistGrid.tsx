"use client";

import { Playlist } from "@/types/playlist";
import { MusicItem } from "@/types/music";
import Image from "next/image";
import {
  Play,
  Music,
  Clock,
  Calendar,
  Heart,
  HeartIcon,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getReleaseDate } from "@/utils/formatters";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import TracksTooltip from "@/components/TracksTooltip";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useMusicPlayer } from "app/provider/MusicContext";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "app/store/store";
import { setSelectedPlaylist } from "app/store/song";
import { ArtistTooltip } from "@/components/ArtistTooltip";
import { User } from "@/types/user";

interface PlaylistGridProps {
  playlists: Playlist[];
  onCreatePlaylist?: () => void;
  user?: User;
}

export default function PlaylistGrid({
  playlists,
  onCreatePlaylist,
  user,
}: PlaylistGridProps) {
  const router = useRouter();
  const dispatch = useDispatch();

  // Like state for playlists
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [animatingHearts, setAnimatingHearts] = useState<Set<string>>(
    new Set()
  );

  const { playFromPlaylist } = useMusicPlayer();

  const handleLike = (playlistId: string) => {
    setLikedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(playlistId)) {
        newSet.delete(playlistId);
      } else {
        newSet.add(playlistId);
      }
      return newSet;
    });
    setAnimatingHearts((prev) => new Set(prev).add(playlistId));
    setTimeout(() => {
      setAnimatingHearts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(playlistId);
        return newSet;
      });
    }, 300);
  };

  // Handle play playlist (image or play button click)
  const handlePlayPlaylist = (playlist: Playlist) => {
    // Playlists have tracks property with the list of songs
    if (playlist.tracks && playlist.tracks.length > 0) {
      const firstTrack = playlist.tracks[0];
      if (firstTrack && firstTrack.title && firstTrack.artist) {
        // Convert PlaylistTrack to MusicItem format using trackId as the id
        const musicItem: MusicItem = {
          id: firstTrack.trackId, // Use trackId as the actual track ID
          title: firstTrack.title,
          artist: firstTrack.artist,
          genre: firstTrack.genre || "",
          artwork: firstTrack.artwork || "",
          duration: firstTrack.duration || 0,
          streamUrl: "", // Playlist tracks don't have streamUrl
        };

        // Convert all tracks to MusicItem format for the playlist
        const musicItems: MusicItem[] = playlist.tracks
          .filter((track) => track.title && track.artist)
          .map((track) => ({
            id: track.trackId, // Use trackId as the actual track ID
            title: track.title!,
            artist: track.artist!,
            genre: track.genre || "",
            artwork: track.artwork || "",
            duration: track.duration || 0,
            streamUrl: "",
          }));

        playFromPlaylist(musicItem, playlist.id, 0, musicItems);
      }
    }
  };

  // Handle title click - navigate to playlist page
  const handleTitleClick = (playlist: Playlist) => {
    dispatch(setSelectedPlaylist(playlist));
    router.push(`/collection/playlist/${playlist.id}`);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const handleArtistClick = (artist: any) => {
    router.push(`/artist/${artist.id}`);
  };

  // Get playlist artwork from first track
  const getPlaylistArtwork = (playlist: Playlist) => {
    if (playlist.tracks && playlist.tracks.length > 0) {
      const firstTrack = playlist.tracks[0];
      return firstTrack?.artwork || "/default-playlist.jpg";
    }
    return "/default-playlist.jpg";
  };

  // Calculate total duration of playlist
  const getPlaylistDuration = (playlist: Playlist) => {
    if (!playlist.tracks) return 0;
    return playlist.tracks.reduce(
      (total, track) => total + (track.duration || 0),
      0
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Playlists Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playlists.map((playlist: Playlist) => (
            <div
              key={playlist.id}
              className="group bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-gray-700/50 hover:border-purple-500/50"
            >
              <div className="relative">
                <Image
                  src={getPlaylistArtwork(playlist)}
                  alt={playlist.name}
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover group-hover:brightness-110 transition-all duration-300 cursor-pointer"
                  onClick={() => handlePlayPlaylist(playlist)}
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl transition-all duration-200 group-hover:backdrop-blur-[2px] group-hover:bg-black/40 pointer-events-none">
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity mb-1 cursor-pointer transition-transform duration-200 hover:scale-110 pointer-events-auto"
                    title="Play"
                    onClick={() => handlePlayPlaylist(playlist)}
                  >
                    <Play size={32} className="text-white" />
                  </button>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className={`p-1 cursor-pointer rounded-full hover:bg-pink-500/20 transition-transform duration-300 ${
                        animatingHearts.has(playlist.id)
                          ? "scale-125"
                          : "scale-100"
                      } transition-transform duration-200 hover:scale-110 pointer-events-auto`}
                      title="Like"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(playlist.id);
                      }}
                    >
                      {likedIds.has(playlist.id) ? (
                        <HeartIcon
                          size={18}
                          className="text-pink-500 fill-pink-500"
                        />
                      ) : (
                        <Heart size={18} className="text-pink-500" />
                      )}
                    </button>
                  </div>
                </div>
                {/* Duration badge - always visible */}
                {getPlaylistDuration(playlist) > 0 && (
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Clock size={12} />
                    {formatDuration(getPlaylistDuration(playlist))}
                  </div>
                )}
                {/* More button on the right side */}
                <div className="absolute bottom-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 cursor-pointer rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-colors transition-transform duration-200 hover:scale-110">
                        <MoreHorizontal size={16} className="text-white" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-gray-800 border-gray-700"
                    >
                      <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-purple-600/20">
                        Add song to playlist
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-purple-600/20">
                        Edit playlist
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-red-600/20">
                        Delete playlist
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-semibold text-lg truncate text-white group-hover:text-purple-400 transition-colors cursor-pointer"
                      onClick={() => handleTitleClick(playlist)}
                    >
                      {playlist.name}
                    </h3>
                    <p className="text-sm text-gray-300 mt-1 truncate">
                      {user?.username}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  {playlist.genre && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full font-medium border border-purple-500/30">
                      {playlist.genre}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="flex items-center gap-1 hover:text-purple-400 transition-colors cursor-pointer underline underline-offset-4 decoration-dotted decoration-purple-400/60 group">
                        <Music
                          size={14}
                          className="text-gray-400 group-hover:text-purple-400 transition-colors"
                        />
                        <span className="text-xs text-gray-400 font-medium group-hover:text-purple-400 transition-colors">
                          {playlist.tracks?.length || 0} tracks
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="px-3 py-2 rounded-lg bg-gray-900 text-gray-100 text-xs shadow-xl border border-gray-700"
                      sideOffset={5}
                    >
                      <div className="mb-1 font-semibold">View tracks</div>
                      <div className="mb-1 text-gray-400">
                        Hover to preview playlist tracks
                      </div>
                      <TracksTooltip
                        playlist={{
                          id: playlist.id,
                          title: playlist.name,
                          artist: {
                            id: user?.id || "",
                            username: user?.username || "",
                            avatarUrl: user?.avatar || "",
                            verified: false,
                          },
                          artwork: getPlaylistArtwork(playlist),
                          duration: getPlaylistDuration(playlist),
                          genre: playlist.genre || "",
                          tracks:
                            playlist.tracks?.map((track) => ({
                              id: track.trackId,
                              title: track.title || "",
                              artist: track.artist || {
                                id: "",
                                username: "",
                                avatarUrl: "",
                                verified: false,
                              },
                              artwork: track.artwork || "",
                              duration: track.duration || 0,
                              genre: track.genre || "",
                            })) || [],
                        }}
                        showDeleteButton={true}
                        onDeleteTrack={(trackId) => {
                          // TODO: Implement delete track functionality
                          console.log("Delete track:", trackId);
                        }}
                      />
                    </TooltipContent>
                  </Tooltip>
                  <div className="flex items-center gap-1">
                    <Calendar size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {getReleaseDate(playlist.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {playlists.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Music size={48} className="mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No playlists yet
              </h3>
              <p className="text-gray-400">
                Create your first playlist to organize your favorite music.
              </p>
            </div>
            {onCreatePlaylist && (
              <button
                onClick={onCreatePlaylist}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-all duration-200"
              >
                <Plus size={16} />
                Create Your First Playlist
              </button>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
