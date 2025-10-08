/**
 * ================================================================================
 * DONOT MODIFY THIS FILE. This file is READ ONLY and is DETERMINISTIC.
 *
 * Talent Protocol API Service — Strict, Explicit, and Typed API
 *
 * ALL requests MUST include `id` and `account_source` where applicable (no defaults).
 * ALL polling logic must use provided status functions if `calculating_score` is true.
 * Only exported functions are public API for use; all others are private.
 * DO NOT alter the file or function contracts.
 * Any changes void determinism, auditability, and may break system contracts.
 * ================================================================================
 */

import axios from 'axios';

// Common Types
export type AccountSource = 'wallet' | 'farcaster' | 'github';

// Builder Profile Type
export interface BuilderProfile {
  id: string;
  uuid: string;
  display_name: string | null;
  username?: string;
  bio?: string | null;
  image_url?: string | null;
  location?: string | null;
  tags?: string[];
  score?: {
    points: number;
    last_calculated_at: string;
  };
  rank?: number;
  humanCheckmark?: boolean;
  accounts?: Account[];
  primary_account?: {
    identifier: string;
    source: AccountSource;
  };
  created_at?: string;
  calculating_score?: boolean;
  onchain?: boolean;
  verified_nationality?: boolean;
  name?: string | null;
  ens?: string | null;
  onchain_since?: string | null;
}

// Score Types
export interface ScoreRequest {
  id: string;
  account_source: AccountSource;
}

export interface ScoreResponse {
  score: {
    points: number;
    last_calculated_at: string;
    calculating_score?: boolean;
  };
}

// Credentials Types
export interface CredentialsRequest {
  id: string;
  account_source: AccountSource;
  slug?: string;
}

export interface Credential {
  category: string;
  data_issuer_name: string;
  data_issuer_slug: string;
  name: string;
  slug: string;
  updated_at: string;
  points: number;
  external_url: string;
  uom: string;
  max_score: number;
  calculating_score: boolean;
}

export interface CredentialsResponse {
  credentials: Credential[];
}

// Account Types
export interface Account {
  identifier: string;
  source: string;
  owned_since: string;
  connected_at: string;
  username: string;
}

export interface AccountResponse {
  accounts: Account[];
}

export interface Social {
  follower_count: string;
  following_count: string;
  location: string;
  owner: string;
  bio: string;
  display_name: string;
  image_url: string;
  name: string;
  owned_since: string;
  profile_url: string;
  source: string;
}

export interface FarcasterScore {
  points: number;
  last_calculated_at: string;
  farcaster_id: string;
}

export interface SearchRequest {
  query: any;
  sort: any;
  page: number;
  per_page: number;
}

export interface SearchResponse {
  profiles: BuilderProfile[];
  pagination: any;
}


// API Configuration
const API_BASE_URL = 'https://api.talentprotocol.com';
const API_KEY = 'b3980faab590aa8def505c785305ee7796902869fbf7d8c663e9ee71b24e';

// Create axios instance with default headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'X-API-KEY': API_KEY,
    'Accept': 'application/json',
  },
});

/**
 * Internal utility: throws if response has any error or API-side validation issue.
 */
function _throwIfError(res: any) {
    if (!res) throw new Error('No response from Talent Protocol API');
    if (res.error) throw new Error(`API Error: ${res.error}`);
    if (res.data && typeof res.data === 'object' && !res.data.data && !res.data.profiles && !res.data.profile) {
      throw new Error('Invalid response format');
    }
  }

/**
 * Internal utility: all Talent Protocol API calls must go through this proxy, never called directly from client.
 */

/**
 * Helper to determine best account source for a profile.
 */
function getBestAccountSource(profile: BuilderProfile): { id: string; accountSource: AccountSource } {
  if (profile.primary_account?.identifier && profile.primary_account?.source) {
    return {
      id: profile.primary_account.identifier,
      accountSource: profile.primary_account.source as AccountSource,
    };
  }
  if (profile.accounts && profile.accounts.length > 0) {
    const walletAccount = profile.accounts.find((acc) => acc.source === 'wallet');
    if (walletAccount) {
      return {
        id: walletAccount.identifier,
        accountSource: 'wallet',
      };
    }
    return {
      id: profile.accounts[0].identifier,
      accountSource: profile.accounts[0].source as AccountSource,
    };
  }
  return {
    id: profile.id,
    accountSource: 'wallet',
  };
}

/**
 * Helper to resolve GitHub username to a valid Talent Protocol ID.
 * Uses searchProfiles to find a matching profile, then getBestAccountSource.
 */
