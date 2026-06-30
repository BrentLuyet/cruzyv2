// Salesforce helpers for the customer portal.
// All auth is centralized in ./sfAuth — every call goes through `sfApi`, which
// uses the self-healing client-credentials flow and re-fetches its token on 401.

import { sfApi } from './sfAuth'

async function sfFetch(path: string, method = 'GET', body?: Record<string, unknown>) {
  const res = await sfApi(`/services/data/v62.0${path}`, { method, body })
  if (!res.ok && res.status !== 204) {
    const err = await res.text()
    throw new Error(`SF ${method} ${path} failed (${res.status}): ${err}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export async function findContactByEmail(email: string) {
  const q = encodeURIComponent(
    `SELECT Id, FirstName, LastName, Email, Phone, Cruzy_Plus_MBR_Number__c, VIFP_Level__c, Portal_Status__c, Portal_Password_Hash__c, Portal_Last_Login__c, Portal_Login_Count__c FROM Contact WHERE Email = '${email}' LIMIT 1`
  )
  const data = await sfFetch(`/query/?q=${q}`)
  return data?.records?.[0] ?? null
}

export async function findContactById(id: string) {
  const q = encodeURIComponent(
    `SELECT Id, FirstName, LastName, Email, Phone, MailingStreet, MailingCity, MailingState, MailingPostalCode, MailingCountry, Cruzy_Plus_MBR_Number__c, VIFP_Level__c, Portal_Status__c, Portal_Last_Login__c, Portal_Login_Count__c, Cruzy_Plus_Enrolled__c FROM Contact WHERE Id = '${id}' LIMIT 1`
  )
  const data = await sfFetch(`/query/?q=${q}`)
  return data?.records?.[0] ?? null
}

export async function findContactByResetToken(token: string) {
  const q = encodeURIComponent(
    `SELECT Id, Email, FirstName, Portal_Reset_Expiry__c FROM Contact WHERE Portal_Reset_Token__c = '${token}' LIMIT 1`
  )
  const data = await sfFetch(`/query/?q=${q}`)
  return data?.records?.[0] ?? null
}

export async function updateContact(id: string, fields: Record<string, unknown>) {
  return sfFetch(`/sobjects/Contact/${id}`, 'PATCH', fields)
}

export async function getContactMemberships(contactId: string) {
  const q = encodeURIComponent(
    `SELECT Id, Name, Status__c, Enroll_Date__c, Expiration_Date__c, Next_Billing_Date__c, Auto_Renewal__c, Partner__c, Biennial__c FROM Membership__c WHERE Contact__c = '${contactId}' ORDER BY Enroll_Date__c DESC`
  )
  const data = await sfFetch(`/query/?q=${q}`)
  return data?.records ?? []
}

export async function getContactBookings(contactId: string) {
  // Quotes (Status__c = 'Quote') are intentionally excluded from the portal —
  // customers should only see actual bookings, not sales quotes.
  const q = encodeURIComponent(
    `SELECT Id, Name, Status__c, Ship__c, Itinerary__c, Departure_Date__c, Departure_Port__c, Cabin_Category__c, PAX_Count__c, Original_Cruise_Total__c, Current_Balance_Due__c FROM Booking__c WHERE Contact__c = '${contactId}' AND Status__c != 'Quote' ORDER BY Departure_Date__c DESC LIMIT 20`
  )
  const data = await sfFetch(`/query/?q=${q}`)
  return data?.records ?? []
}

export async function getContactRewards(contactId: string) {
  const q = encodeURIComponent(
    `SELECT Id, Name, Status__c, Reward_Number__c, Reward_Location__c, Issue_Date__c, Book_By_Date__c, Expiration_Date__c, Partner__c FROM Reward__c WHERE Contact__c = '${contactId}' ORDER BY Expiration_Date__c ASC`
  )
  const data = await sfFetch(`/query/?q=${q}`)
  return data?.records ?? []
}

export async function getContactSavedCards(contactId: string) {
  const q = encodeURIComponent(
    `SELECT Id, Name, Card_Brand__c, Last_Four__c, Expiry_Month__c, Expiry_Year__c, Is_Default__c FROM Saved_Card__c WHERE Contact__c = '${contactId}' ORDER BY Is_Default__c DESC`
  )
  const data = await sfFetch(`/query/?q=${q}`)
  return data?.records ?? []
}

// Escape a value for safe embedding in a SOQL string literal.
function soqlEscape(v: string) {
  return v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

export async function getAuthorizedUsers(primaryContactId: string) {
  const q = encodeURIComponent(
    `SELECT Id, Name, Status__c, Invite_Date__c, Invited_By__c, Contact__r.FirstName, Contact__r.LastName, Contact__r.Email, Contact__r.Portal_Status__c FROM Authorized_User__c WHERE Membership__r.Contact__c = '${soqlEscape(primaryContactId)}' ORDER BY Invite_Date__c DESC NULLS LAST`
  )
  const data = await sfFetch(`/query/?q=${q}`)
  return data?.records ?? []
}

// Resolves whose account data to load for a logged-in person. A primary member
// loads their own; an authorized user (with no membership of their own) loads
// the membership they're attached to, so they see the full account.
export async function resolveAccountContext(loggedInContactId: string): Promise<{
  primaryContactId: string
  isAuthorizedUser: boolean
  accountHolderName: string | null
}> {
  const ownMemberships = await getContactMemberships(loggedInContactId)
  if (ownMemberships.length > 0) {
    return { primaryContactId: loggedInContactId, isAuthorizedUser: false, accountHolderName: null }
  }

  const q = encodeURIComponent(
    `SELECT Membership__r.Contact__c, Membership__r.Contact__r.FirstName, Membership__r.Contact__r.LastName FROM Authorized_User__c WHERE Contact__c = '${soqlEscape(loggedInContactId)}' AND Status__c != 'Revoked' ORDER BY Invite_Date__c DESC NULLS LAST LIMIT 1`
  )
  const data = await sfFetch(`/query/?q=${q}`)
  const link = data?.records?.[0]
  const primaryId = link?.Membership__r?.Contact__c
  if (primaryId) {
    const c = link.Membership__r.Contact__r
    const name = c ? `${c.FirstName ?? ''} ${c.LastName ?? ''}`.trim() : null
    return { primaryContactId: primaryId, isAuthorizedUser: true, accountHolderName: name || null }
  }

  return { primaryContactId: loggedInContactId, isAuthorizedUser: false, accountHolderName: null }
}

// Revoke / reactivate / re-send a set-password link for an authorized user,
// via the Apex REST endpoint.
export async function authUserAction(input: {
  action: 'revoke' | 'reactivate' | 'resend'
  authUserId: string
  mode?: 'welcome' | 'reset'
}) {
  const res = await sfApi(`/services/apexrest/cruzy/authorizedUser/`, {
    method: 'POST',
    body: input,
  })
  if (!res.ok) {
    throw new Error(`Action failed (${res.status}): ${await res.text()}`)
  }
  return res.json() as Promise<{ success: boolean; error?: string }>
}

// Invites an authorized user via the Apex REST endpoint so the branded
// welcome / set-password email is sent from Salesforce (the portal app itself
// does not send mail).
export async function inviteAuthorizedUser(input: {
  primaryContactId: string
  firstName: string
  lastName: string
  email: string
  invitedByLabel: string
}) {
  const res = await sfApi(`/services/apexrest/cruzy/authorizedUser/`, {
    method: 'POST',
    body: input,
  })
  if (!res.ok) {
    throw new Error(`Invite failed (${res.status}): ${await res.text()}`)
  }
  return res.json() as Promise<{ success: boolean; authUserId?: string; contactId?: string; error?: string }>
}
