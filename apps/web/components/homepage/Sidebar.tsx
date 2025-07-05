import React, { useState } from "react";
import Image from "next/image";
import {
  Heart,
  HeartIcon,
  Play,
  MoreHorizontal,
  RefreshCw,
  Verified,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { RecentPlayedSong, Artist, MusicItem } from "@/types/music";
import { useRouter } from "next/navigation";
import { getReleaseDate, getPlayedDate } from "@/utils/formatters";
import { Calendar, Clock, PlaySquare, Users } from "lucide-react";
import { ArtistTooltip } from "@/components/ArtistTooltip";

function formatDuration(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function Sidebar({
  recentPlayed = [],
  isAuthenticated = false,
  recommendArtists = [],
  isLoadingRecommendArtists = false,
  recommendSongs = [],
  isLoadingRecommendSongs = false,
  onSongClick,
}: {
  recentPlayed?: RecentPlayedSong[];
  isAuthenticated?: boolean;
  recommendArtists?: Artist[];
  isLoadingRecommendArtists?: boolean;
  recommendSongs?: MusicItem[];
  isLoadingRecommendSongs?: boolean;
  onSongClick: (song: MusicItem) => void;
}) {
  const router = useRouter();
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [animatingHearts, setAnimatingHearts] = useState<Set<string>>(
    new Set()
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshSongsKey, setRefreshSongsKey] = useState(0);
  const [isRefreshingArtists, setIsRefreshingArtists] = useState(false);
  const [isRefreshingSongs, setIsRefreshingSongs] = useState(false);

  // State to hold the current random artists
  const [randomArtists, setRandomArtists] = React.useState<Artist[]>([]);
  // State to hold the current random songs
  const [randomSongs, setRandomSongs] = React.useState<MusicItem[]>([]);

  // Update random artists when recommendArtists or refreshKey changes
  React.useEffect(() => {
    console.log("useEffect recalculating", {
      recommendArtistsLength: recommendArtists.length,
      refreshKey,
    });

    if (recommendArtists.length === 0) {
      setRandomArtists([]);
      return;
    }

    // Create a random selection that changes with refreshKey
    const shuffled = [...recommendArtists];

    // Simple shuffle using sort with refreshKey influence
    shuffled.sort((a, b) => {
      const randomA = Math.random() + refreshKey * 0.001;
      const randomB = Math.random() + refreshKey * 0.001;
      return randomA - randomB;
    });

    const result = shuffled.slice(0, 3);
    console.log(
      "Selected artists:",
      result.map((a) => a.username)
    );
    setRandomArtists(result);
  }, [recommendArtists, refreshKey]);

  // Update random songs when recommendSongs or refreshSongsKey changes
  React.useEffect(() => {
    console.log("useEffect recalculating songs", {
      recommendSongsLength: recommendSongs.length,
      refreshSongsKey,
    });

    if (recommendSongs.length === 0) {
      setRandomSongs([]);
      return;
    }

    // Create a random selection that changes with refreshSongsKey
    const shuffled = [...recommendSongs];

    // Simple shuffle using sort with refreshSongsKey influence
    shuffled.sort((a, b) => {
      const randomA = Math.random() + refreshSongsKey * 0.001;
      const randomB = Math.random() + refreshSongsKey * 0.001;
      return randomA - randomB;
    });

    const result = shuffled.slice(0, 3);
    console.log(
      "Selected songs:",
      result.map((s) => s.title)
    );
    setRandomSongs(result);
  }, [recommendSongs, refreshSongsKey]);

  const handleRefreshArtists = () => {
    console.log("refreshKey before:", refreshKey);
    if (!isLoadingRecommendArtists) {
      setIsRefreshingArtists(true);
      setRefreshKey((prev) => {
        console.log("Setting refreshKey to:", prev + 1);
        return prev + 1;
      });
      // Stop spinning after 0.5 seconds (one rotation)
      setTimeout(() => setIsRefreshingArtists(false), 500);
    }
  };

  const handleRefreshSongs = () => {
    console.log("refreshSongsKey before:", refreshSongsKey);
    if (!isLoadingRecommendSongs) {
      setIsRefreshingSongs(true);
      setRefreshSongsKey((prev) => {
        console.log("Setting refreshSongsKey to:", prev + 1);
        return prev + 1;
      });
      // Stop spinning after 0.5 seconds (one rotation)
      setTimeout(() => setIsRefreshingSongs(false), 500);
    }
  };

  const handleSongClick = (song: MusicItem | RecentPlayedSong) => {
    // Convert song to MusicItem format and play it
    const musicItem: MusicItem = {
      id: "trackId" in song ? song.trackId : song.id,
      title: song.title,
      artist: song.artist,
      genre: "genre" in song ? song.genre : "",
      artwork: song.artwork,
      duration: song.duration,
      streamUrl: "streamUrl" in song ? song.streamUrl : "",
      playbackCount: "playbackCount" in song ? song.playbackCount : 0,
      trackCount: "trackCount" in song ? song.trackCount : 0,
      createdAt: "createdAt" in song ? song.createdAt : undefined,
    };
    onSongClick(musicItem);
  };

  const handleArtistClick = (artist: Artist) => {
    // Navigate to artist page
    router.push(`/artist/${artist.id}`);
  };

  const handleLike = (songId: string) => {
    setLikedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(songId)) {
        newSet.delete(songId);
        console.log("Unliked:", songId);
      } else {
        newSet.add(songId);
        console.log("Liked:", songId);
      }
      return newSet;
    });

    // Add animation
    setAnimatingHearts((prev) => new Set(prev).add(songId));
    setTimeout(() => {
      setAnimatingHearts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(songId);
        return newSet;
      });
    }, 300);
  };

  return (
    <aside className="bg-white p-4 rounded-md shadow-md h-full flex flex-col">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">For You</h2>
      <div className="space-y-4 text-sm flex-1 flex flex-col">
        {/* Top sections */}
        <div>
          {(randomArtists.length > 0 || isLoadingRecommendArtists) && (
            <div className="border-l-4 border-orange-500 pl-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-800 mb-0">
                  Recommended Artists
                </h3>
                <button
                  onClick={handleRefreshArtists}
                  disabled={isLoadingRecommendArtists}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh recommended artists"
                >
                  <RefreshCw
                    size={14}
                    className={
                      isRefreshingArtists
                        ? "animate-[spin_0.5s_ease-in-out]"
                        : ""
                    }
                  />
                  Refresh
                </button>
              </div>
              <div className="flex flex-col">
                {isLoadingRecommendArtists
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2 rounded border-b border-gray-200"
                      >
                        <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
                        <div className="flex-1 min-w-0">
                          <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse" />
                          <div className="h-3 bg-gray-100 rounded w-16 animate-pulse" />
                        </div>
                        <div className="ml-2 w-12 h-6 bg-gray-200 rounded-full animate-pulse" />
                      </div>
                    ))
                  : randomArtists.map((artist) => (
                      <div
                        key={artist.id}
                        className="flex items-center gap-3 p-2 rounded border-b border-gray-200 hover:bg-gray-100 transition group cursor-pointer"
                      >
                        <div className="relative w-12 h-12 flex-shrink-0">
                          <Image
                            src={artist.avatarUrl || "/music-plate.jpg"}
                            alt={artist.username}
                            width={48}
                            height={48}
                            className="rounded-full object-cover w-12 h-12"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <ArtistTooltip artist={artist}>
                              <div
                                className="font-medium text-gray-800 truncate cursor-pointer hover:text-blue-600"
                                onClick={() => handleArtistClick(artist)}
                              >
                                {artist.username}
                              </div>
                            </ArtistTooltip>
                            {artist.verified && (
                              <span title="Verified Artist">
                                <Verified size={14} className="text-blue-500" />
                              </span>
                            )}
                          </div>
                          {artist.city && (
                            <div className="text-xs text-gray-500 truncate">
                              {artist.city}
                              {artist.countryCode && `, ${artist.countryCode}`}
                            </div>
                          )}
                          {typeof artist.followersCount === "number" && (
                            <div className="flex items-center gap-1 text-xs text-gray-400 truncate">
                              <Users size={12} />
                              <span>
                                {artist.followersCount.toLocaleString()}{" "}
                                followers
                              </span>
                            </div>
                          )}
                        </div>
                        <button
                          className="ml-2 px-3 py-1 text-xs bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors cursor-pointer"
                          title="Follow"
                          onClick={() =>
                            console.log("Follow artist:", artist.username)
                          }
                        >
                          Follow
                        </button>
                      </div>
                    ))}
              </div>
            </div>
          )}

          {/* Pick for U */}
          {isAuthenticated &&
            (randomSongs.length > 0 || isLoadingRecommendSongs) && (
              <div className="border-l-4 border-purple-500 pl-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-gray-800 mb-0">
                    Pick for U
                  </h3>
                  <button
                    onClick={handleRefreshSongs}
                    disabled={isLoadingRecommendSongs}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Refresh recommended songs"
                  >
                    <RefreshCw
                      size={14}
                      className={
                        isRefreshingSongs
                          ? "animate-[spin_0.5s_ease-in-out]"
                          : ""
                      }
                    />
                    Refresh
                  </button>
                </div>
                <div className="flex flex-col">
                  {isLoadingRecommendSongs
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-2 rounded border-b border-gray-200"
                        >
                          <div className="w-14 h-14 rounded bg-gray-200 animate-pulse" />
                          <div className="flex-1 min-w-0">
                            <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse" />
                            <div className="h-3 bg-gray-100 rounded w-16 animate-pulse" />
                          </div>
                        </div>
                      ))
                    : randomSongs.map((song) => (
                        <div
                          key={song.id}
                          className="flex items-center gap-3 p-2 rounded border-b border-gray-200 hover:bg-gray-100 transition group cursor-pointer"
                          onClick={() => handleSongClick(song)}
                        >
                          <div className="relative w-14 h-14 flex-shrink-0 group">
                            <div
                              className="cursor-pointer"
                              onClick={() => handleSongClick(song)}
                            >
                              <Image
                                src={song.artwork || "/music-plate.jpg"}
                                alt={song.title}
                                width={56}
                                height={56}
                                className="rounded object-cover w-14 h-14"
                              />
                            </div>
                            {/* Blur overlay and play button on hover */}
                            <div className="absolute inset-0 rounded transition-all duration-200 group-hover:backdrop-blur-[2px] group-hover:bg-black/30 flex items-center justify-center pointer-events-none">
                              <button
                                className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"
                                title="Play"
                                onClick={() => handleSongClick(song)}
                              >
                                <Play size={20} className="text-white" />
                              </button>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-800 truncate">
                              {song.title}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <ArtistTooltip artist={song.artist}>
                                <div
                                  className="text-xs text-gray-500 truncate hover:text-blue-600 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleArtistClick(song.artist);
                                  }}
                                >
                                  {song.artist.username}
                                </div>
                              </ArtistTooltip>
                              {song.artist.verified && (
                                <span title="Verified Artist">
                                  <Verified
                                    size={14}
                                    className="text-blue-500"
                                  />
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1 text-gray-400">
                                <PlaySquare size={10} />
                                <span className="text-xs">
                                  {song.playbackCount?.toLocaleString() || "0"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-400">
                                <Clock size={10} />
                                <span className="text-xs">
                                  {formatDuration(song.duration)}
                                </span>
                              </div>
                              {song.createdAt && (
                                <div className="flex items-center gap-1 text-gray-400">
                                  <Calendar size={10} />
                                  <span className="text-xs">
                                    {getReleaseDate(song.createdAt)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            className={`ml-2 p-1 rounded-full hover:bg-pink-100 transition-transform duration-300 ${
                              animatingHearts.has(song.id)
                                ? "scale-125"
                                : "scale-100"
                            }`}
                            title="Like"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(song.id);
                            }}
                          >
                            {likedIds.has(song.id) ? (
                              <HeartIcon
                                size={18}
                                className="text-pink-500 fill-pink-500"
                              />
                            ) : (
                              <Heart size={18} className="text-pink-500" />
                            )}
                          </button>
                        </div>
                      ))}
                </div>
              </div>
            )}

          {/* Listen History */}
          {isAuthenticated && recentPlayed.length > 0 && (
            <div className="border-l-4 border-orange-500 pl-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-800 mb-0">
                  Listen History
                </h3>
                <a
                  href="/listen-history"
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  View All
                </a>
              </div>
              <div className="flex flex-col">
                {recentPlayed.slice(0, 3).map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center gap-3 p-2 rounded border-b border-gray-200 hover:bg-gray-100 transition group cursor-pointer"
                    onClick={() => handleSongClick(song)}
                  >
                    <div className="relative w-14 h-14 flex-shrink-0 group">
                      <div
                        className="cursor-pointer"
                        onClick={() => handleSongClick(song)}
                      >
                        <Image
                          src={song.artwork || "/music-plate.jpg"}
                          alt={song.title}
                          width={60}
                          height={60}
                          className="rounded object-cover w-14 h-14"
                        />
                      </div>
                      {/* Blur overlay and play button on hover */}
                      <div className="absolute inset-0 rounded transition-all duration-200 group-hover:backdrop-blur-[2px] group-hover:bg-black/30 flex items-center justify-center pointer-events-none">
                        <button
                          className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"
                          title="Play"
                          onClick={() => handleSongClick(song)}
                        >
                          <Play size={20} className="text-white" />
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">
                        {song.title}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <ArtistTooltip artist={song.artist}>
                          <div
                            className="text-xs text-gray-500 truncate hover:text-blue-600 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArtistClick(song.artist);
                            }}
                          >
                            {song.artist.username}
                          </div>
                        </ArtistTooltip>
                        {song.artist.verified && (
                          <span title="Verified Artist">
                            <Verified size={14} className="text-blue-500" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 text-gray-400">
                          <Clock size={10} />
                          <span className="text-xs">
                            {formatDuration(song.duration)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <Calendar size={10} />
                          <span className="text-xs">
                            {song.createdAt
                              ? getReleaseDate(song.createdAt)
                              : "Unknown"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      className={`ml-2 p-1 rounded-full hover:bg-pink-100 transition-transform duration-300 ${
                        animatingHearts.has(song.id) ? "scale-125" : "scale-100"
                      }`}
                      title="Like"
                      onClick={() => handleLike(song.id)}
                    >
                      {likedIds.has(song.id) ? (
                        <HeartIcon
                          size={18}
                          className="text-pink-500 fill-pink-500"
                        />
                      ) : (
                        <Heart size={18} className="text-pink-500" />
                      )}
                    </button>
                    {/* Dropdown menu using shadcn/ui */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="p-1 rounded-full hover:bg-gray-200"
                          title="More"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Share</DropdownMenuItem>
                        <DropdownMenuItem>Copy URL</DropdownMenuItem>
                        <DropdownMenuItem>Add to Playlist</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
