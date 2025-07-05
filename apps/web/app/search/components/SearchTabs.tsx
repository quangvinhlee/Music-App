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
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 sticky top-6">
        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-amber-500 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100"
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
