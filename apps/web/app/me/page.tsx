"use client";

import { useState } from "react";
import { useCurrentUser } from "app/query/useUserQueries";
import { usePlaylists } from "app/query/useInteractQueries";
import PlaylistGrid from "./components/PlaylistGrid";
import ListenHistory from "./components/ListenHistory";
import TrackList from "@/components/TrackList";
import TrackUploadForm from "./components/TrackUploadForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ProfileHeader from "./components/ProfileHeader";
import CreatePlaylistForm from "@/components/CreatePlaylistForm";
import {
  User,
  Music,
  ListMusic,
  Heart,
  Users,
  UserPlus,
  Plus,
  Settings,
  Edit,
  Play,
  Clock,
  MoreVertical,
  History,
} from "lucide-react";
import { Playlist } from "@/types/playlist";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TabType =
  | "tracks"
  | "playlists"
  | "listen-history"
  | "likes"
  | "following"
  | "followers";

export default function MePage() {
  const { data: user, isLoading } = useCurrentUser();
  const { data: playlists = [], isLoading: playlistsLoading } =
    usePlaylists(user);
  const [activeTab, setActiveTab] = useState<TabType>("tracks");
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isUploadTrackOpen, setIsUploadTrackOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-white">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const handleCreatePlaylistSuccess = (playlistId: string) => {
    setIsCreatePlaylistOpen(false);
    // The playlist will be automatically refetched by the query
  };

  const handleUploadTrackSuccess = () => {
    setIsUploadTrackOpen(false);
    // The tracks will be automatically refetched by the query
  };

  const tabs = [
    {
      id: "tracks" as TabType,
      label: "Tracks",
      icon: Music,
      description: "Your uploaded tracks",
    },
    {
      id: "playlists" as TabType,
      label: "Playlists",
      icon: ListMusic,
      description: "Your created playlists",
    },
    {
      id: "listen-history" as TabType,
      label: "Listen History",
      icon: History,
      description: "Your recently played tracks",
    },
    {
      id: "likes" as TabType,
      label: "Likes",
      icon: Heart,
      description: "Songs you've liked",
    },
    {
      id: "following" as TabType,
      label: "Following",
      icon: UserPlus,
      description: "Artists you follow",
    },
    {
      id: "followers" as TabType,
      label: "Followers",
      icon: Users,
      description: "Your followers",
    },
  ];

  const renderCreateButton = (tabType: TabType) => {
    const buttonText = {
      tracks: "Upload Track",
      playlists: "Create Playlist",
      "listen-history": "Discover Music",
      likes: "Discover Music",
      following: "Find Artists",
      followers: "Share Profile",
    };

    const buttonIcon = {
      tracks: Music,
      playlists: ListMusic,
      "listen-history": History,
      likes: Heart,
      following: UserPlus,
      followers: Users,
    };

    if (tabType === "followers") return null;

    const Icon = buttonIcon[tabType];
    const text = buttonText[tabType];

    if (tabType === "playlists") {
      return (
        <Dialog
          open={isCreatePlaylistOpen}
          onOpenChange={setIsCreatePlaylistOpen}
        >
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              <Plus size={16} className="mr-2" />
              {text}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                Create New Playlist
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a new playlist to organize your favorite music.
              </DialogDescription>
            </DialogHeader>
            <CreatePlaylistForm onSuccess={handleCreatePlaylistSuccess} />
          </DialogContent>
        </Dialog>
      );
    }

    if (tabType === "tracks") {
      return (
        <Dialog open={isUploadTrackOpen} onOpenChange={setIsUploadTrackOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              <Plus size={16} className="mr-2" />
              {text}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Upload New Track</DialogTitle>
              <DialogDescription className="text-gray-400">
                Share your music with the world. Upload audio files and add
                artwork.
              </DialogDescription>
            </DialogHeader>
            <TrackUploadForm
              onSuccess={handleUploadTrackSuccess}
              onCancel={() => setIsUploadTrackOpen(false)}
            />
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
        <Plus size={16} className="mr-2" />
        {text}
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <ProfileHeader user={user} />

      <div className="container mx-auto p-6">
        <div className="max-w-6xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-gray-800 to-gray-700 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Tracks</p>
                    <p className="text-2xl font-bold text-white">
                      {user.tracks?.length || 0}
                    </p>
                  </div>
                  <Music className="text-purple-400" size={24} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800 to-gray-700 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Playlists</p>
                    <p className="text-2xl font-bold text-white">
                      {playlists.length}
                    </p>
                  </div>
                  <ListMusic className="text-pink-400" size={24} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800 to-gray-700 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Following</p>
                    <p className="text-2xl font-bold text-white">89</p>
                  </div>
                  <UserPlus className="text-green-400" size={24} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800 to-gray-700 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Followers</p>
                    <p className="text-2xl font-bold text-white">1.2k</p>
                  </div>
                  <Users className="text-blue-400" size={24} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-6">
              <div className="grid w-full grid-cols-6 bg-gray-800/50 border border-gray-700/50 rounded-md p-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                        isActive
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Icon size={16} className="mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Contents */}
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              if (!isActive) return null;

              return (
                <div key={tab.id} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Icon size={24} className="text-purple-400" />
                        {tab.label}
                      </h2>
                      <p className="text-gray-400 mt-1">{tab.description}</p>
                    </div>
                    {renderCreateButton(tab.id)}
                  </div>

                  {/* Content based on tab */}

                  {tab.id === "tracks" && (
                    <div>
                      {user.tracks && user.tracks.length > 0 ? (
                        <TrackList tracks={user.tracks} artistId={user.id} />
                      ) : (
                        <div className="text-center py-12">
                          <Music
                            size={48}
                            className="text-gray-500 mx-auto mb-4"
                          />
                          <h3 className="text-xl font-semibold text-white mb-2">
                            No tracks yet
                          </h3>
                          <p className="text-gray-400 mb-6">
                            Start sharing your music with the world!
                          </p>
                          <Button
                            onClick={() => setIsUploadTrackOpen(true)}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                          >
                            <Plus size={16} className="mr-2" />
                            Upload Your First Track
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {tab.id === "playlists" && (
                    <div>
                      {playlistsLoading ? (
                        <div className="text-center py-12">
                          <p className="text-white">Loading playlists...</p>
                        </div>
                      ) : (
                        <PlaylistGrid
                          playlists={playlists}
                          onCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
                          user={user}
                        />
                      )}
                    </div>
                  )}

                  {tab.id === "listen-history" && (
                    <div>
                      {user.recentPlayed && user.recentPlayed.length > 0 ? (
                        <ListenHistory recentPlayed={user.recentPlayed} />
                      ) : (
                        <div className="text-center py-12">
                          <History
                            size={48}
                            className="text-gray-500 mx-auto mb-4"
                          />
                          <h3 className="text-xl font-semibold text-white mb-2">
                            No listening history yet
                          </h3>
                          <p className="text-gray-400 mb-6">
                            Start listening to music to see your history here!
                          </p>
                          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                            <Plus size={16} className="mr-2" />
                            Discover Music
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {tab.id === "likes" && (
                    <div className="text-center py-12">
                      <Heart size={48} className="text-gray-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        No liked songs yet
                      </h3>
                      <p className="text-gray-400 mb-6">
                        Start discovering and liking music!
                      </p>
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                        <Plus size={16} className="mr-2" />
                        Discover Music
                      </Button>
                    </div>
                  )}

                  {tab.id === "following" && (
                    <div className="text-center py-12">
                      <UserPlus
                        size={48}
                        className="text-gray-500 mx-auto mb-4"
                      />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Not following anyone yet
                      </h3>
                      <p className="text-gray-400 mb-6">
                        Follow your favorite artists to stay updated!
                      </p>
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                        <Plus size={16} className="mr-2" />
                        Find Artists
                      </Button>
                    </div>
                  )}

                  {tab.id === "followers" && (
                    <div className="text-center py-12">
                      <Users size={48} className="text-gray-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        No followers yet
                      </h3>
                      <p className="text-gray-400 mb-6">
                        Share your profile to get followers!
                      </p>
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                        <Plus size={16} className="mr-2" />
                        Share Profile
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
