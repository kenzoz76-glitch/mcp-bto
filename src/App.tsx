/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { TransactionCard } from './components/TransactionCard';
import { FilterDrawer } from './components/FilterDrawer';
import { MarketTrends } from './components/MarketTrends';
import { MillionDollarView } from './components/MillionDollarView';
import { SavedFlatsView } from './components/SavedFlatsView';
import { HealthModal } from './components/HealthModal';
import { MortgageModal } from './components/MortgageModal';
import { fetchApiHealth, fetchResaleTransactions } from './services/api';
import { ApiHealthStatus, FilterState, HDBRecord } from './types/hdb';
import { AlertCircle, RefreshCw, ChevronDown, Sparkles, Building2 } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'sg_hdb_saved_flats_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('feed');
  const [filters, setFilters] = useState<FilterState>({
    town: '',
    flatType: '',
    query: '',
    sortBy: '_id desc',
  });

  const [records, setRecords] = useState<HDBRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState<number>(0);

  // API Health state
  const [health, setHealth] = useState<ApiHealthStatus | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState<boolean>(false);

  // Mortgage Calculator modal state
  const [selectedMortgageRecord, setSelectedMortgageRecord] = useState<HDBRecord | null>(null);

  // Saved flats watchlist
  const [savedFlats, setSavedFlats] = useState<HDBRecord[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedFlats));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }, [savedFlats]);

  // Load API Health
  const loadHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const data = await fetchApiHealth();
      setHealth(data);
    } catch (e) {
      console.error('Failed to load health status', e);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  // Load Transactions
  const loadTransactions = useCallback(
    async (currentFilters: FilterState, isAppend: boolean = false) => {
      if (isAppend) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      const currentOffset = isAppend ? offset + 25 : 0;

      try {
        const result = await fetchResaleTransactions(currentFilters, 25, currentOffset);
        if (isAppend) {
          setRecords((prev) => [...prev, ...result.records]);
          setOffset(currentOffset);
        } else {
          setRecords(result.records);
          setOffset(0);
          setTotalCount(result.total);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch HDB transactions');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [offset]
  );

  // Reload transactions when filters change
  useEffect(() => {
    loadTransactions(filters, false);
  }, [filters.town, filters.flatType, filters.query, filters.sortBy]);

  const handleRefresh = async () => {
    await loadHealth();
    await loadTransactions(filters, false);
  };

  const handleToggleSave = (record: HDBRecord) => {
    setSavedFlats((prev) => {
      const exists = prev.some((r) => r._id === record._id);
      if (exists) {
        return prev.filter((r) => r._id !== record._id);
      }
      return [record, ...prev];
    });
  };

  const handleResetFilters = () => {
    setFilters({
      town: '',
      flatType: '',
      query: '',
      sortBy: '_id desc',
    });
  };

  const hasMore = records.length < totalCount;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-20 md:pb-8">
      {/* 3-Zone Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
        healthLoading={healthLoading}
        onOpenHealthModal={() => setIsHealthModalOpen(true)}
        onRefreshData={handleRefresh}
        isRefreshing={loading && !loadingMore}
        savedCount={savedFlats.length}
      />

      {/* Main Body Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-6">
        {/* Context Header */}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider">
              <span>Singapore HDB Resale Market</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500 font-normal">Official Data (Jan 2017 – Present)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              {activeTab === 'feed' && 'Live Transaction Stream'}
              {activeTab === 'explore' && 'Search & Filter HDB Transactions'}
              {activeTab === 'trends' && 'Resale Market Trends & Benchmarks'}
              {activeTab === 'million' && 'Million-Dollar Flat Transactions'}
              {activeTab === 'saved' && 'Your Monitored Watchlist'}
            </h1>
          </div>

          <div className="text-xs text-slate-500">
            {records.length > 0 && (
              <span>
                Showing <strong className="text-slate-900 font-mono">{records.length}</strong> of{' '}
                <strong className="text-slate-900 font-mono">{totalCount.toLocaleString()}</strong> records
              </span>
            )}
          </div>
        </div>

        {/* View Routing */}
        {activeTab === 'feed' || activeTab === 'explore' ? (
          <div>
            {/* Filter & Search Bar */}
            <FilterDrawer
              filters={filters}
              onChangeFilters={setFilters}
              onResetFilters={handleResetFilters}
              totalCount={totalCount}
            />

            {/* Error banner */}
            {error && (
              <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={() => loadTransactions(filters, false)}
                  className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Skeletons while loading */}
            {loading && !loadingMore ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs animate-pulse space-y-3"
                  >
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-6 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="pt-3 border-t border-slate-100 flex justify-between">
                      <div className="h-7 bg-slate-200 rounded w-1/3" />
                      <div className="h-7 bg-slate-100 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : records.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto my-8">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">No Transactions Found</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  No resale transactions matched your query or selected filters. Try broadening your town or flat type criteria.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Transaction Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {records.map((record) => (
                    <TransactionCard
                      key={record._id}
                      record={record}
                      isSaved={savedFlats.some((s) => s._id === record._id)}
                      onToggleSave={handleToggleSave}
                      onOpenMortgage={(rec) => setSelectedMortgageRecord(rec)}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() => loadTransactions(filters, true)}
                      disabled={loadingMore}
                      className="px-6 py-3 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 rounded-xl text-xs font-semibold shadow-xs hover:shadow-sm transition-all disabled:opacity-50 min-h-[44px] inline-flex items-center gap-2"
                    >
                      {loadingMore ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-rose-600" />
                          <span>Loading more transactions...</span>
                        </>
                      ) : (
                        <>
                          <span>Load Next 25 Transactions</span>
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : activeTab === 'trends' ? (
          <MarketTrends
            records={records}
            onSelectTown={(town) => {
              setFilters((prev) => ({ ...prev, town }));
              setActiveTab('explore');
            }}
            onSelectFlatType={(flatType) => {
              setFilters((prev) => ({ ...prev, flatType }));
              setActiveTab('explore');
            }}
          />
        ) : activeTab === 'million' ? (
          <MillionDollarView
            records={records}
            savedFlats={savedFlats}
            onToggleSave={handleToggleSave}
            onOpenMortgage={(rec) => setSelectedMortgageRecord(rec)}
          />
        ) : (
          <SavedFlatsView
            savedFlats={savedFlats}
            onToggleSave={handleToggleSave}
            onOpenMortgage={(rec) => setSelectedMortgageRecord(rec)}
            onClearAll={() => setSavedFlats([])}
            onExplore={() => setActiveTab('explore')}
          />
        )}
      </main>

      {/* Mobile Ergonomic Bottom Tab Bar */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedFlats.length}
      />

      {/* API Diagnostics & Health Modal */}
      <HealthModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        health={health}
        loading={healthLoading}
        onRecheck={loadHealth}
      />

      {/* Mortgage & Loan Calculator Modal */}
      <MortgageModal
        record={selectedMortgageRecord}
        onClose={() => setSelectedMortgageRecord(null)}
      />
    </div>
  );
}
