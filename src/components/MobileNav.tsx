import React from 'react';
import { LayoutGrid, Search, TrendingUp, Gem, Bookmark } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  savedCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
}) => {
  const tabs = [
    { id: 'feed', label: 'Latest', icon: LayoutGrid },
    { id: 'explore', label: 'Explore', icon: Search },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'million', label: 'Million $', icon: Gem },
    { id: 'saved', label: 'Saved', icon: Bookmark, badge: savedCount },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden">
      <div className="grid grid-cols-5 h-16 items-center px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors relative ${
                isActive ? 'text-rose-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight truncate max-w-full px-1">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-rose-600 absolute bottom-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
