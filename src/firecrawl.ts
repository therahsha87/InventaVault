/**
 * ===================================================================================================
 * DO NOT MODIFY THIS FILE. This file is READ ONLY and is DETERMINISTIC.
 * Firecrawl API v1.0 — Multi-Endpoint Proxy Implementation
 * All requests are securely relayed via /api/proxy; no API key is ever exposed client-side.
 * ===================================================================================================
 */

export interface BaseRequest {
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ScrapeRequest extends BaseRequest {
  url: string;
  onlyMainContent?: boolean;
  includeTags?: string[];
  excludeTags?: string[];
  maxAge?: number;
  waitFor?: number;
  mobile?: boolean;
  skipTlsVerification?: boolean;
  parsePDF?: boolean;
  jsonOptions?: {
    schema?: Record<string, any>;
    systemPrompt?: string;
    prompt?: string;
  };
  actions?: Array<{ type: string; milliseconds?: number; selector?: string }>;
  location?: { country?: string; languages?: string[] };
  removeBase64Images?: boolean;
  blockAds?: boolean;
  proxy?: 'basic' | 'stealth' | 'auto';
  storeInCache?: boolean;
  formats?: Array<'markdown' | 'html' | string>;
  changeTrackingOptions?: {
    modes?: string[];
    schema?: Record<string, any>;
    prompt?: string;
    tag?: string | null;
  };
  zeroDataRetention?: boolean;
}

export interface CrawlRequest extends BaseRequest {
    url: string;
    limit?: number;
    exclude?: string[];
    include?: string[];
    maxDepth?: number;
    maxDiscoveryDepth?: number;
    ignoreSitemap?: boolean;
    ignoreQueryParameters?: boolean;
    sameDomain?: boolean;
    crawlEntireDomain?: boolean;
    allowExternalLinks?: boolean;
    allowSubdomains?: boolean;
    delay?: number;
    maxConcurrency?: number;
    webhook?: { url?: string; headers?: Record<string, string>; metadata?: Record<string, any>; events?: string[] };
    scrapeOptions?: {
      onlyMainContent?: boolean;
      includeTags?: string[];
      excludeTags?: string[];
      maxAge?: number;
      headers?: Record<string, string>;
      waitFor?: number;
      mobile?: boolean;
      skipTlsVerification?: boolean;
      timeout?: number;
      parsePDF?: boolean;
      jsonOptions?: { schema?: Record<string, any>; systemPrompt?: string; prompt?: string };
      actions?: Array<{ type: string; milliseconds?: number; selector?: string }>;
      location?: { country?: string; languages?: string[] };
      removeBase64Images?: boolean;
      blockAds?: boolean;
      proxy?: 'basic' | 'stealth' | 'auto';
      storeInCache?: boolean;
      formats?: Array<'markdown' | 'html' | string>;
      changeTrackingOptions?: { modes?: string[]; schema?: Record<string, any>; prompt?: string; tag?: string | null };
    };
    zeroDataRetention?: boolean;
  }

export interface MapRequest extends BaseRequest {
  url: string;
  search?: string;
  ignoreSitemap?: boolean;
  sitemapOnly?: boolean;
  includeSubdomains?: boolean;
  limit?: number; 
  timeout?: number;
}

export interface SearchRequest extends BaseRequest {
  query: string;
  limit?: number;
  tbs?: string;
  location?: string;
  timeout?: number;
  scrapeOptions?: {
    onlyMainContent?: boolean;
    includeTags?: string[];
    excludeTags?: string[];
    maxAge?: number;
    headers?: Record<string, string>;
    waitFor?: number;
    mobile?: boolean;
    skipTlsVerification?: boolean;
    timeout?: number;
    parsePDF?: boolean;
    jsonOptions?: { schema?: Record<string, any>; systemPrompt?: string; prompt?: string };
    actions?: Array<{ type: string; milliseconds?: number; selector?: string }>;
    location?: { country?: string; languages?: string[] };
    removeBase64Images?: boolean;
    blockAds?: boolean;
    proxy?: 'basic' | 'stealth' | 'auto';
    storeInCache?: boolean;
    formats?: Array<'markdown' | 'html' | string>;
    changeTrackingOptions?: { modes?: string[]; schema?: Record<string, any>; prompt?: string; tag?: string | null };
  };
}

export interface ScrapeResponse {
  success: boolean;
  data?: {
    markdown?: string;
    html?: string;
    rawHtml?: string;
    screenshot?: string;
    links?: string[];
    actions?: {
      screenshots?: string[];
      scrapes?: Array<{ url: string; html: string }>;
      javascriptReturns?: Array<{ type: string; value: any }>;
      pdfs?: string[];
    };
    metadata?: {
      title?: string;
      description?: string;
      language?: string;
      sourceURL?: string;
      [k: string]: any;
      statusCode?: number;
      error?: string;
    };
    llm_extraction?: Record<string, any>;
    warning?: string;
    changeTracking?: {
      previousScrapeAt?: string;
      changeStatus?: string;
      visibility?: string;
      diff?: string;
      json?: Record<string, any>;
    };
  };
}

export interface CrawlResponse {
    success: boolean;
    id?: string;
    url?: string;
    data?: {
      urls?: string[];
      markdowns?: string[];
      metadata?: { [key: string]: any };
      error?: string;
    };
  }

export interface MapResponse {
  success: boolean;
  links: string[];
}

export interface SearchResponse {
  success: boolean;
  data?: Array<{
    title?: string;
    description?: string;
    url?: string;
    markdown?: string;
    html?: string;
    rawHtml?: string;
    links?: string[];
    screenshot?: string;
    metadata?: { title?: string; description?: string; sourceURL?: string; statusCode?: number; error?: string };
  }>;
  warning?: string;
}


const BASE_URL = 'api.firecrawl.dev';

async function proxyApiCall<T extends BaseRequest, R>(
  endpoint: string,
  input: T
): Promise<R> {
  const fetchOptions: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      protocol: 'https',
      origin: BASE_URL,
      path: `/v1/${endpoint}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer secret_cm915vzjr00013b6rmj98vuwn`, // SERVER KEY ONLY
      },
      body: input ? JSON.stringify(input) : undefined,
    }),
  };
  const res = await fetch('/api/proxy', fetchOptions);
  try {
    const data = await res.json();
    return data as R;
  } catch {
    return { success: false } as R;
  }
}

