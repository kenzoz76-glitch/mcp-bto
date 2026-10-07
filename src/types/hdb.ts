export interface HDBRecord {
  _id: number;
  month: string;
  town: string;
  flat_type: string;
  block: string;
  street_name: string;
  storey_range: string;
  floor_area_sqm: string;
  flat_model: string;
  lease_commence_date: string;
  remaining_lease: string;
  resale_price: string;
  resale_price_num: number;
  floor_area_sqm_num: number;
  floor_area_sqft_num: number;
  psm: number;
  psf: number;
  remaining_years: number;
  isMillionDollar: boolean;
}

export interface ApiHealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  healthy: boolean;
  latencyMs: number;
  dataset: string;
  resourceId: string;
  targetUrl: string;
  btoAccountKeyConfigured: boolean;
  totalRecordsAvailable?: number;
  sampleRecordsCount?: number;
  sampleRecords?: any[];
  timestamp: string;
  error?: string;
  version?: string;
}

export interface FilterState {
  town: string;
  flatType: string;
  query: string;
  sortBy: '_id desc' | '_id asc' | 'resale_price desc' | 'resale_price asc' | 'remaining_lease desc';
  minPrice?: number;
  maxPrice?: number;
}
