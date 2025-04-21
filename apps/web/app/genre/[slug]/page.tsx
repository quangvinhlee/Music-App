"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "app/store";
import { fetchHotSongs } from "app/store/song";
import LoadingSpinner from "@/components/Loading";
import { SOUNDCLOUD_GENRES } from "app/config/music-genre";
import { toast } from "sonner";
import { PlayCircle } from "lucide-react";
import { use } from "react"; // Import React.use()
import { set } from "react-hook-form";

interface Props {
  params: Promise<{ slug: string }>; // Update params to be a Promise
}

const GenrePage = ({ params }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { slug } = use(params); // Unwrap params using React.use()
  const genre = decodeURIComponent(slug).replace(/-/g, " ");
  const [isFetching, setIsFetching] = useState(false);

  const genreConfig = SOUNDCLOUD_GENRES.find(
    (g) => g.name.toLowerCase() === genre.toLowerCase()
  );

  const genreId =
    genreConfig?.id?.replace(/ /g, "-").toLowerCase() || "default";

  const { songs, isLoading, error } = useSelector(
    (state: RootState) => state.song
  );

  useEffect(() => {
    const controller = new AbortController(); // Create an AbortController
    const signal = controller.signal;

    setIsFetching(true);

    if (genre && isFetching) {
      dispatch(fetchHotSongs({ kind: "top", genre, signal })); // Pass signal to the fetch
    }

    setIsFetching(false);
    return () => {
      controller.abort(); // Cancel the fetch request on cleanup
    };
  }, [dispatch, genre]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Genre Banner */}
      <div className="relative flex items-center justify-between w-full h-64 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg overflow-hidden mb-8">
        <div className="p-8 flex flex-col justify-center w-2/3">
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
            Top Songs in {genre}
          </h1>
        </div>

        <div className="h-full w-1/3 flex items-center justify-center bg-white rounded-l-lg shadow-lg">
          <img
            src={`/${genreId}.jpg`}
            alt={genre}
            className="max-h-full max-w-full object-contain rounded-l-lg"
          />
        </div>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && toast.error(error)}

      {/* Song List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {songs.map((song) => (
          <div
            key={song.id}
            className="group relative bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            {/* Image with overlay */}
            <div className="relative w-full h-40 overflow-hidden cursor-pointer">
              <img
                src={song.artwork}
                alt={song.title}
                className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-70"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <PlayCircle className="w-12 h-12 text-white drop-shadow-md" />
              </div>
            </div>

            {/* Song Info */}
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
    </div>
  );
};

export default GenrePage;