/**
 * Scrape and extract content from any public web page or PDF. Returns content, screenshots, metadata, and more.
 * All fields optional except url. See ScrapeRequest/Response for available fields.
 */
export async function scrapeUrl(input: ScrapeRequest): Promise<ScrapeResponse> {
  if (!input?.url || typeof input.url !== 'string' || !input.url.trim()) {
    throw new Error('url is required and must be a non-empty string');
  }

  return await proxyApiCall('scrape', {
    ...input,
    onlyMainContent: input.onlyMainContent ?? true,
    timeout: input.timeout ?? 60000,
  });
}

/**
 * Crawl a website starting from a URL, collecting multiple pages.
 * All fields optional except url. See CrawlRequest/Response for available fields.
 */
export async function crawlUrl(input: CrawlRequest): Promise<CrawlResponse> {
  if (!input?.url || typeof input.url !== 'string' || !input.url.trim()) {
    throw new Error('url is required and must be a non-empty string');
  }

  return await proxyApiCall('crawl', {
    ...input,
    timeout: input.timeout ?? 60000,
  });
}

/**
 * Generate a sitemap from a starting URL.
 * All fields optional except url. See MapRequest/Response for available fields.
 */
export async function mapUrl(input: MapRequest): Promise<MapResponse> {
  if (!input?.url || typeof input.url !== 'string' || !input.url.trim()) {
    throw new Error('url is required and must be a non-empty string');
  }

  return await proxyApiCall('map', {
    ...input,
    timeout: input.timeout ?? 60000,
  });
}

/**
 * Search indexed content based on a query.
 * All fields optional except query. See SearchRequest/Response for available fields.
 */
export async function searchUrl(input: SearchRequest): Promise<SearchResponse> {
  if (!input?.query || typeof input.query !== 'string' || !input.query.trim()) {
    throw new Error('query is required and must be a non-empty string');
  }

  return await proxyApiCall('search', {
    ...input,
    timeout: input.timeout ?? 60000,
  });
}