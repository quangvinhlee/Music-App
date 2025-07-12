"use client";

import { useState, useEffect } from "react";
import { useCreateTrack, useUpdateTrack } from "app/query/useInteractQueries";
import { useCurrentUser } from "app/query/useUserQueries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Music, Image, Loader2, Edit } from "lucide-react";
import {
  CreateTrackInput,
  TrackUploadFormData,
  MusicItem,
} from "app/types/music";

interface TrackFormProps {
  mode: "upload" | "edit";
  track?: MusicItem; // Only needed for edit mode
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TrackForm({
  mode,
  track,
  onSuccess,
  onCancel,
}: TrackFormProps) {
  const { data: user } = useCurrentUser();
  const createTrack = useCreateTrack(user);
  const updateTrack = useUpdateTrack(user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TrackUploadFormData>({
    title: "",
    description: "",
    genre: "",
    duration: 0,
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string>("");
  const [artworkPreview, setArtworkPreview] = useState<string>("");

  // Initialize form data for edit mode
  useEffect(() => {
    if (mode === "edit" && track) {
      const newFormData = {
        title: track.title || "",
        description: track.description || "",
        genre: track.genre || "",
        duration: track.duration || 0,
      };
      setFormData(newFormData);
      if (track.artwork) {
        setArtworkPreview(track.artwork);
      }
    }
  }, [mode, track?.id]);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);

      // Extract file name without extension and use as title
      const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension
      setFormData((prev) => ({
        ...prev,
        title: fileName,
      }));

      // Create audio preview and get duration
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.addEventListener("loadedmetadata", () => {
        setFormData((prev) => ({
          ...prev,
          duration: Math.round(audio.duration),
        }));
      });
    }
  };

  const handleArtworkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArtworkFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setArtworkPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "upload" && !audioFile) {
      toast.error("Please select an audio file");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Please enter a track title");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "upload") {
        // Upload mode
        const audioData = await convertFileToBase64(audioFile!);
        let artworkData: string | undefined;

        if (artworkFile) {
          artworkData = await convertFileToBase64(artworkFile);
        }

        const createTrackInput: CreateTrackInput = {
          title: formData.title,
          description: formData.description || undefined,
          audioData,
          artworkData,
          duration: formData.duration,
          genre: formData.genre || undefined,
        };

        await createTrack.mutateAsync(createTrackInput);
        toast.success("Track uploaded successfully!");
      } else {
        // Edit mode
        let artworkData: string | undefined;

        if (artworkFile) {
          artworkData = await convertFileToBase64(artworkFile);
        }

        await updateTrack.mutateAsync({
          trackId: track!.id,
          input: {
            title: formData.title,
            description: formData.description || undefined,
            genre: formData.genre || undefined,
            artworkData: artworkData,
          },
        });
        toast.success("Track updated successfully!");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(`Failed to ${mode} track. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const isUploadMode = mode === "upload";
  const isEditMode = mode === "edit";

  return (
    <form
      key={`${mode}-${track?.id || "new"}`}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Upload Mode Instructions */}
      {isUploadMode && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-300 text-sm">
            <span className="text-purple-400 font-medium">💡 Tip:</span> Upload
            your audio file first, and the title will be automatically set from
            the filename. You can then edit it below if needed.
          </p>
        </div>
      )}
      {/* Audio File Upload - Only show in upload mode */}
      {isUploadMode && (
        <div className="space-y-2">
          <Label htmlFor="audio" className="text-white">
            Audio File *
          </Label>
          <div
            className={`border-2 border-dashed border-gray-600 rounded-lg p-6 text-center transition-colors ${
              isSubmitting
                ? "opacity-50 cursor-not-allowed"
                : "hover:border-purple-500 cursor-pointer"
            }`}
          >
            <input
              id="audio"
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
              className="hidden"
              required
              disabled={isSubmitting}
            />
            <label
              htmlFor="audio"
              className={isSubmitting ? "cursor-not-allowed" : "cursor-pointer"}
            >
              <Music className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-white font-medium">
                {audioFile ? audioFile.name : "Click to upload audio file"}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                MP3, WAV, or other audio formats
              </p>
              {audioFile && (
                <div className="mt-2 space-y-1">
                  <p className="text-purple-400 text-sm">
                    Duration: {formatDuration(formData.duration)}
                  </p>
                  <p className="text-green-400 text-sm">
                    ✓ Title will be set to: "{formData.title}"
                  </p>
                  <p className="text-gray-400 text-xs">
                    You can edit the title below if needed
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>
      )}

      {/* Duration Display - Only show in edit mode */}
      {isEditMode && track && (
        <div className="space-y-2">
          <Label className="text-white">Duration</Label>
          <p className="text-gray-300">{formatDuration(track.duration || 0)}</p>
        </div>
      )}

      {/* Artwork Upload */}
      <div className="space-y-2">
        <Label htmlFor="artwork" className="text-white">
          Artwork (Optional)
        </Label>
        <div
          className={`border-2 border-dashed border-gray-600 rounded-lg p-6 text-center transition-colors ${
            isSubmitting
              ? "opacity-50 cursor-not-allowed"
              : "hover:border-purple-500 cursor-pointer"
          }`}
        >
          <input
            id="artwork"
            type="file"
            accept="image/*"
            onChange={handleArtworkChange}
            className="hidden"
            disabled={isSubmitting}
          />
          <label
            htmlFor="artwork"
            className={isSubmitting ? "cursor-not-allowed" : "cursor-pointer"}
          >
            {artworkPreview ? (
              <div className="space-y-2">
                <img
                  src={artworkPreview}
                  alt="Artwork preview"
                  className="mx-auto h-20 w-20 object-cover rounded-lg"
                />
                <p className="text-white font-medium">
                  {artworkFile?.name || "Current artwork"}
                </p>
              </div>
            ) : (
              <>
                <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-white font-medium">
                  Click to upload artwork
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  JPG, PNG, or other image formats
                </p>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Track Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-white">
            Title *
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Enter track title"
            className="bg-gray-800 border-gray-700 text-white"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="genre" className="text-white">
            Genre
          </Label>
          <Select
            key={`genre-${formData.genre}`}
            value={formData.genre}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, genre: value }))
            }
            disabled={isSubmitting}
          >
            <SelectTrigger
              className="bg-gray-800 border-gray-700 text-white"
              disabled={isSubmitting}
            >
              <SelectValue placeholder="Select genre" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="rock">Rock</SelectItem>
              <SelectItem value="pop">Pop</SelectItem>
              <SelectItem value="hip-hop">Hip Hop</SelectItem>
              <SelectItem value="electronic">Electronic</SelectItem>
              <SelectItem value="jazz">Jazz</SelectItem>
              <SelectItem value="classical">Classical</SelectItem>
              <SelectItem value="country">Country</SelectItem>
              <SelectItem value="r&b">R&B</SelectItem>
              <SelectItem value="indie">Indie</SelectItem>
              <SelectItem value="alternative">Alternative</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-white">
          Description
        </Label>
        <Textarea
          key={`description-${formData.description}`}
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Describe your track..."
          className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
          disabled={isSubmitting}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            !formData.title.trim() ||
            (isUploadMode && !audioFile)
          }
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isUploadMode ? "Uploading..." : "Updating..."}
            </>
          ) : (
            <>
              {isUploadMode ? (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Track
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Update Track
                </>
              )}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
