/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { SOUNDCLOUD_GENRES } from "./config/music-genre";

const itemsPerPage = 8;

const HotSongs = () => {
  const [startIndex, setStartIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const handleNext = () => {
    setDirection("right");
    setStartIndex((prev) =>
      prev + itemsPerPage >= SOUNDCLOUD_GENRES.length ? 0 : prev + itemsPerPage
    );
  };

  const handlePrev = () => {
    setDirection("left");
    setStartIndex((prev) =>
      prev - itemsPerPage < 0
        ? SOUNDCLOUD_GENRES.length - itemsPerPage
        : prev - itemsPerPage
    );
  };

  const visibleGenres = SOUNDCLOUD_GENRES.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const variants: Variants = {
    enter: (direction: "left" | "right") => ({
      x: direction === "right" ? 200 : -200,
      opacity: 0,
      position: "absolute",
    }),
    center: {
      x: 0,
      opacity: 1,
      position: "relative",
    },
    exit: (direction: "left" | "right") => ({
      x: direction === "right" ? -200 : 200,
      opacity: 0,
      position: "absolute",
    }),
  };

  return (
    <div className="mx-auto p-4 bg-white rounded-lg shadow-md mt-6 overflow-hidden">
      <h2 className="text-xl font-semibold mb-4">Genres</h2>
      <div className="flex items-center relative">
        <button
          onClick={handlePrev}
          className="bg-gray-300 p-2 rounded-full shadow-md z-10 hover:bg-gray-400 transition"
        >
          &#8592;
        </button>

        <div className="relative w-full h-36 overflow-hidden mx-4">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={startIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex justify-evenly w-full"
            >
              {visibleGenres.map((genre) => (
                <motion.div
                  key={genre.id}
                  className="flex flex-col items-center w-28 flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden shadow">
                    <img
                      src={`/${genre.id}.jpg`}
                      alt={genre.name}
                      className="w-full h-full object-cover rounded-full hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-sm text-center mt-2">{genre.name}</p>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          onClick={handleNext}
          className="bg-gray-300 p-2 rounded-full shadow-md z-10 hover:bg-gray-400 transition"
        >
          &#8594;
        </button>
      </div>
    </div>
  );
};

export default HotSongs;
