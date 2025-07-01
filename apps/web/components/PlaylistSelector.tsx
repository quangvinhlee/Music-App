"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Playlist } from "@/types/music";

interface PlaylistSelectorProps {
  playlists: Playlist[];
  currentPlaylistId: string;
  onPlaylistSelect: (playlist: Playlist) => void;
}

export default function PlaylistSelector({
  playlists,
  currentPlaylistId,
  onPlaylistSelect,
}: PlaylistSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
      >
        <span className="text-sm font-medium">Browse Playlists</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
        >
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              Available Playlists
            </h3>
            <div className="space-y-2">
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => {
                    onPlaylistSelect(playlist);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                    playlist.id === currentPlaylistId
                      ? "bg-blue-50 border border-blue-200"
                      : ""
                  }`}
                >
                  <Image
                    src={playlist.artwork}
                    alt={playlist.title}
                    width={40}
                    height={40}
                    className="rounded-md object-cover"
                  />
                  <div className="text-left">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {playlist.title}
                    </p>
                    <p className="text-xs text-gray-500">{playlist.genre}</p>
                  </div>
                  {playlist.id === currentPlaylistId && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
