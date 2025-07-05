import { Artist } from "@/types/music";
import { Verified, MapPin, Users } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface ArtistTooltipProps {
  artist: Artist;
  children: React.ReactNode;
}

export function ArtistTooltip({ artist, children }: ArtistTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseEnter = (e: React.MouseEvent) => {
    setShowTooltip(true);
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const tooltipContent =
    showTooltip && mounted ? (
      <div
        className="fixed z-[9999] max-w-xs p-3 bg-gray-900 text-white border-0 rounded-lg shadow-lg pointer-events-none"
        style={{
          left: mousePosition.x + 10,
          top: mousePosition.y - 10,
          transform: "translateY(-100%)",
        }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <img
              src={artist.avatarUrl || "/music-plate.jpg"}
              alt={artist.username}
              className="w-12 h-12 rounded-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm truncate">
                {artist.username}
              </span>
              {artist.verified && (
                <Verified size={14} className="text-blue-500" />
              )}
            </div>

            {artist.followersCount !== undefined && (
              <div className="flex items-center gap-1 text-gray-300 text-xs mb-1">
                <Users size={12} />
                <span>{artist.followersCount.toLocaleString()} followers</span>
              </div>
            )}

            {artist.city && (
              <div className="flex items-center gap-1 text-gray-300 text-xs">
                <MapPin size={12} />
                <span>
                  {artist.city}
                  {artist.countryCode && `, ${artist.countryCode}`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {mounted && tooltipContent && createPortal(tooltipContent, document.body)}
    </>
  );
}
