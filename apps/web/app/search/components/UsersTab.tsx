"use client";

import Image from "next/image";
import { User, Verified, Loader2 } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useImageErrors } from "app/hooks/useImageErrors";
import { useRouter } from "next/navigation";
import { Artist } from "@/types/music";
import { motion } from "framer-motion";

interface UsersTabProps {
  users: Artist[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export function UsersTab({
  users,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: UsersTabProps) {
  const router = useRouter();
  const { handleImageError, hasImageError } = useImageErrors();

  const handleArtistClick = (artist: any) => {
    router.push(`/artist/${artist.id}`);
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  // Spinning loading component for infinite scroll
  const SpinningLoader = () => (
    <div className="flex justify-center items-center py-8">
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading more users...</span>
      </div>
    </div>
  );

  // End message when no more users
  const EndMessage = () => (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
        <User size={16} className="text-gray-400" />
      </div>
      <p className="text-sm text-gray-600 text-center max-w-xs">
        You've reached the end of all available users.
      </p>
    </div>
  );

  if (!users.length) {
    return (
      <div className="col-span-full text-center py-20">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          No users found
        </h3>
        <p className="text-gray-500">Try searching with different keywords</p>
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
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all text-center cursor-pointer"
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
            <h3 className="font-semibold text-gray-900 mb-1 flex items-center justify-center gap-1 hover:text-blue-600">
              {user.username}
              {user.verified && (
                <span title="Verified Artist">
                  <Verified size={16} className="text-blue-500" />
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-600">
              {user.verified ? "✓ Verified" : "Artist"}
              {user.city && ` • ${user.city}`}
            </p>
            {typeof user.followersCount === "number" && (
              <div className="text-xs text-gray-400 mt-1">
                {user.followersCount.toLocaleString()} followers
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </InfiniteScroll>
  );
}
