import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { FilterState } from '../types/hdb';
import { HDB_TOWNS, FLAT_TYPES } from '../constants/hdb';

interface FilterDrawerProps {
  filters: FilterState;
  onChangeFilters: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  totalCount: number;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  filters,
  onChangeFilters,
  onResetFilters,
  totalCount,
}) => {
  const popularTowns = ['ALL', 'BISHAN', 'TAMPINES', 'BEDOK', 'PUNGGOL', 'QUEENSTOWN', 'ANG MO KIO', 'TOA PAYOH'];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs mb-6">
      {/* Search Input Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search street, block (e.g. Sin Ming, 442, Duxton)..."
            value={filters.query}
            onChange={(e) => onChangeFilters({ ...filters, query: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
          />
          {filters.query && (
            <button
              onClick={() => onChangeFilters({ ...filters, query: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <div className="relative shrink-0">
            <select
              value={filters.sortBy}
              onChange={(e) => onChangeFilters({ ...filters, sortBy: e.target.value as any })}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 pl-3 pr-8 py-2.5 focus:outline-none focus:border-rose-500 cursor-pointer min-h-[42px]"
            >
              <option value="_id desc">Latest Transactions</option>
              <option value="_id asc">Earliest (2017)</option>
              <option value="resale_price desc">Price: High to Low</option>
              <option value="resale_price asc">Price: Low to High</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={onResetFilters}
            className="px-3 py-2.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors shrink-0 min-h-[42px]"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Popular Towns Quick Filter (Segmented buttons) */}
      <div className="mt-3.5">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Town
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {popularTowns.map((town) => {
            const isSelected = (town === 'ALL' && !filters.town) || filters.town === town;
            return (
              <button
                key={town}
                onClick={() => onChangeFilters({ ...filters, town: town === 'ALL' ? '' : town })}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {town === 'ALL' ? 'All Towns' : town}
              </button>
            );
          })}

          {/* Full Towns Dropdown for non-popular towns */}
          <select
            value={popularTowns.includes(filters.town) ? '' : filters.town}
            onChange={(e) => onChangeFilters({ ...filters, town: e.target.value })}
            className="px-2 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200 focus:outline-none"
          >
            <option value="">Other Towns...</option>
            {HDB_TOWNS.filter((t) => !popularTowns.includes(t)).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Flat Type Quick Filter */}
      <div className="mt-3.5">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Flat Type
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => onChangeFilters({ ...filters, flatType: '' })}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              !filters.flatType
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Types
          </button>
          {FLAT_TYPES.map((type) => {
            const isSelected = filters.flatType === type;
            return (
              <button
                key={type}
                onClick={() => onChangeFilters({ ...filters, flatType: isSelected ? '' : type })}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div>
          <span>Showing records from </span>
          <span className="font-semibold text-slate-700">Jan 2017 to Present</span>
        </div>
        {totalCount > 0 && (
          <div>
            <span className="font-mono tabular-nums font-semibold text-slate-800">
              {totalCount.toLocaleString()}
            </span>
            <span> matching transactions</span>
          </div>
        )}
      </div>
    </div>
  );
};
