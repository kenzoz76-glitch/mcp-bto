import React from 'react';
import { Activity, RefreshCw, BookmarkCheck } from 'lucide-react';
import { ApiHealthStatus } from '../types/hdb';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  health: ApiHealthStatus | null;
  healthLoading: boolean;
  onOpenHealthModal: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  health,
  healthLoading,
  onOpenHealthModal,
  onRefreshData,
  isRefreshing,
  savedCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Mark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            H
          </div>
          <button
            onClick={() => setActiveTab('feed')}
            className="text-left font-bold text-slate-900 tracking-tight text-lg hover:text-rose-600 transition-colors"
          >
            HDB Resale Tracker
          </button>
        </div>

        {/* Zone 2: 4-5 Navigation Links (Desktop/Tablet) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('feed')}
            className={`transition-colors pb-1 ${
              activeTab === 'feed'
                ? 'text-rose-600 border-b-2 border-rose-600 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Latest Feed
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`transition-colors pb-1 ${
              activeTab === 'explore'
                ? 'text-rose-600 border-b-2 border-rose-600 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Explore & Search
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`transition-colors pb-1 ${
              activeTab === 'trends'
                ? 'text-rose-600 border-b-2 border-rose-600 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Market Trends
          </button>
          <button
            onClick={() => setActiveTab('million')}
            className={`transition-colors pb-1 ${
              activeTab === 'million'
                ? 'text-rose-600 border-b-2 border-rose-600 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Million $ Club
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-1.5 transition-colors pb-1 ${
              activeTab === 'saved'
                ? 'text-rose-600 border-b-2 border-rose-600 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            <span>Watchlist</span>
            {savedCount > 0 && (
              <span className="bg-slate-100 text-slate-700 text-xs px-1.5 py-0.2 rounded font-mono">
                {savedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Live API Health Trigger & Refresh) */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshData}
            disabled={isRefreshing}
            title="Refresh transactions"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-rose-600' : ''}`} />
          </button>

          <button
            onClick={onOpenHealthModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white text-xs font-medium text-slate-700 transition-colors shadow-xs min-h-[40px]"
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                healthLoading
                  ? 'bg-amber-400 animate-pulse'
                  : health?.healthy
                  ? 'bg-emerald-500'
                  : 'bg-rose-500'
              }`}
            />
            <span className="hidden sm:inline">data.gov.sg</span>
            <span className="font-mono tabular-nums text-slate-500">
              {healthLoading ? '...' : health?.latencyMs ? `${health.latencyMs}ms` : 'Online'}
            </span>
            <Activity className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
