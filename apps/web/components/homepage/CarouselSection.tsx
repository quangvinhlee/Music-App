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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm text-blue-600 hover:underline font-medium"
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
              className="rounded-md overflow-hidden shadow-md bg-white"
            >
              <Skeleton className="w-full h-[150px] rounded-none" />
              <div className="p-2 flex items-center justify-center">
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <Carousel className="w-full max-w-full relative">
          <CarouselPrevious
            className="absolute left-0 top-1/2 -translate-y-1/2 z-50 
              bg-white rounded-full p-2 shadow-md cursor-pointer
              hover:bg-gray-200 hover:scale-110 
              transition duration-200 ease-in-out"
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
              bg-white rounded-full p-2 shadow-md cursor-pointer
              hover:bg-gray-200 hover:scale-110 
              transition duration-200 ease-in-out"
          />
        </Carousel>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No items to display.</p>
        </div>
      )}
    </div>
  );
}
