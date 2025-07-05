"use client";

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

  return (
    <div className="text-center py-12">
      <div className="text-gray-500 mb-4">
        <p className="text-lg font-medium">{getMessage()}</p>
        <p className="text-sm mt-2">
          {tabType === "playlists"
            ? "Check back later for new playlists!"
            : "Check back later for new content!"}
        </p>
      </div>
    </div>
  );
}
