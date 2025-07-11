"use client";

import { useState } from "react";
import { useCurrentUser } from "app/query/useUserQueries";
import { usePlaylists } from "app/query/useInteractQueries";
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
} from "lucide-react";
import { Playlist } from "@/types/playlist";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TabType =
  | "profile"
  | "tracks"
  | "playlists"
  | "likes"
  | "following"
  | "followers";

export default function MePage() {
  const { data: user, isLoading } = useCurrentUser();
  const { data: playlists = [], isLoading: playlistsLoading } =
    usePlaylists(user);
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
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

  const tabs = [
    {
      id: "profile" as TabType,
      label: "Profile",
      icon: User,
      description: "Manage your profile information",
    },
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
      likes: "Discover Music",
      following: "Find Artists",
      followers: "Share Profile",
    };

    const buttonIcon = {
      tracks: Music,
      playlists: ListMusic,
      likes: Heart,
      following: UserPlus,
      followers: Users,
    };

    if (tabType === "profile" || tabType === "followers") return null;

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
                    <p className="text-2xl font-bold text-white">24</p>
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
                    <p className="text-sm text-gray-400">Followers</p>
                    <p className="text-2xl font-bold text-white">1.2k</p>
                  </div>
                  <Users className="text-blue-400" size={24} />
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
                  {tab.id === "profile" && (
                    <Card className="bg-gradient-to-br from-gray-800 to-gray-700 border-gray-700/50">
                      <CardHeader>
                        <CardTitle className="text-white">
                          Profile Settings
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          Manage your profile information
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="border-t border-gray-700 pt-6">
                          <h4 className="text-md font-medium mb-4 text-white">
                            Account Details
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400">Username</p>
                              <p className="font-medium text-white">
                                {user.username}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400">Email</p>
                              <p className="font-medium text-white">
                                {user.email}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400">Role</p>
                              <p className="font-medium text-white capitalize">
                                {user.role?.toLowerCase()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400">Status</p>
                              <p className="font-medium text-white">
                                {user.isOurUser
                                  ? "Internal User"
                                  : "External User"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                            <Edit size={16} className="mr-2" />
                            Edit Profile
                          </Button>
                          <Button
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            <Settings size={16} className="mr-2" />
                            Settings
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {tab.id === "tracks" && (
                    <div className="text-center py-12">
                      <Music size={48} className="text-gray-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        No tracks yet
                      </h3>
                      <p className="text-gray-400 mb-6">
                        Start sharing your music with the world!
                      </p>
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                        <Plus size={16} className="mr-2" />
                        Upload Your First Track
                      </Button>
                    </div>
                  )}

                  {tab.id === "playlists" && (
                    <div>
                      {playlistsLoading ? (
                        <div className="text-center py-12">
                          <p className="text-white">Loading playlists...</p>
                        </div>
                      ) : playlists.length === 0 ? (
                        <div className="text-center py-12">
                          <ListMusic
                            size={48}
                            className="text-gray-500 mx-auto mb-4"
                          />
                          <h3 className="text-xl font-semibold text-white mb-2">
                            No playlists yet
                          </h3>
                          <p className="text-gray-400 mb-6">
                            Create your first playlist to organize your music!
                          </p>
                          <Dialog
                            open={isCreatePlaylistOpen}
                            onOpenChange={setIsCreatePlaylistOpen}
                          >
                            <DialogTrigger asChild>
                              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                                <Plus size={16} className="mr-2" />
                                Create Playlist
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-800 border-gray-700">
                              <DialogHeader>
                                <DialogTitle className="text-white">
                                  Create New Playlist
                                </DialogTitle>
                                <DialogDescription className="text-gray-400">
                                  Create a new playlist to organize your
                                  favorite music.
                                </DialogDescription>
                              </DialogHeader>
                              <CreatePlaylistForm
                                onSuccess={handleCreatePlaylistSuccess}
                              />
                            </DialogContent>
                          </Dialog>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {playlists.map((playlist: Playlist) => (
                            <div
                              key={playlist.id}
                              className={`group bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-gray-700/50 hover:border-purple-500/50 ${
                                openDropdownId === playlist.id
                                  ? "border-purple-500/50 shadow-2xl"
                                  : ""
                              }`}
                            >
                              <div className="relative">
                                {/* Placeholder image since we don't have artwork */}
                                <div className="w-full h-48 bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center group-hover:brightness-110 transition-all duration-300">
                                  <div className="text-center">
                                    <ListMusic
                                      size={48}
                                      className="text-gray-400 mx-auto mb-2"
                                    />
                                    <p className="text-gray-400 text-sm">
                                      {playlist.tracks.length} tracks
                                    </p>
                                  </div>
                                </div>
                                {/* Overlay on hover */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl transition-all duration-200 group-hover:backdrop-blur-[2px] group-hover:bg-black/40 pointer-events-none">
                                  <button
                                    className="opacity-0 group-hover:opacity-100 transition-opacity mb-1 cursor-pointer transition-transform duration-200 hover:scale-110 pointer-events-auto"
                                    title="Play"
                                  >
                                    <Play size={32} className="text-white" />
                                  </button>
                                </div>
                              </div>
                              <div className="p-4">
                                <div className="flex items-center justify-between mb-1">
                                  <h3 className="font-semibold text-white text-lg truncate group-hover:text-purple-400 transition-colors">
                                    {playlist.name}
                                  </h3>
                                  <DropdownMenu
                                    open={openDropdownId === playlist.id}
                                    onOpenChange={(open) => {
                                      setOpenDropdownId(
                                        open ? playlist.id : null
                                      );
                                    }}
                                  >
                                    <DropdownMenuTrigger asChild>
                                      <button
                                        className={`p-1 rounded-full hover:bg-gray-600/50 transition-colors ${
                                          openDropdownId === playlist.id
                                            ? "opacity-100"
                                            : "opacity-0 group-hover:opacity-100"
                                        }`}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <MoreVertical
                                          size={16}
                                          className="text-gray-400 hover:text-white"
                                        />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="bg-gray-800 border-gray-700"
                                    >
                                      <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-purple-600/20 cursor-pointer">
                                        <Plus size={16} className="mr-2" />
                                        Add songs to playlist
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-blue-600/20 cursor-pointer">
                                        <Edit size={16} className="mr-2" />
                                        Edit playlist
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-red-600/20 cursor-pointer">
                                        <Settings size={16} className="mr-2" />
                                        Delete playlist
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                {playlist.description && (
                                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                                    {playlist.description}
                                  </p>
                                )}
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Play size={12} />
                                    {playlist.tracks.length} tracks
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {playlist.genre || "No genre"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      playlist.isPublic
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-gray-500/20 text-gray-400"
                                    }`}
                                  >
                                    {playlist.isPublic ? "Public" : "Private"}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(
                                      playlist.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
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
