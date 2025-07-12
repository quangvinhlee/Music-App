"use client";

import { useState } from "react";
import { useCreateTrack } from "app/query/useInteractQueries";
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
import { Upload, Music, Image, Loader2 } from "lucide-react";
import { CreateTrackInput, TrackUploadFormData } from "app/types/music";

interface TrackUploadFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TrackUploadForm({
  onSuccess,
  onCancel,
}: TrackUploadFormProps) {
  const { data: user } = useCurrentUser();
  const createTrack = useCreateTrack(user);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);

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

    if (!audioFile) {
      toast.error("Please select an audio file");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Please enter a track title");
      return;
    }

    setIsUploading(true);

    try {
      const audioData = await convertFileToBase64(audioFile);
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
      onSuccess?.();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload track. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Audio File Upload */}
      <div className="space-y-2">
        <Label htmlFor="audio" className="text-white">
          Audio File *
        </Label>
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
          <input
            id="audio"
            type="file"
            accept="audio/*"
            onChange={handleAudioChange}
            className="hidden"
            required
          />
          <label htmlFor="audio" className="cursor-pointer">
            <Music className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-white font-medium">
              {audioFile ? audioFile.name : "Click to upload audio file"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              MP3, WAV, or other audio formats
            </p>
            {audioFile && formData.duration > 0 && (
              <p className="text-purple-400 text-sm mt-2">
                Duration: {formatDuration(formData.duration)}
              </p>
            )}
          </label>
        </div>
      </div>

      {/* Artwork Upload */}
      <div className="space-y-2">
        <Label htmlFor="artwork" className="text-white">
          Artwork (Optional)
        </Label>
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
          <input
            id="artwork"
            type="file"
            accept="image/*"
            onChange={handleArtworkChange}
            className="hidden"
          />
          <label htmlFor="artwork" className="cursor-pointer">
            {artworkPreview ? (
              <div className="space-y-2">
                <img
                  src={artworkPreview}
                  alt="Artwork preview"
                  className="mx-auto h-20 w-20 object-cover rounded-lg"
                />
                <p className="text-white font-medium">{artworkFile?.name}</p>
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
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="genre" className="text-white">
            Genre
          </Label>
          <Select
            value={formData.genre}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, genre: value }))
            }
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
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
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Describe your track..."
          className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isUploading}
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isUploading || !audioFile || !formData.title.trim()}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Track
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
