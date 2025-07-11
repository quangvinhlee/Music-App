import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import PlayPauseButton from "@/components/PlayPauseButton";
import { MusicItem } from "@/types/music";

interface CarouselSectionProps<T> {
  title: string;
  items: T[];
  renderItem: (item: T, idx: number) => React.ReactNode;
  isLoading: boolean;
  skeletonCount?: number;
  viewAllHref?: string;
}

export function CarouselSection<T>({
  title,
  items,
  renderItem,
  isLoading,
  skeletonCount = 4,
  viewAllHref,
}: CarouselSectionProps<T>) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm text-purple-400 hover:text-purple-300 hover:underline font-medium transition-colors"
          >
            View All
          </Link>
        )}
      </div>
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-8">
          {[...Array(skeletonCount)].map((_, idx) => (
            <div
              key={idx}
              className="rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-700/50"
            >
              <Skeleton className="w-full h-[150px] rounded-none bg-gray-600" />
              <div className="p-4 flex items-center justify-center">
                <Skeleton className="h-4 w-3/4 bg-gray-600" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <Carousel className="w-full max-w-full relative">
          <CarouselPrevious
            className="absolute left-0 top-1/2 -translate-y-1/2 z-50 
              bg-gray-800/80 backdrop-blur-sm rounded-full p-2 shadow-lg cursor-pointer
              hover:bg-gray-700/80 hover:scale-110 border border-gray-600/50
              transition duration-200 ease-in-out text-white"
          />
          <CarouselContent>
            {items.map((item, idx) => (
              <CarouselItem
                key={idx}
                className="basis-auto md:basis-1/3 lg:basis-1/4 sm:basis-1/2"
              >
                {renderItem(item, idx)}
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselNext
            className="absolute right-0 top-1/2 -translate-y-1/2 z-50 
              bg-gray-800/80 backdrop-blur-sm rounded-full p-2 shadow-lg cursor-pointer
              hover:bg-gray-700/80 hover:scale-110 border border-gray-600/50
              transition duration-200 ease-in-out text-white"
          />
        </Carousel>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p>No items to display.</p>
        </div>
      )}
    </div>
  );
}
