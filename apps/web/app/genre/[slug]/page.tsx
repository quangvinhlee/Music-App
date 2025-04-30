"use client";

import { use, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "app/store";
import { fetchHotSongs } from "app/store/song";
import { SOUNDCLOUD_GENRES } from "app/config/music-genre";
import { toast } from "sonner";
import { PlayCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import MusicPlayer from "@/components/MusicPlayer";
import Image from "next/image";

interface Props {
  params: Promise<{ slug: string }>;
}

const GenrePage = ({ params }: Props) => {
  const { slug } = use(params);
  const dispatch = useDispatch<AppDispatch>();

  const genre = decodeURIComponent(slug).replace(/-/g, " ");
  const [isFetching, setIsFetching] = useState(false);
  const [selectedSong, setSelectedSong] = useState<{
    streamUrl: string;
    title: string;
    artist: string;
    artwork: string;
  } | null>(null); // State for the selected song

  const genreConfig = SOUNDCLOUD_GENRES.find(
    (g) => g.name.toLowerCase() === genre.toLowerCase()
  );

  const genreId =
    genreConfig?.id?.replace(/ /g, "-").toLowerCase() || "default";

  const { songs, isLoading, error } = useSelector(
    (state: RootState) => state.song
  );

  useEffect(() => {
    if (!genre) return;

    let isMounted = true;
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchSongs = async () => {
      setIsFetching(true);
      try {
        await dispatch(
          fetchHotSongs({ kind: "trending", genre, signal })
        ).unwrap();
      } catch (err) {
        console.error("Error fetching songs:", err);
        toast.error("Failed to load songs.");
      } finally {
        if (isMounted) {
          setIsFetching(false);
        }
      }
    };

    const timeout = setTimeout(fetchSongs, 300);

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [genre, dispatch]);

  const isLoadingSongs = isLoading || isFetching;

  // Add a console log to debug the selected song
  useEffect(() => {
    if (selectedSong) {
      console.log("Selected song updated:", selectedSong);
    }
  }, [selectedSong]);

  return (
    <div className="p-6 bg-gray-100 mt-1 min-h-screen">
      {/* Genre Banner */}
      <div className="relative flex items-center justify-between w-full h-64 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg overflow-hidden mb-8">
        <div className="p-8 flex flex-col justify-center w-2/3">
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
            Top Songs in {genre}
          </h1>
        </div>
        <div className="h-full w-1/3 flex items-center justify-center bg-white rounded-l-lg shadow-lg">
          <Image
            width={200}
            height={200}
            src={`/${genreId}.jpg`} // Updated to use a valid relative path
            alt={genre}
            className="max-h-full max-w-full object-contain rounded-l-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoadingSongs
          ? Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg p-4 space-y-4"
              >
                <Skeleton className="w-full h-40 rounded-md" />
                <div className="flex flex-col items-center space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))
          : songs.map((song) => (
              <div
                key={song.id}
                className="group relative bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                onClick={() => {
                  const songData = {
                    streamUrl: song.streamUrl,
                    title: song.title,
                    artist: song.artist,
                    artwork: song.artwork.startsWith("http")
                      ? song.artwork
                      : "/music-plate.jpg",
                  };
                  console.log("Setting selected song:", songData);
                  setSelectedSong(songData);
                }}
              >
                <div className="relative w-full h-40 overflow-hidden cursor-pointer">
                  <Image
                    width={300}
                    height={300}
                    src={
                      song.artwork.startsWith("http")
                        ? song.artwork
                        : "/music-plate.jpg"
                    }
                    alt={song.title}
                    className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-70"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <PlayCircle className="w-12 h-12 text-white drop-shadow-md" />
                  </div>
                </div>

                <div className="p-4 flex flex-col items-center text-center">
                  <h2 className="font-semibold text-lg text-gray-800">
                    {song.title}
                  </h2>
                  <p className="text-sm text-gray-500">By {song.artist}</p>
                  <p className="text-xs text-gray-400">{song.genre}</p>
                </div>
              </div>
            ))}
      </div>

      {/* Always render MusicPlayer but pass null when no song is selected */}
      <MusicPlayer song={selectedSong} />
    </div>
  );
};

export default GenrePage;
