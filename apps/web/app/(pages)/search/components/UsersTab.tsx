"use client";

import Image from "next/image";
import { User, Verified, Loader2 } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useImageErrors } from "app/hooks/useImageErrors";
import { useRouter } from "next/navigation";
import { Artist } from "app/types/music";
import { motion } from "framer-motion";

interface UsersTabProps {
  users: Artist[];
  hasNextPage: boolean;
  fetchNextPage: () => void;
}

export function UsersTab({ users, hasNextPage, fetchNextPage }: UsersTabProps) {
  const router = useRouter();
  const { handleImageError, hasImageError } = useImageErrors();

  const handleArtistClick = (artist: any) => {
    router.push(`/artist/${artist.id}`);
  };

  // Spinning loading component for infinite scroll
  const SpinningLoader = () => (
    <div className="flex justify-center items-center py-8">
      <div className="flex items-center gap-2 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading more users...</span>
      </div>
    </div>
  );

  // End message when no more users
  const EndMessage = () => (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mb-2">
        <User size={16} className="text-gray-400" />
      </div>
      <p className="text-sm text-gray-400 text-center max-w-xs">
        You've reached the end of all available users.
      </p>
    </div>
  );

  if (!users.length) {
    return (
      <div className="col-span-full text-center py-20">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-6" />
        <h3 className="text-lg font-medium text-white mb-3">No users found</h3>
        <p className="text-gray-400">Try searching with different keywords</p>
      </div>
    );
  }

  return (
    <InfiniteScroll
      dataLength={users.length}
      next={fetchNextPage}
      hasMore={hasNextPage}
      loader={<SpinningLoader />}
      endMessage={<EndMessage />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user: Artist) => (
          <motion.div
            key={user.id}
            className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-700/50 rounded-xl p-6 hover:shadow-2xl hover:border-purple-500/50 transition-all duration-300 text-center cursor-pointer"
            onClick={() => handleArtistClick(user)}
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative w-20 h-20 mx-auto mb-4">
              <Image
                src={
                  hasImageError(`user-${user.id}`) || !user.avatarUrl
                    ? "/user-placeholder.jpg"
                    : user.avatarUrl
                }
                alt={user.username}
                width={80}
                height={80}
                priority
                className="w-full h-full object-cover rounded-full"
                onError={() => handleImageError(`user-${user.id}`)}
              />
            </div>
            <h3 className="font-semibold text-white mb-2 flex items-center justify-center gap-1 hover:text-purple-400 transition-colors">
              {user.username}
              {user.verified && (
                <span title="Verified Artist">
                  <Verified size={16} className="text-blue-400" />
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-300">
              {user.verified ? "✓ Verified" : "Artist"}
              {user.city && ` • ${user.city}`}
            </p>
            {typeof user.followersCount === "number" && (
              <div className="text-xs text-gray-400 mt-2">
                {user.followersCount.toLocaleString()} followers
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </InfiniteScroll>
  );
}
