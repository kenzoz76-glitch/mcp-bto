import React from 'react';
import { Bookmark, Trash2, Calculator, ExternalLink } from 'lucide-react';
import { HDBRecord } from '../types/hdb';
import { TransactionCard } from './TransactionCard';

interface SavedFlatsViewProps {
  savedFlats: HDBRecord[];
  onToggleSave: (record: HDBRecord) => void;
  onOpenMortgage: (record: HDBRecord) => void;
  onClearAll: () => void;
  onExplore: () => void;
}

export const SavedFlatsView: React.FC<SavedFlatsViewProps> = ({
  savedFlats,
  onToggleSave,
  onOpenMortgage,
  onClearAll,
  onExplore,
}) => {
  if (savedFlats.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-md mx-auto my-8">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Bookmark className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-900 text-base">Your Watchlist is Empty</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Bookmark any HDB transaction by clicking the bookmark icon to compare prices, floor areas, and calculate monthly mortgages.
        </p>
        <button
          onClick={onExplore}
          className="mt-5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors"
        >
          Explore Latest Transactions
        </button>
      </div>
    );
  }

  const avgPrice = Math.round(
    savedFlats.reduce((sum, f) => sum + f.resale_price_num, 0) / savedFlats.length
  );
  const avgPsf = Math.round(
    savedFlats.reduce((sum, f) => sum + f.psf, 0) / savedFlats.length
  );

  const formatSGD = (num: number) =>
    new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      maximumFractionDigits: 0,
    }).format(num);

  return (
    <div className="space-y-6">
      {/* Header and Watchlist stats */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Saved Properties ({savedFlats.length})
          </div>
          <div className="flex items-center gap-4 mt-1">
            <div>
              <span className="text-xs text-slate-400">Avg Watchlist Price: </span>
              <span className="font-bold text-slate-900 font-mono tabular-nums text-sm">
                {formatSGD(avgPrice)}
              </span>
            </div>
            <span className="text-slate-300">·</span>
            <div>
              <span className="text-xs text-slate-400">Avg PSF: </span>
              <span className="font-bold text-slate-900 font-mono tabular-nums text-sm">
                ${avgPsf} psf
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-medium transition-colors self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Watchlist</span>
        </button>
      </div>

      {/* Grid of Saved Flats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savedFlats.map((record) => (
          <TransactionCard
            key={record._id}
            record={record}
            isSaved={true}
            onToggleSave={onToggleSave}
            onOpenMortgage={onOpenMortgage}
          />
        ))}
      </div>
    </div>
  );
};
