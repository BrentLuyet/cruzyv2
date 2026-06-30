// Centralized Salesforce authentication for the Cruzy customer portal.
//
// cruzy-prod only permits ONE server-to-server auth method: the External Client
// App **OAuth client-credentials flow** (SOAP login and legacy Connected Apps are
// disabled org-wide). The portal exchanges a Consumer Key + Secret for a fresh
// access token, and re-fetches automatically whenever a token expires — fully
// self-healing, nothing to paste, nothing that "dies".
//
// Set these in the environment (see SALESFORCE_AUTH.md):
//   • SF_CLIENT_ID       — the "Cruzy Portal" External Client App Consumer Key
//   • SF_CLIENT_SECRET   — that app's Consumer Secret
//   • SF_INSTANCE_URL    — the org My Domain, e.g. https://power-connect-2340.my.salesforce.com
//
// Local-dev fallback (no app needed): SF_ACCESS_TOKEN + SF_INSTANCE_URL — a
// static token from `sf org display --verbose`. Expires; fine for local work.

interface SfSession {
  access_token: string
  instance_url: string
}

// Reused across requests in the same server process; cleared on 401 (see sfApi).
let cached: SfSession | null = null

// Client-credentials token request. MUST hit the org My Domain, not login.salesforce.com.
async function clientCredentialsLogin(): Promise<SfSession> {
  const instanceUrl = (process.env.SF_INSTANCE_URL || '').replace(/\/$/, '')
  if (!instanceUrl) throw new Error('SF_INSTANCE_URL is required for client-credentials auth')

  const res = await fetch(`${instanceUrl}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.SF_CLIENT_ID || '',
      client_secret: process.env.SF_CLIENT_SECRET || '',
    }).toString(),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.access_token) {
    throw new Error(
      `Salesforce client-credentials auth failed: ${data.error || res.status} ` +
        `${data.error_description || ''}`.trim()
    )
  }
  return { access_token: data.access_token, instance_url: data.instance_url || instanceUrl }
}

// Returns a usable session, fetching (and caching) a token on first use.
export async function getToken(): Promise<SfSession> {
  if (cached) return cached

  // Production: self-healing client-credentials flow (the only one this org allows).
  if (process.env.SF_CLIENT_ID && process.env.SF_CLIENT_SECRET) {
    cached = await clientCredentialsLogin()
    return cached
  }

  // Local-dev fallback: static CLI session token.
  if (process.env.SF_ACCESS_TOKEN && process.env.SF_INSTANCE_URL) {
    cached = {
      access_token: process.env.SF_ACCESS_TOKEN,
      instance_url: process.env.SF_INSTANCE_URL,
    }
    return cached
  }

  throw new Error(
    'Salesforce auth not configured. Set SF_CLIENT_ID + SF_CLIENT_SECRET + SF_INSTANCE_URL ' +
      '(production) or SF_ACCESS_TOKEN + SF_INSTANCE_URL (local dev).'
  )
}

// Drop the cached session so the next getToken() fetches a fresh token.
export function invalidateToken(): void {
  cached = null
}

// True when we can mint a new token on our own (so a 401 is safe to retry).
function canReauth(): boolean {
  return Boolean(process.env.SF_CLIENT_ID && process.env.SF_CLIENT_SECRET)
}

// Authenticated Salesforce REST call. `path` is everything after the instance
// url, e.g. `/services/data/v62.0/query/?q=...`. On 401 / expired token it
// fetches a fresh token once and retries — this is what makes the portal self-healing.
export async function sfApi(
  path: string,
  init: { method?: string; body?: unknown } = {}
): Promise<Response> {
  const send = async (): Promise<Response> => {
    const { access_token, instance_url } = await getToken()
    return fetch(`${instance_url}${path}`, {
      method: init.method || 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    })
  }

  let res = await send()
  if (res.status === 401 && canReauth()) {
    invalidateToken()
    res = await send()
  }
  return res
}