async function _resolveGitHubId(username: string, accountSource: AccountSource): Promise<string> {
    if (accountSource !== 'github') return username;
  
    try {
      // Step 1: Search for profile by identity
      const searchResult = await apiClient.get<{
        profiles: BuilderProfile[];
      }>('/search/advanced/profiles', {
        params: {
          query: JSON.stringify({ identity: `github:${username}` }),
          sort: JSON.stringify({ score: { order: 'desc' }, id: { order: 'desc' } }),
          page: 1,
          per_page: 1,
        },
      });
      _throwIfError(searchResult.data);
      console.log('Search result:', searchResult.data); // Debug log
      if (searchResult.data.profiles.length > 0) {
        const { id } = getBestAccountSource(searchResult.data.profiles[0]);
        console.log(`Resolved GitHub username ${username} to ID ${id} via search`);
        return id;
      }
  
      // Step 2: Fallback to /profile if search fails
      console.warn(`No profile found via search for GitHub username ${username}. Trying /profile.`);
      const profileResult = await apiClient.get<{ profile: BuilderProfile }>('/profile', {
        params: { id: username, account_source: 'github' },
      });
      _throwIfError(profileResult.data);
      console.log('Profile result:', profileResult.data); // Debug log
      if (profileResult.data.profile) {
        const { id } = getBestAccountSource(profileResult.data.profile);
        console.log(`Resolved GitHub username ${username} to ID ${id} via profile`);
        return id;
      }
  
      console.warn(`No profile found for GitHub username ${username}. Using original ID.`);
    } catch (error) {
      console.warn(`Failed to resolve GitHub username ${username}: ${error.message}. Using original ID.`);
    }
    return username;
  }

/**
 * ================================================================================
 * THE TALENT PROTOCOL API METHODS
 * ================================================================================
 */

/**
 * Fetch the Builder Score for a user. Requires `id` and `account_source`.
 * @param input - The request object with user ID and account source.
 * @returns The score object with points and last calculated time.
 * @throws Error if id or account_source is missing, or if the API call fails.
 */
/**
 * Helper to resolve GitHub username to a valid Talent Protocol ID.
 * Note: This is a placeholder; implement actual lookup if supported by API.
 */

// Update getBuilderScore to handle GitHub usernames
export async function getBuilderScore(input: ScoreRequest): Promise<ScoreResponse['score']> {
    if (!input.id || !input.account_source)
      throw new Error('id and account_source are REQUIRED');
    let resolvedId = input.id;
    if (input.account_source === 'github' && !/^[0-9a-fA-F]{40}$/.test(input.id)) {
      resolvedId = await _resolveGitHubId(input.id, input.account_source);
    }
    const res = await apiClient.get<ScoreResponse>('/score', {
      params: { id: resolvedId, account_source: input.account_source },
    });
    _throwIfError(res.data);
    return res.data.score;
  }
/**
 *Fetch credentials contributing to a user's score. Requires `id` and `account_source`
 * @param input - The request object with user ID, account source and optional slug..
 * @returns Array of credential details.
 * @throws Error if id or account_source is missing, or if the API call fails.
 */
export async function getCredentials(input: CredentialsRequest): Promise<CredentialsResponse['credentials']> {
    if (!input.id || !input.account_source)
      throw new Error('id and account_source are REQUIRED');
    const res = await apiClient.get<CredentialsResponse>('/credentials', {
      params: input,
    });
    _throwIfError(res.data);
    return res.data.credentials;
  }

/**
 * Fetch connected account data for a user. Requires `id` and `account_source`
 * @param input - The request object with user ID and account source.
 * @returns Array of account details.
 * @throws Error if id or account_source is missing, or if the API call fails.
 */
export async function getAccounts(input: ScoreRequest): Promise<AccountResponse['accounts']> {
    if (!input.id || !input.account_source)
      throw new Error('id and account_source are REQUIRED');
    const res = await apiClient.get<AccountResponse>('/accounts', {
      params: input,
    });
    _throwIfError(res.data);
    return res.data.accounts;
  }

/**
 * Fetch social media profile data for a user. Requires `id` and `account_source`
 * @param input - The request object with user ID and account source.
 * @returns Array of social media profile details.
 * @throws Error if id or account_source is missing, or if the API call fails.
 */
export async function getSocials(input: ScoreRequest): Promise<Social[]> {
    if (!input.id || !input.account_source)
      throw new Error('id and account_source are REQUIRED');
    const res = await apiClient.get<{ socials: Social[] }>('/socials', {
      params: input,
    });
    _throwIfError(res.data);
    return res.data.socials;
  }

