import { ApiHealthStatus, FilterState, HDBRecord } from '../types/hdb';
import { RESOURCE_ID } from '../constants/hdb';

export async function fetchApiHealth(): Promise<ApiHealthStatus> {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend /api/health unavailable, pinging data.gov.sg directly', e);
  }

  // Fallback direct check to data.gov.sg
  const start = Date.now();
  const directUrl = `https://data.gov.sg/api/action/datastore_search?resource_id=${RESOURCE_ID}&limit=5`;
  try {
    const directRes = await fetch(directUrl);
    const latencyMs = Date.now() - start;
    if (directRes.ok) {
      const data = await directRes.json();
      return {
        status: 'healthy',
        healthy: true,
        latencyMs,
        dataset: 'HDB Resale Prices (Jan 2017 onwards)',
        resourceId: RESOURCE_ID,
        targetUrl: directUrl,
        btoAccountKeyConfigured: false,
        totalRecordsAvailable: data?.result?.total,
        sampleRecordsCount: data?.result?.records?.length,
        sampleRecords: data?.result?.records,
        timestamp: new Date().toISOString(),
        version: '1.0.0 (Client direct fallback)',
      };
    }
    return {
      status: 'degraded',
      healthy: false,
      latencyMs,
      dataset: 'HDB Resale Prices (Jan 2017 onwards)',
      resourceId: RESOURCE_ID,
      targetUrl: directUrl,
      btoAccountKeyConfigured: false,
      error: `Status: ${directRes.status}`,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return {
      status: 'down',
      healthy: false,
      latencyMs: Date.now() - start,
      dataset: 'HDB Resale Prices (Jan 2017 onwards)',
      resourceId: RESOURCE_ID,
      targetUrl: directUrl,
      btoAccountKeyConfigured: false,
      error: err instanceof Error ? err.message : 'Network error connecting to data.gov.sg',
      timestamp: new Date().toISOString(),
    };
  }
}

export async function fetchResaleTransactions(
  filters: FilterState,
  limit: number = 25,
  offset: number = 0
): Promise<{ records: HDBRecord[]; total: number }> {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  params.set('offset', String(offset));

  if (filters.town && filters.town !== 'ALL') {
    params.set('town', filters.town);
  }
  if (filters.flatType && filters.flatType !== 'ALL') {
    params.set('flat_type', filters.flatType);
  }
  if (filters.query) {
    params.set('q', filters.query);
  }
  if (filters.sortBy) {
    params.set('sort', filters.sortBy);
  }
  if (filters.minPrice) {
    params.set('min_price', String(filters.minPrice));
  }
  if (filters.maxPrice) {
    params.set('max_price', String(filters.maxPrice));
  }

  try {
    const res = await fetch(`/api/resale?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return {
          records: data.records || [],
          total: data.total || 0,
        };
      }
    }
  } catch (err) {
    console.warn('Backend proxy /api/resale failed, attempting direct data.gov.sg fetch...', err);
  }

  // Fallback to direct data.gov.sg fetch
  const directParams = new URLSearchParams();
  directParams.set('resource_id', RESOURCE_ID);
  directParams.set('limit', String(limit));
  directParams.set('offset', String(offset));
  directParams.set('sort', filters.sortBy || '_id desc');

  const filterObj: Record<string, string> = {};
  if (filters.town && filters.town !== 'ALL') filterObj.town = filters.town;
  if (filters.flatType && filters.flatType !== 'ALL') filterObj.flat_type = filters.flatType;
  if (Object.keys(filterObj).length > 0) {
    directParams.set('filters', JSON.stringify(filterObj));
  }
  if (filters.query) {
    directParams.set('q', filters.query);
  }

  const directRes = await fetch(`https://data.gov.sg/api/action/datastore_search?${directParams.toString()}`);
  if (!directRes.ok) {
    throw new Error(`Failed to fetch transactions from data.gov.sg (${directRes.status})`);
  }
  const directData = await directRes.json();
  const rawRecords = directData?.result?.records || [];

  const enriched: HDBRecord[] = rawRecords.map((r: any) => {
    const price = parseFloat(r.resale_price) || 0;
    const sqm = parseFloat(r.floor_area_sqm) || 1;
    const sqft = sqm * 10.7639;
    let remainingYears = 0;
    if (typeof r.remaining_lease === 'string') {
      const m = r.remaining_lease.match(/(\d+)\s*years?/i);
      if (m) remainingYears = parseInt(m[1], 10);
    }
    return {
      ...r,
      resale_price_num: price,
      floor_area_sqm_num: sqm,
      floor_area_sqft_num: Math.round(sqft),
      psm: Math.round(price / sqm),
      psf: Math.round(price / sqft),
      remaining_years: remainingYears,
      isMillionDollar: price >= 1000000,
    };
  });

  return {
    records: enriched,
    total: directData?.result?.total || enriched.length,
  };
}
