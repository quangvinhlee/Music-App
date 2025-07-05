"use client";

import { useMusicPlayer } from "./provider/MusicContext";

interface MainContentProps {
  children: React.ReactNode;
}

export default function MainContent({ children }: MainContentProps) {
  const { isPlayerVisible } = useMusicPlayer();

  return (
    <main className={`flex-1 ${isPlayerVisible ? "pb-24" : ""}`}>
      {children}
    </main>
  );
}
