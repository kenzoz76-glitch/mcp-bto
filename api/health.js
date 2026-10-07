/**
 * Health check endpoint for HDB Resale API
 * Verifies connectivity to data.gov.sg CKAN datastore API
 * Supports optional BTO_ACCOUNT_KEY configured via environment variables
 */

export default async function handler(req, res) {
  // Allow CORS for Vercel / serverless deployments
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const startTime = Date.now();
  const resourceId = 'd_8b84c4ee58e3cfc0ece0d773c8ca6abc';
  const targetUrl = `https://data.gov.sg/api/action/datastore_search?resource_id=${resourceId}&limit=5`;

  const btoAccountKey = process.env.BTO_ACCOUNT_KEY || process.env.DATA_GOV_SG_API_KEY || '';

  const headers = {
    'Accept': 'application/json',
    'User-Agent': 'HDB-Resale-Tracker/1.0',
  };

  if (btoAccountKey) {
    headers['x-api-key'] = btoAccountKey;
    headers['Authorization'] = `Bearer ${btoAccountKey}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        status: 'degraded',
        healthy: false,
        statusCode: response.status,
        latencyMs,
        dataset: 'HDB Resale Prices (Jan 2017 onwards)',
        resourceId,
        targetUrl,
        btoAccountKeyConfigured: Boolean(btoAccountKey),
        error: `Upstream returned status ${response.status}: ${errorText.slice(0, 300)}`,
        timestamp: new Date().toISOString(),
      });
    }

    const data = await response.json();
    const records = data?.result?.records || [];
    const total = data?.result?.total || 0;

    return res.status(200).json({
      status: 'healthy',
      healthy: true,
      latencyMs,
      dataset: 'HDB Resale Prices (Jan 2017 onwards)',
      resourceId,
      targetUrl,
      btoAccountKeyConfigured: Boolean(btoAccountKey),
      totalRecordsAvailable: total,
      sampleRecordsCount: records.length,
      sampleRecords: records,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    return res.status(503).json({
      status: 'down',
      healthy: false,
      latencyMs,
      dataset: 'HDB Resale Prices (Jan 2017 onwards)',
      resourceId,
      targetUrl,
      btoAccountKeyConfigured: Boolean(btoAccountKey),
      error: err instanceof Error ? err.message : 'Unknown error connecting to data.gov.sg',
      timestamp: new Date().toISOString(),
    });
  }
}
