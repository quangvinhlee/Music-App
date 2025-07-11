"use client";

import { Music, User, Album } from "lucide-react";

export type TabId = "tracks" | "users" | "albums";

interface SearchTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function SearchTabs({ activeTab, onTabChange }: SearchTabsProps) {
  const tabs = [
    {
      id: "tracks" as TabId,
      label: "Tracks",
      icon: Music,
      description: "Find your next favorite song",
    },
    {
      id: "users" as TabId,
      label: "Artists",
      icon: User,
      description: "Discover amazing artists",
    },
    {
      id: "albums" as TabId,
      label: "Albums",
      icon: Album,
      description: "Complete music collections",
    },
  ];

  return (
    <div className="w-64 flex-shrink-0">
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 sticky top-24 shadow-2xl mt-4">
        <div className="space-y-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-medium transition-all duration-300 group ${
                  isActive
                    ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white shadow-lg border border-purple-500/30"
                    : "text-gray-300 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <div
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      : "bg-gray-700/50 text-gray-400 group-hover:bg-gray-600/50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">{tab.label}</div>
                  <div
                    className={`text-xs ${
                      isActive ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    {tab.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
