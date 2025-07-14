import { Heart, HeartIcon } from "lucide-react";
import {
  useLikeTrack,
  useUnlikeTrack,
  useIsTrackLiked,
} from "@/query/useInteractQueries";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useState } from "react";
import { toast } from "sonner";

interface LikeButtonProps {
  trackId: string;
  size?: number;
  className?: string;
}

export function LikeButton({
  trackId,
  size = 20,
  className = "",
}: LikeButtonProps) {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { data: isLiked, refetch } = useIsTrackLiked(user, trackId, {
    enabled: !!user && !!trackId,
  });
  const [optimisticLiked, setOptimisticLiked] = useState<boolean | undefined>(
    undefined
  );
  const [animating, setAnimating] = useState(false);

  const likeTrack = useLikeTrack(user);
  const unlikeTrack = useUnlikeTrack(user);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("You must be logged in to like a track");
      return;
    }
    // Optimistic UI update
    if (isLiked || optimisticLiked) {
      setOptimisticLiked(false);
      await unlikeTrack.mutateAsync(trackId, {
        onSettled: () => {
          setOptimisticLiked(undefined);
          refetch();
        },
      });
    } else {
      setOptimisticLiked(true);
      setAnimating(true);
      await likeTrack.mutateAsync(trackId, {
        onSettled: () => {
          setOptimisticLiked(undefined);
          setTimeout(() => setAnimating(false), 300);
          refetch();
        },
      });
    }
  };

  const liked = optimisticLiked !== undefined ? optimisticLiked : !!isLiked;

  return (
    <button
      className={`p-1 rounded-full hover:bg-pink-500/20 transition-transform duration-200 ${animating ? "scale-125" : "scale-100"} ${className}`}
      title={liked ? "Unlike" : "Like"}
      onClick={handleLike}
      aria-pressed={liked}
      aria-label={liked ? "Unlike this track" : "Like this track"}
      tabIndex={0}
    >
      {liked ? (
        <HeartIcon size={size} className="text-pink-500 fill-pink-500" />
      ) : (
        <Heart size={size} className="text-pink-500" />
      )}
    </button>
  );
}
