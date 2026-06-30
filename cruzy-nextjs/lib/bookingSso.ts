import fs from 'fs'
import jwt from 'jsonwebtoken'

type PortalContact = {
  Id: string
  FirstName?: string | null
  LastName?: string | null
  Email?: string | null
  MailingStreet?: string | null
  MailingCity?: string | null
  MailingState?: string | null
  MailingPostalCode?: string | null
  MailingCountry?: string | null
  Cruzy_Plus_MBR_Number__c?: string | null
}

function resolveSsidValue(envName: string, fallback: number): number {
  const raw = process.env[envName]
  if (!raw) return fallback
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function determineSiid(partner: string | null | undefined): number {
  // Keep defaults aligned with live cruzy_v4 DB defaults (default_variables_odysseus_siid)
  const cruzyPlusSiid = resolveSsidValue('ODYSSEUS_SIID_CRUZY_PLUS', 1291853)
  const loungeSiid = resolveSsidValue('ODYSSEUS_SIID_LOUNGE', 1284314)
  const ascendantSiid = resolveSsidValue('ODYSSEUS_SIID_ASCENDANT', 1284315)
  const travaliaSiid = resolveSsidValue('ODYSSEUS_SIID_TRAVALIA', 1304983)

  const p = (partner || '').toLowerCase().trim()
  if (p === 'holidays lounge' || p === 'hl') return loungeSiid
  if (p === 'ascendant holidays' || p === 'ascendant holiday' || p === 'ascendant' || p === 'asc') return ascendantSiid
  if (p === 'club travalia' || p === 'travalia' || p === 'ct') return travaliaSiid
  if (p === 'cruzy+' || p === 'cruzy plus' || p === 'cruzy') return cruzyPlusSiid
  return cruzyPlusSiid
}

function getPrivateKey(): string {
  const inline = process.env.BOOKING_PRIVATE_KEY_PEM
  if (inline) return inline.replace(/\\n/g, '\n')

  const keyPath = process.env.BOOKING_PRIVATE_KEY_PATH || '/var/HostedWeb/cruzy_v4/storage/keys/cruzyodysol.pem'
  return fs.readFileSync(keyPath, 'utf8')
}

export function buildBookingToken(contact: PortalContact): string {
  const privateKey = getPrivateKey()
  const expiryTime = new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 19)
  const userId = contact.Cruzy_Plus_MBR_Number__c || contact.Id
  const city = (contact.MailingCity || '').trim() || (process.env.BOOKING_DEFAULT_CITY || 'Dallas')
  const state = (contact.MailingState || '').trim() || (process.env.BOOKING_DEFAULT_STATE || 'TX')
  const country = (contact.MailingCountry || '').trim() || (process.env.BOOKING_DEFAULT_COUNTRY || 'US')
  const addr1 = (contact.MailingStreet || '').trim() || (process.env.BOOKING_DEFAULT_ADDR1 || 'Unknown Address')
  const zipcode = (contact.MailingPostalCode || '').trim() || (process.env.BOOKING_DEFAULT_ZIPCODE || '00000')

  const payload = {
    expiry_time: expiryTime,
    ody_sso_redirect: 'https://book.cruzy.com/swift/cruise',
    idle_session_timeout: 120,
    customers: [
      {
        user_id: String(userId),
        first_name: contact.FirstName || '',
        middle_name: '',
        last_name: contact.LastName || '',
        email: contact.Email || '',
        is_primary: 'true',
        address: {
          addr1,
          addr2: '',
          city,
          state,
          country,
          zipcode,
        },
      },
    ],
  }

  return jwt.sign(payload, privateKey, { algorithm: 'RS256' })
}

export function hasActiveMembership(memberships: Array<{ Status__c?: string | null; Next_Billing_Date__c?: string | null; Expiration_Date__c?: string | null }>): boolean {
  const now = new Date()

  return memberships.some((m) => {
    const status = (m.Status__c || '').toLowerCase()
    if (status !== 'active' && status !== 'trial') return false

    const nextBilling = m.Next_Billing_Date__c ? new Date(m.Next_Billing_Date__c) : null
    if (nextBilling && !Number.isNaN(nextBilling.getTime())) return nextBilling >= now

    const expiration = m.Expiration_Date__c ? new Date(m.Expiration_Date__c) : null
    if (expiration && !Number.isNaN(expiration.getTime())) return expiration >= now

    return true
  })
}
