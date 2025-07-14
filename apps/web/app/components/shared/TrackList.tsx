"use client";

import { MusicItem } from "app/types/music";
import Image from "next/image";
import {
  Heart,
  HeartIcon,
  MoreHorizontal,
  Clock,
  Calendar,
  Music,
  Verified,
  PlaySquare,
  Edit,
  Trash2,
  Play,
  Pause,
  Loader2,
} from "lucide-react";
import { formatDuration, getReleaseDate } from "app/utils/formatters";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "app/components/ui/dropdown-menu";
import { useState } from "react";
import { useMusicPlayer } from "app/provider/MusicContext";
import InfiniteScroll from "react-infinite-scroll-component";
import { Skeleton } from "app/components/ui/skeleton";
import { ArtistTooltip } from "app/components/shared/ArtistTooltip";
import { useRouter } from "next/navigation";
import AddToPlaylistDialog from "app/components/shared/AddToPlaylistDialog";
import { useCurrentUser } from "app/query/useUserQueries";
import {
  useDeleteTrack,
  useLikeTrack,
  useUnlikeTrack,
} from "app/query/useInteractQueries";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "app/components/ui/alert-dialog";
import { LikeButton } from "app/components/shared/LikeButton";

interface TrackListProps {
  tracks: MusicItem[];
  artistId: string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  onEditTrack?: (track: MusicItem) => void;
}