/**
 * Fetch Builder Scores for Farcaster users. Requires `fids` array
 * @param fids - The array of Farcaster IDs.
 * @returns Array of Farcaster score details.
 * @throws Error if fids array is missing or empty, or if the API call fails.
 */
export async function getFarcasterScores(fids: string[]): Promise<FarcasterScore[]> {
    if (!fids || fids.length === 0) throw new Error('fids array is REQUIRED');
    if (fids.length > 100)
      throw new Error('Maximum 100 Farcaster IDs per request');
    const res = await apiClient.get<{ scores: FarcasterScore[] }>('/farcaster/scores', {
      params: { fids: fids.join(',') },
    });
    _throwIfError(res.data);
    return res.data.scores;
  }

/**
 * Search for profiles based on filters. Requires `query`, `sort`, `page`, and `per_page`
 * @param input - The request object with query, sort, page, and per_page.
 * @returns The search response object with profiles and pagination.
 * @throws Error if query, sort, page, or per_page is missing, or if the API call fails.
 */
export async function searchProfiles(input: SearchRequest): Promise<SearchResponse> {
    if (!input.query || !input.sort || !input.page || !input.per_page) {
      throw new Error('query, sort, page, and per_page are REQUIRED');
    }
    const res = await apiClient.get<SearchResponse>('/search/advanced/profiles', {
      params: input,
    });
    _throwIfError(res.data);
    return res.data;
  }

/**
 * Poll for score updates if `calculating_score` is true. Throws if no update or failure
 * @param inputs - The array of ScoreRequest objects.
 * @param maxAttempts - The maximum number of attempts to poll.
 * @param intervalMs - The interval in milliseconds between attempts.
 * @returns The array of score objects with points and last calculated time.
 * @throws Error if no update or failure, or if polling times out or fails or the API call fails.
 */
export async function pollBuilderScore(
    inputs: ScoreRequest[],
    maxAttempts = 10,
    intervalMs = 2000
  ): Promise<ScoreResponse['score'][]> {
    let attempts = 0;
    const results: ScoreResponse['score'][] = [];
    while (true) {
      const promises = inputs.map((input) =>
        apiClient.get<ScoreResponse>('/score', { params: input })
      );
      const responses = await Promise.all(promises);
      responses.forEach((res) => _throwIfError(res.data));
      const allCalculated = responses.every((res) => !res.data.score.calculating_score);
      results.push(...responses.map((res) => res.data.score));
      if (allCalculated || attempts > maxAttempts) break;
      await new Promise((r) => setTimeout(r, intervalMs));
      attempts++;
    }
    return results;
  }

/**
 * Fetch a complete builder profile (profile, score, credentials, socials).
 * @param input - The request object with user ID and account source.
 * @returns The profile object with profile, score, credentials, and socials.
 * @throws Error if id or account_source is missing, or if the API call fails.
 */
export async function getFullBuilderProfile(input: ScoreRequest): Promise<{
    profile: BuilderProfile;
    score: ScoreResponse['score'];
    credentials: CredentialsResponse['credentials'];
    socials: Social[];
  }> {
    if (!input.id || !input.account_source)
      throw new Error('id and account_source are REQUIRED');
    let resolvedId = input.id;
    if (input.account_source === 'github' && !/^[0-9a-fA-F]{40}$/.test(input.id)) {
      resolvedId = await _resolveGitHubId(input.id, input.account_source);
    }
    const [profileRes, scoreRes, credsRes, socialsRes] = await Promise.all([
      apiClient.get<{ profile: BuilderProfile }>(`/profile`, {
        params: { id: resolvedId, account_source: input.account_source },
      }),
      apiClient.get<ScoreResponse>('/score', { params: { id: resolvedId, account_source: input.account_source } }),
      apiClient.get<CredentialsResponse>('/credentials', { params: { id: resolvedId, account_source: input.account_source } }),
      apiClient.get<{ socials: Social[] }>('/socials', { params: { id: resolvedId, account_source: input.account_source } }),
    ]);
    _throwIfError(profileRes.data);
    _throwIfError(scoreRes.data);
    _throwIfError(credsRes.data);
    _throwIfError(socialsRes.data);
    return {
      profile: profileRes.data.profile || {},
      score: scoreRes.data.score,
      credentials: credsRes.data.credentials,
      socials: socialsRes.data.socials,
    };
  }
/** Utility helpers */
export const formatBuilderDate = (value: string | number) => {
  const d = new Date(value);
  return isNaN(d.getTime())
    ? 'N/A'
    : d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
};
