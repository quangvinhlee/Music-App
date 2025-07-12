"use client";

import { MusicItem } from "@/types/music";
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
} from "lucide-react";
import { formatDuration, getReleaseDate } from "@/utils/formatters";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useMusicPlayer } from "app/provider/MusicContext";
import InfiniteScroll from "react-infinite-scroll-component";
import { Skeleton } from "@/components/ui/skeleton";
import { ArtistTooltip } from "@/components/ArtistTooltip";
import { useRouter } from "next/navigation";
import PlayPauseButton from "@/components/PlayPauseButton";
import AddToPlaylistDialog from "@/components/AddToPlaylistDialog";
import { useCurrentUser } from "app/query/useUserQueries";
import { useMutation } from "@apollo/client";
import { DELETE_TRACK, LIKE_TRACK, UNLIKE_TRACK } from "app/mutations/interact";
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
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TrackUploadForm from "app/me/components/TrackUploadForm";

interface TrackListProps {
  tracks: MusicItem[];
  artistId: string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
}

export default function TrackList({
  tracks,
  artistId,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
}: TrackListProps) {
  const { playFromPlaylist, currentSong, isPlaying } = useMusicPlayer();
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [animatingHearts, setAnimatingHearts] = useState<Set<string>>(
    new Set()
  );
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [editingTrack, setEditingTrack] = useState<MusicItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Mutations
  const [deleteTrack] = useMutation(DELETE_TRACK, {
    refetchQueries: ["getCurrentUser"],
    onCompleted: () => {
      toast.success("Track deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete track: ${error.message}`);
    },
  });

  const [likeTrack] = useMutation(LIKE_TRACK, {
    onCompleted: () => {
      toast.success("Track added to favorites");
    },
    onError: (error) => {
      toast.error(`Failed to like track: ${error.message}`);
    },
  });

  const [unlikeTrack] = useMutation(UNLIKE_TRACK, {
    onCompleted: () => {
      toast.success("Track removed from favorites");
    },
    onError: (error) => {
      toast.error(`Failed to unlike track: ${error.message}`);
    },
  });

  const handleArtistClick = (artist: any) => {
    router.push(`/artist/${artist.id}`);
  };

  // Auto-fetch logic is now handled at the query level with useArtistDataWithAutoFetch

  const handleLike = async (songId: string) => {
    try {
      if (likedIds.has(songId)) {
        await unlikeTrack({ variables: { trackId: songId } });
        setLikedIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(songId);
          return newSet;
        });
      } else {
        await likeTrack({ variables: { trackId: songId } });
        setLikedIds((prev) => new Set(prev).add(songId));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }

    setAnimatingHearts((prev) => new Set(prev).add(songId));
    setTimeout(() => {
      setAnimatingHearts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(songId);
        return newSet;
      });
    }, 300);
  };

  const handlePlaySong = (song: MusicItem, index: number) => {
    // Use a more specific playlist ID format for artist tabs
    const playlistId = `artist-${artistId}-tracks`;
    playFromPlaylist(song, playlistId, index, tracks);
  };

  const handleDeleteTrack = async (trackId: string) => {
    try {
      await deleteTrack({ variables: { trackId } });
    } catch (error) {
      console.error("Error deleting track:", error);
    }
  };

  const handleEditTrack = (track: MusicItem) => {
    setEditingTrack(track);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingTrack(null);
    toast.success("Track updated successfully");
  };

  const isOwnTrack = (track: MusicItem) => {
    return currentUser?.id === track.artist.id;
  };

  // Loading skeleton for infinite scroll
  const LoadingSkeleton = () => (
    <div className="space-y-3 mt-4">
      {[...Array(1)].map((_, i) => (
        <div
          key={`skeleton-${i}`}
          className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-700/50 bg-gradient-to-r from-gray-800 to-gray-700 animate-pulse"
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Skeleton className="w-16 h-16 rounded-lg bg-gray-600" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48 bg-gray-600" />
              <Skeleton className="h-3 w-32 bg-gray-600" />
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Skeleton className="h-4 w-12 bg-gray-600" />
            <Skeleton className="w-8 h-8 rounded-full bg-gray-600" />
          </div>
        </div>
      ))}
    </div>
  );

  // End message when no more songs
  const EndMessage = () => (
    <div className="flex flex-col items-center justify-center py-4 px-4">
      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mb-2">
        <Music size={16} className="text-gray-400" />
      </div>
      <p className="text-sm text-gray-400 text-center max-w-xs">
        You've reached the end of all available tracks from this artist.
      </p>
    </div>
  );

  return (
    <>
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
        <div className="space-y-3 pb-4 flex-1">
          {tracks.map((track: MusicItem, index: number) => {
            const isCurrentSong = currentSong?.id === track.id;
            const isOwn = isOwnTrack(track);

            return (
              <div
                key={track.id}
                className={`group flex items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-200 ease-in-out cursor-pointer ${
                  openDropdownId === track.id
                    ? "from-gray-700 to-gray-600 shadow-2xl border-purple-500/50 bg-gradient-to-r"
                    : "from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 hover:shadow-2xl hover:border-purple-500/50 bg-gradient-to-r border-gray-700/50"
                }`}
                onClick={() => handlePlaySong(track, index)}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="relative group w-16 h-16 flex-shrink-0">
                    <Image
                      src={track.artwork}
                      alt={track.title}
                      width={64}
                      height={64}
                      className="rounded-lg object-cover shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 rounded-lg">
                      <PlayPauseButton
                        track={track}
                        index={index}
                        onPlaySong={handlePlaySong}
                        size={24}
                        className="text-white"
                        showOnHover={true}
                        alwaysShowWhenPlaying={false}
                      />
                    </div>
                    {/* Always show pause button when current song is playing */}
                    {isCurrentSong && isPlaying && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
                        <PlayPauseButton
                          track={track}
                          index={index}
                          onPlaySong={handlePlaySong}
                          size={24}
                          className="text-white"
                          showOnHover={false}
                          alwaysShowWhenPlaying={true}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate text-white group-hover:text-purple-400 transition-colors">
                      {track.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {track.artist && (
                        <div className="flex items-center gap-1">
                          <ArtistTooltip artist={track.artist}>
                            <p
                              className="text-sm text-gray-300 truncate hover:text-purple-400 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArtistClick(track.artist);
                              }}
                            >
                              {track.artist.username}
                            </p>
                          </ArtistTooltip>
                          {track.artist.verified && (
                            <Verified size={14} className="text-blue-400" />
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
                          <PlaySquare size={12} />
                          <span className="text-xs">
                            {track.playbackCount.toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-gray-400">
                        <Calendar size={12} />
                        <span className="text-xs">
                          {getReleaseDate(track.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1 text-gray-400">
                    <Clock size={14} />
                    <span className="text-sm font-mono">
                      {formatDuration(track.duration)}
                    </span>
                  </div>
                  <PlayPauseButton
                    track={track}
                    index={index}
                    onPlaySong={handlePlaySong}
                    size={20}
                    className="text-gray-400 hover:text-purple-400 p-2 rounded-full hover:bg-purple-500/20"
                    showOnHover={true}
                    alwaysShowWhenPlaying={true}
                  />
                  <button
                    className={`p-2 rounded-full hover:bg-pink-500/20 transition-all duration-200 cursor-pointer ${
                      animatingHearts.has(track.id) ? "scale-125" : "scale-100"
                    } ${likedIds.has(track.id) ? "text-pink-500" : "text-gray-400 hover:text-pink-500"}`}
                    title="Like"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(track.id);
                    }}
                  >
                    {likedIds.has(track.id) ? (
                      <HeartIcon size={18} className="fill-current" />
                    ) : (
                      <Heart size={18} />
                    )}
                  </button>
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
                        <MoreHorizontal size={18} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 bg-gray-800 border-gray-700"
                    >
                      <DropdownMenuItem
                        className="cursor-pointer text-gray-300 hover:text-white hover:bg-purple-600/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(track.id);
                        }}
                      >
                        <Heart size={16} className="mr-2" />
                        {likedIds.has(track.id)
                          ? "Remove from Favorites"
                          : "Add to Favorites"}
                      </DropdownMenuItem>
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
                                <AlertDialogTitle className="text-white">
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

          {/* Auto-fetch is now handled at the query level */}
        </div>
      </InfiniteScroll>

      {/* Edit Track Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Track</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update your track information and artwork.
            </DialogDescription>
          </DialogHeader>
          {editingTrack && (
            <TrackUploadForm
              onSuccess={handleEditSuccess}
              onCancel={() => setIsEditDialogOpen(false)}
              editingTrack={editingTrack}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
