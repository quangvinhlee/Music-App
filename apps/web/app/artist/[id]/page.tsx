"use client";

import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { Artist } from "@/types/music";
import Image from "next/image";
import { Verified } from "lucide-react";

export default function ArtistPage() {
  const params = useParams();
  const artistId = params.id as string;

  // Get artist from Redux store
  const { artist } = useSelector((state: RootState) => state.artist);

  // Use artist from store or create placeholder
  const currentArtist = artist || {
    id: artistId,
    username: "Artist not found",
    avatarUrl: "/music-plate.jpg",
    verified: false,
  };

  if (!artistId) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold text-gray-800">
              Artist not found
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f2] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Artist Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Image
                src={currentArtist.avatarUrl || "/music-plate.jpg"}
                alt={currentArtist.username}
                width={120}
                height={120}
                className="rounded-full object-cover"
              />
              {currentArtist.verified && (
                <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-1">
                  <Verified size={16} className="text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-800">
                  {currentArtist.username}
                </h1>
                {currentArtist.verified && (
                  <Verified size={20} className="text-blue-500" />
                )}
              </div>
              {currentArtist.city && (
                <p className="text-gray-600 mb-1">
                  {currentArtist.city}
                  {currentArtist.countryCode &&
                    `, ${currentArtist.countryCode}`}
                </p>
              )}
              {typeof currentArtist.followersCount === "number" && (
                <p className="text-gray-500 text-sm">
                  {currentArtist.followersCount.toLocaleString()} followers
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
                Follow
              </button>
              <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors">
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Artist Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Artist Information
          </h2>
          <div className="space-y-4">
            <div>
              <strong>ID:</strong> {currentArtist.id}
            </div>
            <div>
              <strong>Username:</strong> {currentArtist.username}
            </div>
            <div>
              <strong>Verified:</strong> {currentArtist.verified ? "Yes" : "No"}
            </div>
            {currentArtist.city && (
              <div>
                <strong>Location:</strong> {currentArtist.city}
                {currentArtist.countryCode && `, ${currentArtist.countryCode}`}
              </div>
            )}
            {typeof currentArtist.followersCount === "number" && (
              <div>
                <strong>Followers:</strong>{" "}
                {currentArtist.followersCount.toLocaleString()}
              </div>
            )}
            <div>
              <strong>Avatar URL:</strong>{" "}
              {currentArtist.avatarUrl || "Default image"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
