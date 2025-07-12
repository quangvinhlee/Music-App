"use client";

import { useState } from "react";
import { useCreatePlaylist } from "app/query/useInteractQueries";
import { useCurrentUser } from "app/query/useUserQueries";
import { CreatePlaylistInput } from "@/types/playlist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface CreatePlaylistFormProps {
  onSuccess?: (playlistId: string) => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
  className?: string;
}

export default function CreatePlaylistForm({
  onSuccess,
  onCancel,
  showCancelButton = true,
  className = "",
}: CreatePlaylistFormProps) {
  const { data: user } = useCurrentUser();
  const createPlaylist = useCreatePlaylist(user);

  const [formData, setFormData] = useState<CreatePlaylistInput>({
    name: "",
    description: "",
    isPublic: true,
    genre: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name) return;

    try {
      const newPlaylist = await createPlaylist.mutateAsync(formData);

      // Reset form
      setFormData({
        name: "",
        description: "",
        isPublic: true,
        genre: "",
      });

      toast.success("Playlist created successfully!");
      onSuccess?.(newPlaylist.id);
    } catch (error) {
      console.error("Failed to create playlist:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 p-4 ${className}`}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-white mb-2 block">
            Name *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="Enter playlist name"
            required
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-white mb-2 block">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="Enter playlist description"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="genre" className="text-white mb-2 block">
            Genre
          </Label>
          <Input
            id="genre"
            value={formData.genre}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                genre: e.target.value,
              }))
            }
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="Enter genre"
          />
        </div>

        <div className="flex items-center space-x-3 py-2">
          <Switch
            id="isPublic"
            checked={formData.isPublic}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({
                ...prev,
                isPublic: checked,
              }))
            }
          />
          <Label htmlFor="isPublic" className="text-white">
            Public playlist
          </Label>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-700">
        <Button
          type="submit"
          disabled={!formData.name || createPlaylist.isPending}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex-1"
        >
          {createPlaylist.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating...
            </>
          ) : (
            <>
              <Plus size={16} className="mr-2" />
              Create Playlist
            </>
          )}
        </Button>

        {showCancelButton && onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-gray-600 text-gray-300 hover:bg-gray-700 px-6"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
