"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { createPortal } from "react-dom";
import {
  usePlaylists,
  useAddTrackToPlaylist,
} from "app/query/useInteractQueries";
import { useCurrentUser } from "app/query/useUserQueries";
import { MusicItem } from "app/types/music";
import { CreatePlaylistTrackInput } from "app/types/playlist";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ListMusic, Music, Clock, Plus } from "lucide-react";
import CreatePlaylistForm from "./CreatePlaylistForm";
import { toast } from "sonner";

// Context for managing dialog state
interface AddToPlaylistContextType {
  isOpen: boolean;
  currentSong: MusicItem | null;
  openDialog: (song: MusicItem) => void;
  closeDialog: () => void;
}

const AddToPlaylistContext = createContext<AddToPlaylistContextType | null>(
  null
);

// Provider component
export function AddToPlaylistProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSong, setCurrentSong] = useState<MusicItem | null>(null);

  const openDialog = (song: MusicItem) => {
    setCurrentSong(song);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setCurrentSong(null);
  };

  return (
    <AddToPlaylistContext.Provider
      value={{ isOpen, currentSong, openDialog, closeDialog }}
    >
      {children}
    </AddToPlaylistContext.Provider>
  );
}

// Hook to use the context
export const useAddToPlaylistDialog = () => {
  const context = useContext(AddToPlaylistContext);
  if (!context) {
    throw new Error(
      "useAddToPlaylistDialog must be used within AddToPlaylistProvider"
    );
  }
  return context;
};

// Single dialog component that renders at the top level
export function GlobalAddToPlaylistDialog() {
  const { isOpen, currentSong, closeDialog } = useAddToPlaylistDialog();
  const { data: user } = useCurrentUser();
  const { data: playlists = [], isLoading: playlistsLoading } =
    usePlaylists(user);
  const addTrackToPlaylist = useAddTrackToPlaylist(user);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    null
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedPlaylistId(null);
      setShowCreateForm(false);
      setIsAdding(false);
    }
  }, [isOpen]);

  // Show toast notification using sonner
  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!user || !currentSong) return;

    setIsAdding(true);
    try {
      const trackInput: CreatePlaylistTrackInput = {
        trackId: currentSong.id,
        title: currentSong.title,
        artistId: currentSong.artist.id,
        artwork: currentSong.artwork,
        duration: Math.round(currentSong.duration),
        genre: currentSong.genre,
      };

      await addTrackToPlaylist.mutateAsync({
        playlistId,
        input: trackInput,
      });

      closeDialog();
      showToast("Track added to playlist!", "success");
    } catch (error: any) {
      console.error("Failed to add track to playlist:", error);
      let errorMsg = "Failed to add track to playlist.";
      if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      showToast(errorMsg, "error");
    } finally {
      setIsAdding(false);
    }
  };

  const handleCreatePlaylistSuccess = async (playlistId: string) => {
    if (!currentSong) return;

    // Add the song to the newly created playlist
    const trackInput: CreatePlaylistTrackInput = {
      trackId: currentSong.id,
      title: currentSong.title,
      artistId: currentSong.artist.id,
      artwork: currentSong.artwork,
      duration: Math.round(currentSong.duration),
      genre: currentSong.genre,
    };

    try {
      await addTrackToPlaylist.mutateAsync({
        playlistId,
        input: trackInput,
      });

      setShowCreateForm(false);
      closeDialog();
      showToast("Track added to playlist!", "success");
    } catch (error: any) {
      console.error("Failed to add track to playlist:", error);
      let errorMsg = "Failed to add track to playlist.";
      if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      showToast(errorMsg, "error");
    }
  };

  if (!isOpen || !currentSong) return null;

  return createPortal(
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Add to Playlist</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose a playlist to add "{currentSong.title}" to
          </DialogDescription>
        </DialogHeader>

        {!showCreateForm ? (
          <div className="space-y-4">
            {playlistsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading playlists...</p>
              </div>
            ) : playlists.length === 0 ? (
              <div className="text-center py-8">
                <ListMusic size={48} className="text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  No playlists yet
                </h3>
                <p className="text-gray-400 mb-6">
                  Create your first playlist to organize your music!
                </p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  Create Playlist
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {playlists.map((playlist: any) => (
                  <div
                    key={playlist.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedPlaylistId === playlist.id
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-gray-700 hover:border-purple-500/50 hover:bg-gray-700/50"
                    }`}
                    onClick={() => setSelectedPlaylistId(playlist.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-600 rounded-lg flex items-center justify-center">
                          <ListMusic size={20} className="text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white truncate">
                            {playlist.name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Music size={12} />
                              {playlist.tracks.length} tracks
                            </span>
                            {playlist.genre && (
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {playlist.genre}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          playlist.isPublic
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {playlist.isPublic ? "Public" : "Private"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <CreatePlaylistForm
            onSuccess={handleCreatePlaylistSuccess}
            onCancel={() => setShowCreateForm(false)}
            showCancelButton={true}
          />
        )}

        <DialogFooter>
          {!showCreateForm && (
            <>
              <Button
                variant="outline"
                onClick={closeDialog}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>

              {playlists.length > 0 && (
                <Button
                  onClick={() =>
                    selectedPlaylistId &&
                    handleAddToPlaylist(selectedPlaylistId)
                  }
                  disabled={!selectedPlaylistId || isAdding}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {isAdding ? "Adding..." : "Add to Playlist"}
                </Button>
              )}

              {playlists.length > 0 && (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  variant="outline"
                  className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
                >
                  New Playlist
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>,
    document.body
  );
}

// Legacy component for backward compatibility
interface AddToPlaylistDialogProps {
  song: MusicItem;
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export default function AddToPlaylistDialog({
  song,
  trigger,
  onSuccess,
}: AddToPlaylistDialogProps) {
  const { openDialog } = useAddToPlaylistDialog();

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        openDialog(song);
      }}
    >
      {trigger}
    </div>
  );
}
