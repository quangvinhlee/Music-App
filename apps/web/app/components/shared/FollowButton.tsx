import {
  useFollowUser,
  useUnfollowUser,
  useIsFollowing,
} from "app/query/useFollowQueries";
import { Artist } from "app/types/music";
import { Button } from "../ui/button";
import { Loader2, UserPlus, UserCheck } from "lucide-react";

interface FollowButtonProps {
  artist: Artist;
  size?: "sm" | "md" | "lg";
  className?: string;
  mode?: "default" | "followback";
  isAuthenticated?: boolean;
}

export default function FollowButton({
  artist,
  size = "md",
  className = "",
  mode = "default",
  isAuthenticated = true,
}: FollowButtonProps) {
  const { data: isFollowing, isLoading: isFollowingLoading } = useIsFollowing(
    artist.id,
    isAuthenticated
  );
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const isMutating = followUser.isPending || unfollowUser.isPending;

  const handleClick = () => {
    if (isFollowing) {
      unfollowUser.mutate(artist.id);
    } else {
      followUser.mutate(artist.id);
    }
  };

  let buttonText = isFollowing
    ? "Following"
    : mode === "followback"
      ? "Follow Back"
      : "Follow";
  let buttonIcon = isFollowing ? (
    <UserCheck size={size === "sm" ? 14 : size === "lg" ? 24 : 20} />
  ) : (
    <UserPlus size={size === "sm" ? 14 : size === "lg" ? 24 : 20} />
  );

  // Color classes from original implementation
  const colorClass = isFollowing
    ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border border-green-400/30"
    : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border border-purple-400/30 animate-pulse";

  // Size classes (make 'sm' very compact for sidebar)
  const sizeClass =
    size === "sm"
      ? "px-2 py-0.5 text-xs min-w-[60px] h-7"
      : size === "lg"
        ? "px-8 py-3 text-lg min-w-[110px] h-12"
        : "px-6 py-2 text-base min-w-[90px] h-10";

  const disabled = isMutating || isFollowingLoading || !isAuthenticated;
  const tooltip = !isAuthenticated
    ? "Login to follow"
    : isFollowing
      ? "Unfollow"
      : buttonText;

  return (
    <Button
      className={`flex items-center gap-2 rounded-full font-medium shadow-2xl transition-all duration-300 cursor-pointer ${colorClass} ${sizeClass} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      style={{ minWidth: size === "sm" ? 60 : size === "lg" ? 110 : 90 }}
      title={tooltip}
    >
      {isMutating || isFollowingLoading ? (
        <Loader2
          className="animate-spin"
          size={size === "sm" ? 14 : size === "lg" ? 24 : 20}
        />
      ) : (
        buttonIcon
      )}
      <span>{buttonText}</span>
    </Button>
  );
}
