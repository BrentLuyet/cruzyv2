# Cruzy Portal — Salesforce Authentication (read me first)

The portal reads/writes Salesforce (Contacts, Memberships, Bookings, Rewards,
Saved Cards) for the customer login experience. **All Salesforce auth lives in
one file: `lib/sfAuth.ts`.** The data helpers (`lib/sfPortal.ts`,
`lib/salesforce.ts`) just call `sfApi(path, init)` from it.

## Status: DONE and tested ✅

Auth is fully built, configured, and verified end-to-end against cruzy-prod
(client-credentials token issued, Contact + custom-object reads succeed, portal
login flow runs). Nothing else to configure — just set the env vars below.

## How auth works (self-healing — nothing to babysit)

The cruzy-prod org permits exactly one server-to-server auth method: an
**External Client App** using the **OAuth client-credentials flow**. (SOAP login
and classic Connected Apps are both disabled org-wide.) `sfAuth.ts` POSTs the
app's Consumer Key + Secret to the org token endpoint, caches the access token,
and **auto-fetches a new one whenever one expires** (on any `401`). No tokens to
paste, nothing that "dies" — this replaced the old hand-pasted `SF_ACCESS_TOKEN`.

## What's set up in Salesforce (done — do not rebuild)

- **External Client App:** `Cruzy Portal` — client-credentials flow enabled.
- **Run-as user:** `cruzy.portal.integration@cruzy.com.prod` — dedicated service
  user. It is on a **full Salesforce license** (one of your spare, already-paid
  seats — **$0 extra**). NOTE: it must be a full Salesforce license, NOT the free
  "Salesforce Integration" license — the free one cannot read the **Contact**
  object, which the portal needs for login.
- **Permissions:** the `Cruzy Portal Access` permission set (Salesforce-license
  bound) grants read/write on the 5 objects + fields the portal uses.
- **My Domain:** `https://power-connect-2340.my.salesforce.com`

## Production setup — set three env vars

```
SF_CLIENT_ID      = <Consumer Key of the "Cruzy Portal" External Client App>
SF_CLIENT_SECRET  = <its Consumer Secret>
SF_INSTANCE_URL   = https://power-connect-2340.my.salesforce.com
```

The Consumer Key is in `.env.example`. The Consumer Secret already exists — it's
saved in the previous portal copy at `cruzy-demo/website/portal/.env.local`
(`SF_CLIENT_SECRET`). If it's ever lost, an admin can re-reveal it: Setup →
External Client App Manager → Cruzy Portal → Settings → OAuth Settings → Consumer
Key and Secret → Reveal.

Deploy with those three vars set, from any host — no IP allowlisting, no security
token, nothing expires.

## Local development

```bash
cp .env.example .env.local
# put the real SF_CLIENT_ID / SF_CLIENT_SECRET / SF_INSTANCE_URL in .env.local, then:
npm install && npm run dev      # http://localhost:3000
# (Local-only alternative: SF_ACCESS_TOKEN + SF_INSTANCE_URL from `sf org display --verbose`.)
```

## Verified

- `npx tsc --noEmit` → clean.
- Client-credentials token issued as the run-as service user.
- Token reads Contact + Booking__c + Membership__c + Reward__c + Saved_Card__c.
- Portal run locally against cruzy-prod: `/api/auth/login` executes the real
  Contact lookup through `sfApi` and returns correctly.
