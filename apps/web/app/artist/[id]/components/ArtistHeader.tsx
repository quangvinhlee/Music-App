"use client";

import { Artist } from "@/types/music";
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
    <div className="relative w-full h-72 sm:h-80 md:h-96 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Blurred Background Image */}
      {artist.avatarUrl && (
        <div className="absolute inset-0 z-0">
          <Image
            src={artist.avatarUrl}
            alt="Background"
            fill
            className="object-cover w-full h-full blur-lg brightness-50 scale-110"
            priority
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
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
        <div className="text-white space-y-2">
          <p className="uppercase text-xs tracking-widest text-gray-300">
            Artist
          </p>
          <div className="flex items-center gap-2">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-white">
              {artist.username}
            </h1>
            {artist.verified && (
              <Verified size={32} className="text-blue-400" />
            )}
          </div>
          {artist.city && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <MapPin size={16} />
              <span>
                {artist.city}
                {artist.countryCode && `, ${artist.countryCode}`}
              </span>
            </div>
          )}
          {typeof artist.followersCount === "number" && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <User size={16} />
              <span>{artist.followersCount.toLocaleString()} followers</span>
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFollowToggle}
              className={`px-6 py-3 rounded-full flex items-center gap-2 text-lg font-medium shadow-2xl transition-all duration-300
                ${
                  isFollowing
                    ? "bg-gray-700 hover:bg-gray-800 text-white"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white animate-pulse"
                }
              `}
            >
              {isFollowing ? <UserCheck size={28} /> : <UserPlus size={28} />}
              {isFollowing ? "Following" : "Follow"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-full flex items-center gap-2 text-lg font-medium shadow-lg"
            >
              <Share2 size={28} />
              Share
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
