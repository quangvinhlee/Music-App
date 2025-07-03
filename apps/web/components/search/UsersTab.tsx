"use client";

import Image from "next/image";
import { User, Verified } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useImageErrors } from "app/hooks/useImageErrors";

interface SearchUser {
  id: string;
  username: string;
  avatarUrl: string;
  verified: boolean;
  city?: string;
  countryCode?: string;
  followersCount?: number;
}

interface UsersTabProps {
  users: SearchUser[];
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
  const { handleImageError, hasImageError } = useImageErrors();

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

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
      loader={
        <div className="text-center py-6">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user: SearchUser) => (
          <div
            key={user.id}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all text-center"
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
            <h3 className="font-semibold text-gray-900 mb-1 flex items-center justify-center gap-1">
              {user.username}
              {user.verified && (
                <span title="Verified Artist">
                  <Verified size={16} className="text-blue-500 fill-blue-500" />
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
          </div>
        ))}
      </div>
      {!hasNextPage && !isFetchingNextPage && users.length > 0 && (
        <div className="text-center py-6 text-gray-500">
          <p>No more users to load</p>
        </div>
      )}
    </InfiniteScroll>
  );
}
