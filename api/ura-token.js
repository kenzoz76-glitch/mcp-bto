/**
 * URA Data Service Daily Token Exchange
 * Trades the BTO_ACCOUNT_KEY (AccessKey) for today's dynamic session token
 * Endpoint: https://eservice.ura.gov.sg/uraDataService/insertNewToken/v1
 * Header: AccessKey: <BTO_ACCOUNT_KEY>
 */

// In-memory cache for today's token
let tokenCache = {
  token: null,
  date: null,
  raw: null,
  fetchedAt: 0,
};

export async function getUraDailyToken(forceRefresh = false) {
  const accessKey = process.env.BTO_ACCOUNT_KEY || process.env.URA_ACCESS_KEY || '';
  const todayStr = new Date().toISOString().split('T')[0];

  // Return cached token if valid for today and not forced refresh
  if (
    !forceRefresh &&
    tokenCache.token &&
    tokenCache.date === todayStr &&
    Date.now() - tokenCache.fetchedAt < 20 * 60 * 60 * 1000 // 20 hours safety margin
  ) {
    return {
      success: true,
      cached: true,
      token: tokenCache.token,
      date: tokenCache.date,
      accessKeyConfigured: true,
      message: 'Token retrieved from daily cache',
      raw: tokenCache.raw,
    };
  }

  if (!accessKey) {
    return {
      success: false,
      cached: false,
      token: null,
      date: todayStr,
      accessKeyConfigured: false,
      message: 'BTO_ACCOUNT_KEY is not configured in Vercel or environment variables.',
      endpoint: 'https://eservice.ura.gov.sg/uraDataService/insertNewToken/v1',
      header: 'AccessKey: <BTO_ACCOUNT_KEY>',
    };
  }

  const endpoint = 'https://eservice.ura.gov.sg/uraDataService/insertNewToken/v1';
  const startTime = Date.now();

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'AccessKey': accessKey.trim(),
        'User-Agent': 'HDB-Resale-Tracker/1.0',
        'Accept': 'application/json',
      },
    });

    const latencyMs = Date.now() - startTime;
    const data = await response.json();

    if (data.Status === 'Success' && data.Result) {
      tokenCache = {
        token: data.Result,
        date: todayStr,
        raw: data,
        fetchedAt: Date.now(),
      };

      return {
        success: true,
        cached: false,
        token: data.Result,
        date: todayStr,
        latencyMs,
        accessKeyConfigured: true,
        message: data.Message || 'Today’s token successfully generated',
        raw: data,
      };
    } else {
      return {
        success: false,
        cached: false,
        token: null,
        date: todayStr,
        latencyMs,
        accessKeyConfigured: true,
        message: data.Message || 'URA service returned non-success response',
        raw: data,
      };
    }
  } catch (error) {
    return {
      success: false,
      cached: false,
      token: null,
      date: todayStr,
      latencyMs: Date.now() - startTime,
      accessKeyConfigured: true,
      message: error instanceof Error ? error.message : 'Failed to connect to URA token service',
    };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccessKey, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const forceRefresh = req.query.refresh === 'true' || req.query.force === 'true';
  const result = await getUraDailyToken(forceRefresh);

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(result);
}