export default function TrackList({
  tracks,
  artistId,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
  onEditTrack,
}: TrackListProps) {
  const { playFromPlaylist, currentSong, isPlaying } = useMusicPlayer();
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mutations
  const deleteTrackMutation = useDeleteTrack(currentUser);

  const handleArtistClick = (artist: any) => {
    router.push(`/artist/${artist.id}`);
  };

  const handlePlaySong = (song: MusicItem, index: number) => {
    const playlistId = `artist-${artistId}-tracks`;
    playFromPlaylist(song, playlistId, index, tracks);
  };

  const handleDeleteTrack = async (trackId: string) => {
    try {
      setIsDeleting(true);
      console.log("Starting delete for track:", trackId);
      await deleteTrackMutation.mutateAsync(trackId);
      console.log("Delete successful for track:", trackId);
      toast.success("Track deleted successfully");
    } catch (error: any) {
      console.error("Error deleting track:", error);
      toast.error(
        `Failed to delete track: ${error?.message || "Unknown error"}`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditTrack = (track: MusicItem) => {
    if (onEditTrack) {
      onEditTrack(track);
    }
  };

  const isOwnTrack = (track: MusicItem) => {
    return currentUser?.id === track.artist.id;
  };

  // Loading skeleton for infinite scroll
  const LoadingSkeleton = () => (
    <div className="space-y-4 mt-6">
      {[...Array(3)].map((_, i) => (
        <div
          key={`skeleton-${i}`}
          className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-700/30 animate-pulse"
        >
          <Skeleton className="w-16 h-16 rounded-xl bg-gray-600/50" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-48 bg-gray-600/50" />
            <Skeleton className="h-4 w-32 bg-gray-600/50" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-12 bg-gray-600/50" />
            <Skeleton className="w-8 h-8 rounded-full bg-gray-600/50" />
          </div>
        </div>
      ))}
    </div>
  );

  // End message when no more songs
  const EndMessage = () => (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-4 border border-purple-500/30">
        <Music size={20} className="text-purple-400" />
      </div>
      <p className="text-sm text-gray-400 text-center max-w-xs">
        You've reached the end of all available tracks from this artist.
      </p>
    </div>
  );

  return (
    <InfiniteScroll
      dataLength={tracks.length}
      next={fetchNextPage || (() => {})}
      hasMore={hasNextPage}
      loader={<LoadingSkeleton />}
      endMessage={<EndMessage />}
      scrollThreshold={0.8}
      style={{ overflow: "visible" }}
      className="min-h-0 flex-1"
    >
      <div className="space-y-3 pb-6">
        {tracks.map((track: MusicItem, index: number) => {
          const isCurrentSong = currentSong?.id === track.id;
          const isOwn = isOwnTrack(track);

          return (
            <div
              key={track.id}
              className={`group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ease-out cursor-pointer ${
                isCurrentSong && isPlaying
                  ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/50 shadow-lg shadow-purple-500/20"
                  : openDropdownId === track.id
                    ? "bg-gradient-to-r from-gray-700/80 to-gray-600/80 border-gray-600/50 shadow-lg"
                    : "bg-gradient-to-r from-gray-800/50 to-gray-700/50 hover:from-gray-700/80 hover:to-gray-600/80 border-gray-700/30 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10"
              }`}
              onClick={() => handlePlaySong(track, index)}
            >
              {/* Track Number */}
              <div className="flex-shrink-0 w-8 text-center">
                <span className="text-sm font-mono text-gray-400 group-hover:text-purple-400 transition-colors">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Artwork */}
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src={track.artwork || "/music-plate.jpg"}
                  alt={track.title}
                  width={64}
                  height={64}
                  className="rounded-xl object-cover shadow-lg"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 rounded-xl">
                  {isCurrentSong && isPlaying ? (
                    <Pause size={20} className="text-white" />
                  ) : (
                    <Play size={20} className="text-white ml-1" />
                  )}
                </div>
                {/* Playing indicator */}
                {isCurrentSong && isPlaying && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-semibold truncate transition-colors ${
                    isCurrentSong && isPlaying
                      ? "text-purple-300"
                      : "text-white group-hover:text-purple-300"
                  }`}
                >
                  {track.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {track.artist && (
                    <div className="flex items-center gap-1">
                      <ArtistTooltip artist={track.artist}>
                        <p
                          className="text-sm text-gray-300 truncate hover:text-purple-400 cursor-pointer transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArtistClick(track.artist);
                          }}
                        >
                          {track.artist.username}
                        </p>
                      </ArtistTooltip>
                      {track.artist.verified && (
                        <Verified size={12} className="text-blue-400" />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  {track.genre && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full font-medium border border-purple-500/30">
                      {track.genre}
                    </span>
                  )}
                  {track.playbackCount && (
                    <div className="flex items-center gap-1 text-gray-400">
                      <PlaySquare size={10} />
                      <span className="text-xs">
                        {track.playbackCount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-gray-400">
                    <Calendar size={10} />
                    <span className="text-xs">
                      {getReleaseDate(track.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-1 text-gray-400 flex-shrink-0">
                <Clock size={12} />
                <span className="text-sm font-mono">
                  {formatDuration(track.duration)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <LikeButton trackId={track.id} size={18} />
                <DropdownMenu
                  onOpenChange={(open) =>
                    setOpenDropdownId(open ? track.id : null)
                  }
                >
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`p-2 rounded-full cursor-pointer transition-colors ${
                        openDropdownId === track.id
                          ? "bg-gray-600 text-white"
                          : "text-gray-400 hover:text-white hover:bg-gray-600"
                      }`}
                      title="Manage"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 bg-gray-800 border-gray-700"
                  >
                    {/* Like/Unlike handled by LikeButton above */}
                    <AddToPlaylistDialog
                      song={track}
                      trigger={
                        <DropdownMenuItem
                          className="cursor-pointer text-gray-300 hover:text-white hover:bg-purple-600/20"
                          onSelect={(e) => {
                            e.preventDefault();
                          }}
                        >
                          <MoreHorizontal size={16} className="mr-2" />
                          Add to Playlist
                        </DropdownMenuItem>
                      }
                    />
                    {isOwn && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer text-gray-300 hover:text-white hover:bg-purple-600/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTrack(track);
                          }}
                        >
                          <Edit size={16} className="mr-2" />
                          Edit Track
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="cursor-pointer text-red-300 hover:text-red-200 hover:bg-red-600/20"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 size={16} className="mr-2" />
                              Delete Track
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-gray-800 border-gray-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white flex items-center gap-2">
                                <Trash2 size={20} className="text-red-400" />
                                Delete Track
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-400">
                                Are you sure you want to delete &quot;
                                {track.title}
                                &quot;? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-gray-700 text-gray-300 hover:bg-gray-600">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 text-white hover:bg-red-700"
                                onClick={() => handleDeleteTrack(track.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full-screen loading overlay */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            <p className="text-white font-medium">Deleting track...</p>
            <p className="text-gray-400 text-sm">
              Please wait while we remove the track and its files.
            </p>
          </div>
        </div>
      )}
    </InfiniteScroll>
  );
}
