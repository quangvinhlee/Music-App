/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useRef } from "react";

const HotSongs = () => {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const clientId = "EjkRJG0BLNEZquRiPZYdNtJdyGtTuHdp";

  if (!clientId) {
    console.error(
      "SoundCloud Client ID is undefined. Please check your .env.local file."
    );
  }

  const searchQuery = "top hits";

  useEffect(() => {
    const fetchTopTracks = async () => {
      try {
        const res = await fetch(
          `https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(
            searchQuery
          )}&client_id=${clientId}&limit=10`
        );
        const data = await res.json();
        console.log("Fetched data:", data);

        const enrichedTracks = await Promise.all(
          data.collection.map(async (track) => {
            const streamInfo = track.media.transcodings.find(
              (t) => t.format.protocol === "progressive"
            );

            if (!streamInfo) return null;

            const streamRes = await fetch(
              `${streamInfo.url}?client_id=${clientId}`
            );
            const streamData = await streamRes.json();

            return {
              title: track.title,
              artist: track.user.username,
              artwork:
                track.artwork_url?.replace("-large", "-t500x500") ||
                "/default.jpg",
              streamUrl: streamData.url,
            };
          })
        );

        const validTracks = enrichedTracks.filter(Boolean);
        setTracks(validTracks);
      } catch (error) {
        console.error("Error fetching SoundCloud tracks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopTracks();
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (tracks.length === 0) return <div>No streamable tracks found.</div>;

  return (
    <div className="mx-auto p-4 bg-white rounded-lg shadow-md mt-6">
      <h1 className="text-2xl font-semibold mb-4">Hot Songs (Streaming)</h1>
      <div className="relative">
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-300 p-2 rounded-full shadow-md z-10"
        >
          &#8592;
        </button>
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto space-x-4"
          style={{ scrollBehavior: "smooth" }}
        >
          {tracks.map((track, index) => (
            <div
              key={index}
              className="bg-gray-100 p-4 rounded-lg shadow-md w-64 flex-shrink-0 transform transition-transform duration-300 hover:scale-105 hover:shadow-lg"
            >
              <img
                src={track.artwork}
                alt={track.title}
                className="w-full h-40 object-cover rounded-lg mb-2"
              />
              <h2 className="text-lg font-bold">{track.title}</h2>
              <p className="text-gray-600">{track.artist}</p>
              {track.streamUrl ? (
                <audio controls className="w-full mt-2">
                  <source src={track.streamUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <p className="text-sm text-red-500 mt-2">No stream available</p>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-300 p-2 rounded-full shadow-md z-10"
        >
          &#8594;
        </button>
      </div>
    </div>
  );
};

export default HotSongs;
