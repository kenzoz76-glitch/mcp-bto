import React from 'react';
import { Gem, ArrowUpDown, Filter } from 'lucide-react';
import { HDBRecord } from '../types/hdb';
import { TransactionCard } from './TransactionCard';

interface MillionDollarViewProps {
  records: HDBRecord[];
  savedFlats: HDBRecord[];
  onToggleSave: (record: HDBRecord) => void;
  onOpenMortgage: (record: HDBRecord) => void;
}

export const MillionDollarView: React.FC<MillionDollarViewProps> = ({
  records,
  savedFlats,
  onToggleSave,
  onOpenMortgage,
}) => {
  const millionFlats = records.filter((r) => r.isMillionDollar);

  // Group by town
  const townDistribution: Record<string, number> = {};
  millionFlats.forEach((f) => {
    townDistribution[f.town] = (townDistribution[f.town] || 0) + 1;
  });

  const sortedTowns = Object.entries(townDistribution).sort((a, b) => b[1] - a[1]);

  const maxPriceFlat = [...millionFlats].sort((a, b) => b.resale_price_num - a.resale_price_num)[0];

  const formatSGD = (num: number) =>
    new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      maximumFractionDigits: 0,
    }).format(num);

  return (
    <div className="space-y-6">
      {/* Editorial Overview Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Gem className="w-4 h-4" />
          <span>Singapore HDB Million-Dollar Club</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Monitoring Prime Public Housing Resale Transactions
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
          Flats transacting at or above S$1,000,000 represent rare attributes like city fringe locations, high storeys, maisonette / DBSS layouts, or remaining leases &gt;80 years.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-5 pt-4 border-t border-slate-700/60">
          <div>
            <div className="text-xs text-slate-400">Total in Current Stream</div>
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white mt-0.5">
              {millionFlats.length}
            </div>
          </div>
          {maxPriceFlat && (
            <div>
              <div className="text-xs text-slate-400">Highest In Batch</div>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-amber-300 mt-0.5">
                {formatSGD(maxPriceFlat.resale_price_num)}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {maxPriceFlat.town} · Blk {maxPriceFlat.block}
              </div>
            </div>
          )}
          <div className="hidden sm:block">
            <div className="text-xs text-slate-400">Top Prime Towns</div>
            <div className="text-sm font-semibold text-white mt-1">
              {sortedTowns.slice(0, 3).map((t) => t[0]).join(', ') || 'Bishan, Queenstown'}
            </div>
          </div>
        </div>
      </div>

      {/* Million Flats List */}
      {millionFlats.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
          No million-dollar transactions found in the active filter selection. Try selecting "All Towns" or "Bishan / Queenstown / Central Area".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {millionFlats.map((record) => (
            <TransactionCard
              key={record._id}
              record={record}
              isSaved={savedFlats.some((s) => s._id === record._id)}
              onToggleSave={onToggleSave}
              onOpenMortgage={onOpenMortgage}
            />
          ))}
        </div>
      )}
    </div>
  );
};
