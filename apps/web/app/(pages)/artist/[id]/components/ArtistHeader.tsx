"use client";

import { Artist } from "app/types/music";
import Image from "next/image";
import {
  Verified,
  UserPlus,
  UserCheck,
  Share2,
  User,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface ArtistHeaderProps {
  artist: Artist;
}

export default function ArtistHeader({ artist }: ArtistHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <div className="relative w-full h-72 sm:h-80 md:h-96 overflow-hidden">
      {/* Hybrid Dark Background */}
      {artist.avatarUrl ? (
        <div className="absolute inset-0 z-0">
          <Image
            src={artist.avatarUrl}
            alt="Background"
            fill
            className="object-cover w-full h-full blur-xl brightness-40 scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
          <div className="absolute inset-0 bg-gray-900/20" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
      )}

      {/* Foreground Content */}
      <div className="relative z-10 p-6 sm:p-10 md:p-14 h-full flex items-end gap-6">
        <div className="w-40 h-40 sm:w-52 sm:h-52 shadow-2xl rounded-xl overflow-hidden border-4 border-gray-800 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900">
          <Image
            src={artist.avatarUrl || "/music-plate.jpg"}
            alt={artist.username}
            width={208}
            height={208}
            className="object-cover w-full h-full"
          />
        </div>

        <div className="text-white space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full border border-purple-500/30">
              Artist
            </span>
            {artist.verified && (
              <Verified size={20} className="text-blue-400" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-white">
              {artist.username}
            </h1>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-300">
            {artist.city && (
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                <span>
                  {artist.city}
                  {artist.countryCode && `, ${artist.countryCode}`}
                </span>
              </div>
            )}
            {typeof artist.followersCount === "number" && (
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                <span>{artist.followersCount.toLocaleString()} followers</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFollowToggle}
              className={`px-8 py-3 rounded-full flex items-center gap-2 text-lg font-medium shadow-2xl transition-all duration-300 ${
                isFollowing
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border border-green-400/30"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border border-purple-400/30 animate-pulse"
              }`}
            >
              {isFollowing ? <UserCheck size={20} /> : <UserPlus size={20} />}
              {isFollowing ? "Following" : "Follow"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-800/70 hover:bg-gray-700 text-white px-6 py-3 rounded-full flex items-center gap-2 text-lg font-medium shadow-2xl border border-gray-600 transition-all duration-300"
            >
              <Share2 size={20} />
              Share
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
