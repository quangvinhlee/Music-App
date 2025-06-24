/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import {
  useTrendingSongPlaylists,
  useTrendingIdByCountry,
} from "app/query/useSongQueries";
import { useGeoInfo } from "app/query/useAuthQueries";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

const HomePage = () => {
  const router = useRouter();

  // Get country code and trending ID
  const { data: geoInfo } = useGeoInfo();
  const countryCode = geoInfo?.countryCode || "US";
  const { data: trendingIdData } = useTrendingIdByCountry(countryCode);
  const trendingId = trendingIdData?.id;

  const {
    data: playlists = [],
    isLoading,
    error,
  } = useTrendingSongPlaylists(trendingId ?? "", { enabled: !!trendingId });

  const handleClick = (playlist: any) => () => {
    router.push(`/playlist/${playlist.id}`);
  };

  return (
    <div className="bg-[#f2f2f2] min-h-screen p-4">
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Trending Playlists
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-8">
              {[...Array(4)].map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-md overflow-hidden shadow-md bg-white"
                >
                  <Skeleton className="w-full h-[150px] rounded-none" />
                  <div className="p-2 flex items-center justify-center">
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : playlists.length > 0 ? (
            <Carousel className="w-full max-w-full relative">
              <CarouselPrevious
                className="absolute left-0 top-1/2 -translate-y-1/2 z-50 
               bg-white rounded-full p-2 shadow-md cursor-pointer
               hover:bg-gray-200 hover:scale-110 
               transition duration-200 ease-in-out"
              />
              <CarouselContent>
                {playlists.map((playlist) => (
                  <CarouselItem
                    key={playlist.id}
                    className="basis-auto md:basis-1/3 lg:basis-1/4 sm:basis-1/2"
                  >
                    <motion.div
                      className="cursor-pointer"
                      onClick={handleClick(playlist)}
                      whileHover={{ scale: 1.03 }}
                    >
                      <div className="rounded-md overflow-hidden shadow-md bg-white">
                        <Image
                          src={playlist.artwork}
                          alt={playlist.title}
                          width={200}
                          height={150}
                          className="object-cover w-full h-auto"
                        />
                        <div className="p-2 flex items-center justify-center">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {playlist.title}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselNext
                className="absolute right-0 top-1/2 -translate-y-1/2 z-50 
               bg-white rounded-full p-2 shadow-md cursor-pointer
               hover:bg-gray-200 hover:scale-110 
               transition duration-200 ease-in-out"
              />
            </Carousel>
          ) : null}
        </div>

        {/* Right - Sidebar */}
        <aside className="bg-white p-4 rounded-md shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">For You</h2>

          <div className="space-y-4 text-sm">
            <div className="border-l-4 border-orange-500 pl-3">
              <h3 className="font-semibold text-gray-700 mb-1">
                Recommended Artists
              </h3>
              <p className="text-gray-500">
                Discover new artists based on your taste
              </p>
            </div>

            <div className="border-l-4 border-orange-500 pl-3">
              <h3 className="font-semibold text-gray-700 mb-1">
                Recent Activity
              </h3>
              <p className="text-gray-500">See what your friends are playing</p>
            </div>

            <div className="border-l-4 border-orange-500 pl-3">
              <h3 className="font-semibold text-gray-700 mb-1">
                Popular This Week
              </h3>
              <p className="text-gray-500">
                Top tracks trending in your region
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default HomePage;
