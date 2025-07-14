"use client";

import { Music, Heart, Repeat, ListMusic } from "lucide-react";

interface EmptyStateProps {
  tabType: "tracks" | "playlists" | "likes" | "reposts";
  artistName: string;
}

export default function EmptyState({ tabType, artistName }: EmptyStateProps) {
  const getMessage = () => {
    switch (tabType) {
      case "tracks":
        return `${artistName} hasn't uploaded any tracks yet.`;
      case "likes":
        return `${artistName} hasn't liked any tracks yet.`;
      case "reposts":
        return `${artistName} hasn't reposted any tracks yet.`;
      case "playlists":
        return `${artistName} hasn't created any playlists yet.`;
      default:
        return `${artistName} hasn't added any content yet.`;
    }
  };

  const getIcon = () => {
    switch (tabType) {
      case "tracks":
        return Music;
      case "likes":
        return Heart;
      case "reposts":
        return Repeat;
      case "playlists":
        return ListMusic;
      default:
        return Music;
    }
  };

  const getSubMessage = () => {
    switch (tabType) {
      case "tracks":
        return "Check back later for new tracks!";
      case "likes":
        return "Check back later for new likes!";
      case "reposts":
        return "Check back later for new reposts!";
      case "playlists":
        return "Check back later for new playlists!";
      default:
        return "Check back later for new content!";
    }
  };

  const Icon = getIcon();

  return (
    <div className="text-center py-12">
      <Icon size={48} className="text-gray-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">
        No {tabType} yet
      </h3>
      <p className="text-gray-400 mb-6">{getMessage()}</p>
      <p className="text-sm text-gray-500">{getSubMessage()}</p>
    </div>
  );
}
