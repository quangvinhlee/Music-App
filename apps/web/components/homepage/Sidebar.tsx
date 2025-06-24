import React, { useState } from "react";
import Image from "next/image";
import { Heart, HeartIcon, Play, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface RecentPlayedSong {
  id: string;
  trackId: string;
  title: string;
  artist: string;
  artwork: string;
  duration: number;
  playedAt: string;
  userId: string;
}

function formatDuration(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function Sidebar({
  recentPlayed = [],
  isAuthenticated = false,
}: {
  recentPlayed?: RecentPlayedSong[];
  isAuthenticated?: boolean;
}) {
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [animatingHearts, setAnimatingHearts] = useState<Set<string>>(
    new Set()
  );

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
          <div className="border-l-4 border-orange-500 pl-3">
            <h3 className="font-semibold text-gray-700 mb-1">
              Recommended Artists
            </h3>
            <p className="text-gray-500">
              Discover new artists based on your taste
            </p>
          </div>
          <div className="border-l-4 border-orange-500 pl-3">
            <h3 className="font-semibold text-gray-700 mb-1">
              Recent Activity
            </h3>
            <p className="text-gray-500">See what your friends are playing</p>
          </div>
          <div className="border-l-4 border-orange-500 pl-3 mb-2">
            <h3 className="font-semibold text-gray-700 mb-1">
              Popular This Week
            </h3>
            <p className="text-gray-500">Top tracks trending in your region</p>
          </div>
          {/* Listen History right after Popular This Week */}
          {isAuthenticated && recentPlayed.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-700 mb-0">
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
                    className="flex items-center gap-3 p-2 rounded border-b border-gray-200 hover:bg-gray-100 transition group"
                  >
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <Image
                        src={song.artwork || "/music-plate.jpg"}
                        alt={song.title}
                        width={48}
                        height={48}
                        className="rounded object-cover w-12 h-12"
                      />
                      {/* Blur overlay and play button on hover */}
                      <div className="absolute inset-0 rounded transition-all duration-200 group-hover:backdrop-blur-[2px] group-hover:bg-black/30 flex items-center justify-center">
                        <button
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Play"
                        >
                          <Play size={20} className="text-white" />
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">
                        {song.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {song.artist}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDuration(song.duration)}
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
