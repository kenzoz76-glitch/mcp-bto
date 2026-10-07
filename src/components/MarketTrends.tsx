import React from 'react';
import { TrendingUp, Building, DollarSign, Layers, ArrowUpRight } from 'lucide-react';
import { HDBRecord } from '../types/hdb';

interface MarketTrendsProps {
  records: HDBRecord[];
  onSelectTown: (town: string) => void;
  onSelectFlatType: (flatType: string) => void;
}

export const MarketTrends: React.FC<MarketTrendsProps> = ({
  records,
  onSelectTown,
  onSelectFlatType,
}) => {
  if (records.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
        Loading real market statistics from data.gov.sg...
      </div>
    );
  }

  // Calculate statistics from loaded records
  const prices = records.map((r) => r.resale_price_num).sort((a, b) => a - b);
  const medianPrice = prices[Math.floor(prices.length / 2)] || 0;
  const avgPsf = Math.round(
    records.reduce((acc, r) => acc + r.psf, 0) / (records.length || 1)
  );
  const millionCount = records.filter((r) => r.isMillionDollar).length;
  const avgLease = Math.round(
    records.reduce((acc, r) => acc + r.remaining_years, 0) / (records.length || 1)
  );

  // Group by flat type
  const flatTypeStats: Record<string, { count: number; totalPsf: number; minPrice: number; maxPrice: number; totalPrice: number }> = {};
  records.forEach((r) => {
    if (!flatTypeStats[r.flat_type]) {
      flatTypeStats[r.flat_type] = { count: 0, totalPsf: 0, minPrice: Infinity, maxPrice: 0, totalPrice: 0 };
    }
    const stat = flatTypeStats[r.flat_type];
    stat.count += 1;
    stat.totalPsf += r.psf;
    stat.totalPrice += r.resale_price_num;
    stat.minPrice = Math.min(stat.minPrice, r.resale_price_num);
    stat.maxPrice = Math.max(stat.maxPrice, r.resale_price_num);
  });

  // Group by town
  const townStats: Record<string, { count: number; totalPrice: number }> = {};
  records.forEach((r) => {
    if (!townStats[r.town]) {
      townStats[r.town] = { count: 0, totalPrice: 0 };
    }
    townStats[r.town].count += 1;
    townStats[r.town].totalPrice += r.resale_price_num;
  });

  const sortedTowns = Object.entries(townStats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8);

  const formatSGD = (num: number) =>
    new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      maximumFractionDigits: 0,
    }).format(num);

  return (
    <div className="space-y-6">
      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Sample Median Price
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {formatSGD(medianPrice)}
          </div>
          <div className="text-xs text-slate-400 mt-1">From active batch</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Avg Price Per Sqft
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            ${avgPsf.toLocaleString()} psf
          </div>
          <div className="text-xs text-slate-400 mt-1">Effective living area rate</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Million $ Deals
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {millionCount} <span className="text-xs font-normal text-slate-500">flats</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Transacted ≥ S$1,000,000</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Avg Remaining Lease
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {avgLease} <span className="text-xs font-normal text-slate-500">years</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Out of standard 99y lease</div>
        </div>
      </div>

      {/* Flat Type Breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
          Price Benchmark by Flat Type
        </h3>
        <div className="divide-y divide-slate-100">
          {Object.entries(flatTypeStats)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([type, stat]) => {
              const avgP = Math.round(stat.totalPrice / stat.count);
              const avgPpsf = Math.round(stat.totalPsf / stat.count);
              return (
                <div
                  key={type}
                  onClick={() => onSelectFlatType(type)}
                  className="py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors group"
                >
                  <div>
                    <div className="font-semibold text-sm text-slate-900 group-hover:text-rose-600 transition-colors flex items-center gap-1.5">
                      <span>{type}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      <span>Range: {formatSGD(stat.minPrice)} – {formatSGD(stat.maxPrice)}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-sm text-slate-900 font-mono tabular-nums">
                      {formatSGD(avgP)}
                    </div>
                    <div className="text-xs text-slate-500 font-mono tabular-nums">
                      ${avgPpsf} psf · {stat.count} units
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* High Volume Towns */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
          Top Active Towns in Dataset
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sortedTowns.map(([town, stat]) => {
            const avgP = Math.round(stat.totalPrice / stat.count);
            return (
              <button
                key={town}
                onClick={() => onSelectTown(town)}
                className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900 uppercase">
                    {town}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {stat.count} transactions in sample
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 font-mono tabular-nums">
                    {formatSGD(avgP)}
                  </div>
                  <div className="text-[10px] text-slate-400">Avg price</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
