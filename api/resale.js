/**
 * HDB Resale transactions search & filter API endpoint
 * Proxies to data.gov.sg CKAN datastore with caching and enrichment
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const resourceId = 'd_8b84c4ee58e3cfc0ece0d773c8ca6abc';
  const urlParams = new URLSearchParams();
  urlParams.set('resource_id', resourceId);

  // Pagination
  const limit = Math.min(Math.max(parseInt(req.query.limit || '25', 10), 1), 100);
  const offset = Math.max(parseInt(req.query.offset || '0', 10), 0);
  urlParams.set('limit', String(limit));
  urlParams.set('offset', String(offset));

  // Sort
  const sort = req.query.sort || '_id desc';
  urlParams.set('sort', sort);

  // Search keyword (q)
  if (req.query.q && typeof req.query.q === 'string' && req.query.q.trim()) {
    urlParams.set('q', req.query.q.trim());
  }

  // Filters (CKAN datastore json filters)
  const filterObj = {};
  if (req.query.town && req.query.town !== 'ALL') {
    filterObj.town = req.query.town.toUpperCase();
  }
  if (req.query.flat_type && req.query.flat_type !== 'ALL') {
    filterObj.flat_type = req.query.flat_type.toUpperCase();
  }
  if (req.query.month) {
    filterObj.month = req.query.month;
  }

  if (Object.keys(filterObj).length > 0) {
    urlParams.set('filters', JSON.stringify(filterObj));
  }

  const btoAccountKey = process.env.BTO_ACCOUNT_KEY || process.env.DATA_GOV_SG_API_KEY || '';
  const headers = {
    'Accept': 'application/json',
    'User-Agent': 'HDB-Resale-Tracker/1.0',
  };
  if (btoAccountKey) {
    headers['x-api-key'] = btoAccountKey;
    headers['Authorization'] = `Bearer ${btoAccountKey}`;
  }

  const targetUrl = `https://data.gov.sg/api/action/datastore_search?${urlParams.toString()}`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        error: `data.gov.sg returned error: ${errText.slice(0, 300)}`,
        success: false,
      });
    }

    const data = await response.json();
    const rawRecords = data?.result?.records || [];
    const total = data?.result?.total || 0;

    // Enrich records with calculated fields: psf, psm, numeric price, remaining lease years
    const enrichedRecords = rawRecords.map((r) => {
      const price = parseFloat(r.resale_price) || 0;
      const sqm = parseFloat(r.floor_area_sqm) || 1;
      const sqft = sqm * 10.7639;
      const psm = Math.round(price / sqm);
      const psf = Math.round(price / sqft);

      // Remaining lease calculation (e.g. "61 years 04 months" or "61 years" or numeric)
      let remainingYears = 0;
      if (typeof r.remaining_lease === 'string') {
        const match = r.remaining_lease.match(/(\d+)\s*years?/i);
        if (match) {
          remainingYears = parseInt(match[1], 10);
        }
      } else if (typeof r.remaining_lease === 'number') {
        remainingYears = r.remaining_lease;
      }

      return {
        ...r,
        resale_price_num: price,
        floor_area_sqm_num: sqm,
        floor_area_sqft_num: Math.round(sqft),
        psm,
        psf,
        remaining_years: remainingYears,
        isMillionDollar: price >= 1000000,
      };
    });

    // Optional client-side price filter if min_price or max_price were provided
    let filteredRecords = enrichedRecords;
    if (req.query.min_price) {
      const minP = parseFloat(req.query.min_price);
      if (!isNaN(minP)) {
        filteredRecords = filteredRecords.filter((r) => r.resale_price_num >= minP);
      }
    }
    if (req.query.max_price) {
      const maxP = parseFloat(req.query.max_price);
      if (!isNaN(maxP)) {
        filteredRecords = filteredRecords.filter((r) => r.resale_price_num <= maxP);
      }
    }

    // Set cache headers (5 minutes cache)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');

    return res.status(200).json({
      success: true,
      total,
      limit,
      offset,
      count: filteredRecords.length,
      records: filteredRecords,
      filters: filterObj,
      sort,
      query: req.query.q || '',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to query HDB datastore',
    });
  }
}
