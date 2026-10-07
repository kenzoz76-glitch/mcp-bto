import React, { useState } from 'react';
import { X, Calculator, HelpCircle } from 'lucide-react';
import { HDBRecord } from '../types/hdb';

interface MortgageModalProps {
  record: HDBRecord | null;
  onClose: () => void;
}

export const MortgageModal: React.FC<MortgageModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  const price = record.resale_price_num;
  const [downpaymentPct, setDownpaymentPct] = useState(25); // 25% downpayment (75% LTV)
  const [tenureYears, setTenureYears] = useState(25);
  const [interestRate, setInterestRate] = useState(2.6); // 2.6% standard HDB loan rate

  const loanAmount = price * (1 - downpaymentPct / 100);
  const downpaymentAmount = price * (downpaymentPct / 100);

  // Monthly mortgage calculation formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = tenureYears * 12;

  let monthlyInstallment = 0;
  if (monthlyRate > 0) {
    monthlyInstallment =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
  } else {
    monthlyInstallment = loanAmount / totalMonths;
  }

  const totalPayment = monthlyInstallment * totalMonths;
  const totalInterest = Math.max(0, totalPayment - loanAmount);

  const formatSGD = (num: number) =>
    new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      maximumFractionDigits: 0,
    }).format(num);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-rose-600" />
            <h2 className="font-bold text-slate-900 text-base">
              Mortgage & Affordability Calculator
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm">
          {/* Flat identity banner */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-xs text-slate-500 font-medium">
              {record.town} · {record.flat_type} ({record.floor_area_sqm_num} sqm)
            </div>
            <div className="font-bold text-slate-900 text-sm mt-0.5">
              Blk {record.block} {record.street_name}
            </div>
            <div className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-1">
              {formatSGD(price)}
            </div>
          </div>

          {/* Monthly result callout */}
          <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl text-center">
            <div className="text-xs text-rose-800 font-medium uppercase tracking-wider">
              Estimated Monthly Installment
            </div>
            <div className="text-3xl font-extrabold text-rose-600 font-mono tabular-nums mt-1">
              {formatSGD(monthlyInstallment)}
              <span className="text-xs font-normal text-rose-800"> / month</span>
            </div>
            <div className="text-xs text-rose-700/80 mt-1">
              CPF OA + Cash payable monthly
            </div>
          </div>

          {/* Calculator controls */}
          <div className="space-y-4">
            {/* Downpayment % */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span>Downpayment ({downpaymentPct}%)</span>
                <span className="font-mono tabular-nums font-semibold">
                  {formatSGD(downpaymentAmount)}
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={50}
                step={5}
                value={downpaymentPct}
                onChange={(e) => setDownpaymentPct(parseInt(e.target.value, 10))}
                className="w-full accent-rose-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                <span>20% (HDB min)</span>
                <span>25% (Bank 75% LTV)</span>
                <span>50%</span>
              </div>
            </div>

            {/* Loan Tenure */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span>Loan Tenure: {tenureYears} years</span>
                <span className="text-slate-500">{tenureYears * 12} months</span>
              </div>
              <input
                type="range"
                min={10}
                max={30}
                step={1}
                value={tenureYears}
                onChange={(e) => setTenureYears(parseInt(e.target.value, 10))}
                className="w-full accent-rose-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                <span>10 yrs</span>
                <span>25 yrs (HDB max)</span>
                <span>30 yrs</span>
              </div>
            </div>

            {/* Interest Rate */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span>Interest Rate ({interestRate.toFixed(1)}% p.a.)</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setInterestRate(2.6)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      interestRate === 2.6 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    HDB (2.6%)
                  </button>
                  <button
                    onClick={() => setInterestRate(3.0)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      interestRate === 3.0 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Bank (3.0%)
                  </button>
                </div>
              </div>
              <input
                type="range"
                min={1.5}
                max={5.0}
                step={0.1}
                value={interestRate}
                onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                className="w-full accent-rose-600"
              />
            </div>
          </div>

          {/* Breakdown summary */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Principal Loan Amount:</span>
              <span className="font-mono font-medium text-slate-800">{formatSGD(loanAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated Total Interest:</span>
              <span className="font-mono font-medium text-slate-800">{formatSGD(totalInterest)}</span>
            </div>
            <div className="flex justify-between text-slate-600 pt-1.5 border-t border-slate-200">
              <span className="font-semibold text-slate-900">Total Payments:</span>
              <span className="font-mono font-bold text-slate-900">{formatSGD(totalPayment)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
