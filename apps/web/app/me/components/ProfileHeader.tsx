"use client";

import { User } from "@/types/user";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarColor, getInitials } from "@/utils";
import { motion } from "framer-motion";
import { Verified, Mail, Calendar, Shield, Camera } from "lucide-react";

interface ProfileHeaderProps {
  user: User;
  onAvatarClick?: () => void;
}

export default function ProfileHeader({
  user,
  onAvatarClick,
}: ProfileHeaderProps) {
  const avatarColor = getAvatarColor(user.username || "");
  const userInitials = getInitials(user.username || "");

  // Create a smooth gradient background from avatar color to white (left to right)
  const backgroundGradient = `linear-gradient(to right, ${avatarColor}90 0%, ${avatarColor}70 25%, ${avatarColor}50 50%, ${avatarColor}30 75%, ${avatarColor}10 90%, white 100%)`;

  return (
    <div className="relative w-full h-72 sm:h-80 md:h-96 overflow-hidden border-b-4 border-gray-300 shadow-lg">
      {/* Blurred Background Image */}
      {user.avatar ? (
        <div className="absolute inset-0 z-0">
          <Image
            src={user.avatar}
            alt="Background"
            fill
            className="object-cover w-full h-full blur-lg brightness-75 scale-110"
            priority
          />
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
        </div>
      ) : (
        /* Dynamic Background based on avatar color when no avatar image */
        <div
          className="absolute inset-0 z-0"
          style={{ background: backgroundGradient }}
        >
          <div className="absolute inset-0 bg-white/10" />
        </div>
      )}

      {/* Foreground Content */}
      <div className="relative z-10 p-6 sm:p-10 md:p-14 h-full flex items-end gap-6">
        <div
          className="w-40 h-40 sm:w-52 sm:h-52 shadow-xl rounded-full overflow-hidden border-4 border-white relative group cursor-pointer"
          onClick={onAvatarClick}
        >
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.username}
              width={208}
              height={208}
              className="object-cover w-full h-full group-hover:blur-[2px] transition-all duration-200"
            />
          ) : (
            <Avatar className="w-full h-full">
              <AvatarFallback
                className="text-6xl font-bold text-white group-hover:blur-[2px] transition-all duration-200"
                style={{ backgroundColor: avatarColor }}
              >
                {userInitials}
              </AvatarFallback>
            </Avatar>
          )}

          {/* Hover Overlay with Camera Icon */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg">
              <Camera size={32} className="text-gray-700" />
            </div>
          </div>
        </div>

        <div className="text-gray-900 space-y-2">
          <p className="uppercase text-xs tracking-widest text-gray-600">
            Profile
          </p>
          <div className="flex items-center gap-2">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              {user.username}
            </h1>
            {user.isVerified && (
              <Verified size={32} className="text-blue-500" />
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Mail size={16} />
            <span>{user.email}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Shield size={16} />
            <span className="capitalize">
              {user.role?.toLowerCase() || "User"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar size={16} />
            <span>{user.isOurUser ? "Internal User" : "External User"}</span>
          </div>

          <div className="flex gap-2 mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-full flex items-center gap-2 text-lg font-medium shadow-lg"
            >
              Edit Profile
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
