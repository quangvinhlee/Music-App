"use client";

import { Music, User, Album } from "lucide-react";

export type TabId = "tracks" | "users" | "albums";

interface SearchTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function SearchTabs({ activeTab, onTabChange }: SearchTabsProps) {
  const tabs = [
    { id: "tracks" as TabId, label: "Tracks", icon: Music },
    { id: "users" as TabId, label: "Users", icon: User },
    { id: "albums" as TabId, label: "Albums", icon: Album },
  ];

  return (
    <div className="w-48 flex-shrink-0">
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-700/50 rounded-xl p-3 sticky top-6 shadow-2xl">
        <div className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white shadow-lg border border-purple-500/30"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
