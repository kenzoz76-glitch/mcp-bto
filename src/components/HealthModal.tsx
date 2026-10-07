import React from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Copy, Check, ExternalLink, Key } from 'lucide-react';
import { ApiHealthStatus } from '../types/hdb';
import { DATA_GOV_SG_ENDPOINT } from '../constants/hdb';

interface HealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  health: ApiHealthStatus | null;
  loading: boolean;
  onRecheck: () => void;
}

export const HealthModal: React.FC<HealthModalProps> = ({
  isOpen,
  onClose,
  health,
  loading,
  onRecheck,
}) => {
  const [copiedUrl, setCopiedUrl] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyEndpoint = () => {
    navigator.clipboard?.writeText(DATA_GOV_SG_ENDPOINT);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-3 h-3 rounded-full ${
                health?.healthy ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            <h2 className="font-bold text-slate-900 text-base">
              data.gov.sg API Health Monitor
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
          {/* Status summary banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              health?.healthy
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-3">
              {health?.healthy ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <div>
                <div className="font-semibold capitalize">
                  {health?.status || 'Checking...'}
                </div>
                <div className="text-xs opacity-80">
                  {health?.healthy
                    ? 'Official HDB Resale datastore is active & responsive'
                    : health?.error || 'Unable to connect to data.gov.sg'}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono font-bold">
                {health?.latencyMs} ms
              </div>
              <div className="text-[10px] opacity-75">Response Latency</div>
            </div>
          </div>

          {/* Requested Target Endpoint */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Monitored Endpoint
            </div>
            <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs break-all flex items-start justify-between gap-2">
              <span className="text-emerald-400 font-semibold shrink-0">GET</span>
              <span className="flex-1 text-slate-300">
                {health?.targetUrl || DATA_GOV_SG_ENDPOINT}
              </span>
              <button
                onClick={handleCopyEndpoint}
                className="p-1 hover:text-white transition-colors shrink-0"
                title="Copy endpoint"
              >
                {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Vercel BTO_ACCOUNT_KEY status */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
            <div className="flex items-center gap-2 mb-1.5">
              <Key className="w-4 h-4 text-slate-600" />
              <span className="font-semibold text-xs text-slate-800">
                BTO_ACCOUNT_KEY (Vercel Environment Variable)
              </span>
            </div>
            <div className="text-xs text-slate-600 leading-relaxed">
              {health?.btoAccountKeyConfigured ? (
                <span className="text-emerald-700 font-medium">
                  Configured and active. Header <code>x-api-key</code> will be automatically included in all upstream requests.
                </span>
              ) : (
                <span>
                  Status:{' '}
                  <span className="font-medium text-slate-800">
                    Not configured (using public data.gov.sg open datastore access).
                  </span>{' '}
                  When you add <code className="bg-white px-1 py-0.5 rounded border border-slate-200 font-mono">BTO_ACCOUNT_KEY</code> in Vercel Project Settings &gt; Environment Variables, the backend will automatically pick it up.
                </span>
              )}
            </div>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-xs text-slate-500">Total Dataset Records</div>
              <div className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                {health?.totalRecordsAvailable?.toLocaleString() || '240,000+'}
              </div>
              <div className="text-[11px] text-slate-400">Jan 2017 to Present</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-xs text-slate-500">Sample Records Loaded</div>
              <div className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                {health?.sampleRecordsCount || 5} records
              </div>
              <div className="text-[11px] text-slate-400">Validated in check</div>
            </div>
          </div>

          {/* Sample records preview */}
          {Boolean(health?.sampleRecords && health.sampleRecords.length > 0) && (
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Sample Output from data.gov.sg (First 5 records)
              </div>
              <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] max-h-40 overflow-y-auto">
                <pre>{JSON.stringify(health?.sampleRecords, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            /api/health.js · {new Date().toLocaleTimeString()}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRecheck}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Ping API Now</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
