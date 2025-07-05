"use client";

import { Artist } from "@/types/music";
import Image from "next/image";
import { Verified, UserPlus, UserCheck, Share2 } from "lucide-react";
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
      {/* Blurred Background Image */}
      {artist.avatarUrl && (
        <div className="absolute inset-0 z-0">
          <Image
            src={artist.avatarUrl}
            alt="Background"
            fill
            className="object-cover w-full h-full blur-lg brightness-75 scale-110"
            priority
          />
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
        </div>
      )}
      {/* Foreground Content */}
      <div className="relative z-10 p-6 sm:p-10 md:p-14 h-full flex items-end gap-6">
        <div className="w-40 h-40 sm:w-52 sm:h-52 shadow-xl rounded-lg overflow-hidden border-2 border-gray-300">
          <Image
            src={artist.avatarUrl || "/music-plate.jpg"}
            alt={artist.username}
            width={208}
            height={208}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="text-gray-900 space-y-2">
          <p className="uppercase text-xs tracking-widest text-gray-600">
            Artist
          </p>
          <div className="flex items-center gap-2">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              {artist.username}
            </h1>
            {artist.verified && (
              <Verified size={32} className="text-blue-500" />
            )}
          </div>
          {artist.city && (
            <p className="text-sm text-gray-700">
              {artist.city}
              {artist.countryCode && `, ${artist.countryCode}`}
            </p>
          )}
          {typeof artist.followersCount === "number" && (
            <p className="text-sm text-gray-700">
              {artist.followersCount.toLocaleString()} followers
            </p>
          )}
          <div className="flex gap-2 mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFollowToggle}
              className={`${
                isFollowing
                  ? "bg-gray-600 hover:bg-gray-700"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white px-6 py-3 rounded-full flex items-center gap-2 text-lg font-medium shadow-lg`}
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
