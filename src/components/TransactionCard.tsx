import React from 'react';
import { Bookmark, Calculator, Share2, MapPin, Building2, Check } from 'lucide-react';
import { HDBRecord } from '../types/hdb';

interface TransactionCardProps {
  record: HDBRecord;
  isSaved: boolean;
  onToggleSave: (record: HDBRecord) => void;
  onOpenMortgage: (record: HDBRecord) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  record,
  isSaved,
  onToggleSave,
  onOpenMortgage,
}) => {
  const [copied, setCopied] = React.useState(false);

  const formattedPrice = new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    maximumFractionDigits: 0,
  }).format(record.resale_price_num);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `HDB Resale: Blk ${record.block} ${record.street_name} (${record.town}) - ${record.flat_type} (${record.floor_area_sqm_num} sqm) transacted at ${formattedPrice} (${record.month})`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Remaining lease percentage out of 99 years
  const leasePercent = Math.min(Math.max((record.remaining_years / 99) * 100, 5), 100);

  return (
    <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 sm:p-5 transition-all shadow-xs hover:shadow-sm">
      {/* Top Header: Town / Month & Actions */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wide">
            <span className="text-slate-900 font-semibold">{record.town}</span>
            <span aria-hidden="true">·</span>
            <span>{record.month}</span>
            {record.isMillionDollar && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-600 font-semibold">Million $ Club</span>
              </>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 leading-snug">
            Blk {record.block} {record.street_name}
          </h3>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onOpenMortgage(record)}
            title="Calculate monthly mortgage"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <Calculator className="w-4 h-4" />
          </button>
          <button
            onClick={handleShare}
            title="Copy transaction summary"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onToggleSave(record)}
            title={isSaved ? 'Remove from saved' : 'Save flat'}
            className={`p-2 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center ${
              isSaved
                ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Spec & Unboxed Metadata */}
      <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-xs sm:text-sm text-slate-600 mb-4">
        <span className="font-medium text-slate-800">{record.flat_type}</span>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span>{record.flat_model}</span>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span className="font-mono tabular-nums">{record.floor_area_sqm_num} sqm</span>
        <span className="text-slate-400 font-mono tabular-nums">({record.floor_area_sqft_num.toLocaleString()} sqft)</span>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span>Flr {record.storey_range}</span>
      </div>

      {/* Pricing & Lease Section */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        {/* Price & Unit Rates */}
        <div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formattedPrice}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span className="font-mono tabular-nums">${record.psf.toLocaleString()} psf</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">${record.psm.toLocaleString()} psm</span>
          </div>
        </div>

        {/* Remaining Lease Indicator */}
        <div className="sm:text-right min-w-[160px]">
          <div className="text-xs text-slate-500">
            <span>Lease: </span>
            <span className="font-medium text-slate-700">{record.remaining_lease}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 sm:justify-end">
            <div className="w-24 sm:w-28 bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  record.remaining_years > 70
                    ? 'bg-emerald-500'
                    : record.remaining_years > 50
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${leasePercent}%` }}
              />
            </div>
            <span className="text-[11px] font-mono tabular-nums text-slate-400">
              {record.remaining_years}y left
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
