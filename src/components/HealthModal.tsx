import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Copy, Check, ExternalLink, Key, Coins } from 'lucide-react';
import { ApiHealthStatus, UraTokenResponse } from '../types/hdb';
import { DATA_GOV_SG_ENDPOINT } from '../constants/hdb';
import { fetchUraDailyToken } from '../services/api';

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
  const [copiedUraUrl, setCopiedUraUrl] = React.useState(false);
  const [copiedToken, setCopiedToken] = React.useState(false);

  const [uraTokenData, setUraTokenData] = useState<UraTokenResponse | null>(null);
  const [uraLoading, setUraLoading] = useState<boolean>(false);

  const URA_ENDPOINT = 'https://eservice.ura.gov.sg/uraDataService/insertNewToken/v1';

  // Load URA token info when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUraToken(false);
    }
  }, [isOpen]);

  const loadUraToken = async (force: boolean) => {
    setUraLoading(true);
    try {
      const res = await fetchUraDailyToken(force);
      setUraTokenData(res);
    } catch (e) {
      console.warn('Error trading URA token', e);
    } finally {
      setUraLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleCopyEndpoint = () => {
    navigator.clipboard?.writeText(DATA_GOV_SG_ENDPOINT);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyUraEndpoint = () => {
    navigator.clipboard?.writeText(URA_ENDPOINT);
    setCopiedUraUrl(true);
    setTimeout(() => setCopiedUraUrl(false), 2000);
  };

  const handleCopyToken = () => {
    if (uraTokenData?.token) {
      navigator.clipboard?.writeText(uraTokenData.token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
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
              Singapore Data & API Health Monitor
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

          {/* URA Token Trading Service Box */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                  Trade AccessKey for Today's Token (URA)
                </span>
              </div>
              <button
                onClick={() => loadUraToken(true)}
                disabled={uraLoading}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-md text-xs font-medium transition-colors shadow-2xs"
              >
                <RefreshCw className={`w-3 h-3 ${uraLoading ? 'animate-spin text-amber-600' : ''}`} />
                <span>{uraLoading ? 'Trading...' : 'Trade Token'}</span>
              </button>
            </div>

            {/* Target URA Endpoint */}
            <div className="p-2.5 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] break-all flex items-start justify-between gap-2">
              <span className="text-amber-400 font-semibold shrink-0">GET</span>
              <span className="flex-1 text-slate-300">{URA_ENDPOINT}</span>
              <button
                onClick={handleCopyUraEndpoint}
                className="p-0.5 hover:text-white transition-colors shrink-0"
                title="Copy URA endpoint"
              >
                {copiedUraUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Required Header:</span>
                <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px] text-rose-700">
                  AccessKey: &lt;BTO_ACCOUNT_KEY&gt;
                </code>
              </div>

              {/* Token exchange output state */}
              {uraTokenData?.success && uraTokenData.token ? (
                <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="text-emerald-800 font-semibold text-xs flex items-center justify-between">
                    <span>Today's Token Active ({uraTokenData.date})</span>
                    <button
                      onClick={handleCopyToken}
                      className="flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 font-mono"
                    >
                      {copiedToken ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedToken ? 'Copied' : 'Copy Token'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-[11px] text-slate-800 mt-1 break-all bg-white p-2 rounded border border-emerald-100">
                    {uraTokenData.token}
                  </div>
                </div>
              ) : (
                <div className="text-[12px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="font-medium text-slate-800">Status: </span>
                  {uraTokenData?.message ||
                    'Ready to trade token. When you configure BTO_ACCOUNT_KEY in Vercel environment variables, clicking Trade Token will retrieve today’s token.'}
                </div>
              )}
            </div>
          </div>

          {/* Requested data.gov.sg Target Endpoint */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              data.gov.sg Datastore Endpoint
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
                  Configured and active. Key is used both as <code>AccessKey</code> for the URA daily token exchange and forwarded to official government data endpoints.
                </span>
              ) : (
                <span>
                  Status:{' '}
                  <span className="font-medium text-slate-800">
                    Awaiting configuration in Vercel.
                  </span>{' '}
                  Add <code className="bg-white px-1 py-0.5 rounded border border-slate-200 font-mono">BTO_ACCOUNT_KEY</code> in Vercel Project Settings &gt; Environment Variables. Both the HDB datastore and URA token exchange routes will automatically use it!
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
              <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] max-h-36 overflow-y-auto">
                <pre>{JSON.stringify(health?.sampleRecords, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            /api/health.js · /api/ura-token.js
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
