// Salesforce auth is centralized in ./sfAuth — self-healing client-credentials
// flow in production (auto-refreshes its own token), static SF_ACCESS_TOKEN for
// local dev. The helpers below keep their original signatures (some callers pass
// access_token / instance_url) but all network calls now go through `sfApi`, so
// they re-fetch the token automatically on a 401.

import { getToken as sfGetToken, sfApi } from './sfAuth'

interface SalesforceTokenResponse {
  access_token: string
  instance_url: string
}

// Re-exported so existing importers (`import { getToken } from '@/lib/salesforce'`)
// keep working. Delegates to the self-healing sfAuth token.
export async function getToken(): Promise<SalesforceTokenResponse> {
  return sfGetToken()
}

export interface ContactPayload {
  firstName: string
  lastName: string
  email: string
  phone: string
  street1: string
  street2?: string
  city: string
  state?: string
  postalCode: string
  country: string
  spouseFirstName?: string
  spouseLastName?: string
  authorizedUsers?: Array<{
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
  }>
  nameOnCard: string
  // Authorize.net IDs
  authnetCustomerProfileId: string
  authnetPaymentProfileId: string
  authnetTransactionId: string
  // Card details
  cardBrand?: string
  cardLast4?: string
  cardExpMonth?: number
  cardExpYear?: number
}

export interface SalesforceResult {
  contactId: string
  membershipId: string
  savedCardId: string
  cruzyMemberId: string
}

// NOTE: the `accessToken` / `instanceUrl` params are kept for signature
// compatibility with existing callers but are no longer used — auth and the
// instance URL are handled inside `sfApi` (./sfAuth), which is self-healing.
export async function sfPost(
  _accessToken: string,
  _instanceUrl: string,
  sobject: string,
  body: Record<string, unknown>
): Promise<{ id: string }> {
  const res = await sfApi(`/services/data/v66.0/sobjects/${sobject}`, {
    method: 'POST',
    body,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`SF ${sobject} create failed: ${err}`)
  }

  return res.json()
}

export async function sfQuery<T = Record<string, unknown>>(
  _accessToken: string,
  _instanceUrl: string,
  soql: string
): Promise<T[]> {
  const res = await sfApi(
    `/services/data/v66.0/query?q=${encodeURIComponent(soql)}`
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`SF query failed: ${err}`)
  }

  const data = (await res.json()) as { records: T[] }
  return data.records
}

// Return the active picklist values for a field, in the order defined in Setup.
export async function sfPicklistValues(
  _accessToken: string,
  _instanceUrl: string,
  sobject: string,
  field: string
): Promise<string[]> {
  const res = await sfApi(
    `/services/data/v66.0/sobjects/${sobject}/describe`
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`SF describe ${sobject} failed: ${err}`)
  }

  const data = (await res.json()) as {
    fields: Array<{ name: string; picklistValues?: Array<{ value: string; active: boolean }> }>
  }
  const f = data.fields.find((x) => x.name === field)
  return (f?.picklistValues || []).filter((v) => v.active).map((v) => v.value)
}

export async function pushToSalesforce(payload: ContactPayload): Promise<SalesforceResult> {
  const { access_token, instance_url } = await getToken()

  // access_token / instance_url retained for the sfPost calls' signatures; the
  // actual auth + self-healing happens inside sfApi.
  void access_token
  void instance_url

  const mailingStreet = [payload.street1, payload.street2].filter(Boolean).join('\n')
  const spouseName = [payload.spouseFirstName, payload.spouseLastName].filter(Boolean).join(' ')
  const today = new Date().toISOString().split('T')[0]

  // ── 1. Create Contact ──────────────────────────────────────────────────────
  const contactBody: Record<string, unknown> = {
    FirstName: payload.firstName,
    LastName: payload.lastName,
    Email: payload.email,
    Phone: payload.phone,
    MailingStreet: mailingStreet,
    MailingCity: payload.city,
    MailingState: payload.state || '',
    MailingPostalCode: payload.postalCode,
    MailingCountry: payload.country,
    Spouse_Significant_Other__c: spouseName || '',
    Cruzy_Plus_Enrolled__c: true,
    Authnet_Customer_Profile_ID__c: payload.authnetCustomerProfileId,
    Authnet_Transaction_ID__c: payload.authnetTransactionId,
    Authnet_Payment_Profile_ID__c: payload.authnetPaymentProfileId,
    Customer_Source__c: 'Website',
  }

  let contactResult: { id: string }
  try {
    contactResult = await sfPost(access_token, instance_url, 'Contact', contactBody)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    // Some Salesforce profiles cannot write Mailing* fields. Retry with a
    // reduced payload so signup can still create the Contact + Membership.
    if (message.includes('INVALID_FIELD_FOR_INSERT_UPDATE')) {
      const fallbackContactBody: Record<string, unknown> = {
        FirstName: payload.firstName,
        LastName: payload.lastName,
        Email: payload.email,
        Phone: payload.phone,
        Spouse_Significant_Other__c: spouseName || '',
        Cruzy_Plus_Enrolled__c: true,
        Authnet_Customer_Profile_ID__c: payload.authnetCustomerProfileId,
        Authnet_Transaction_ID__c: payload.authnetTransactionId,
        Authnet_Payment_Profile_ID__c: payload.authnetPaymentProfileId,
        Customer_Source__c: 'Website',
      }
      contactResult = await sfPost(access_token, instance_url, 'Contact', fallbackContactBody)
    } else {
      throw err
    }
  }
  const contactId = contactResult.id

  // ── 2. Generate Cruzy Member ID & Create Membership__c ─────────────────────
  // Format: CRUZY-YYYYMMDD-XXXX (date + last 4 of Stripe customer ID)
  const datePart = today.replace(/-/g, '')
  const idSuffix = payload.authnetCustomerProfileId.slice(-6).toUpperCase()
  const cruzyMemberId = `CRUZY-${datePart}-${idSuffix}`

  // Expiration = 1 year from today
  const expDate = new Date()
  expDate.setFullYear(expDate.getFullYear() + 1)
  const expirationDate = expDate.toISOString().split('T')[0]

  // Next billing = 1 year from today
  const nextBilling = expirationDate

  const membershipBody: Record<string, unknown> = {
    Name: cruzyMemberId,
    Contact__c: contactId,
    Status__c: 'Active',
    Enroll_Date__c: today,
    Expiration_Date__c: expirationDate,
    Next_Billing_Date__c: nextBilling,
    Auto_Renewal__c: true,
    Partner__c: 'Cruzy+',
    Authorized_User__c: payload.authorizedUsers?.length
      ? payload.authorizedUsers
          .map((u) => [u.firstName, u.lastName].filter(Boolean).join(' '))
          .filter(Boolean)
          .join(', ')
      : '',
  }

  const membershipResult = await sfPost(access_token, instance_url, 'Membership__c', membershipBody)

  // Update Contact with the generated member number
  await sfApi(`/services/data/v66.0/sobjects/Contact/${contactId}`, {
    method: 'PATCH',
    body: { Cruzy_Plus_MBR_Number__c: cruzyMemberId },
  })

  // ── 3. Create Saved_Card__c ────────────────────────────────────────────────
  const cardBrand = payload.cardBrand || 'Unknown'
  const last4 = payload.cardLast4 || '????'

  const savedCardBody: Record<string, unknown> = {
    Name: `${cardBrand} •••• ${last4}`,
    Contact__c: contactId,
    Card_Brand__c: cardBrand,
    Last_Four__c: last4,
    Expiry_Month__c: payload.cardExpMonth || null,
    Expiry_Year__c: payload.cardExpYear || null,
    Cardholder_Name__c: payload.nameOnCard,
    Is_Default__c: true,
    Authnet_Payment_Profile_Id__c: payload.authnetPaymentProfileId,
  }

  const savedCardResult = await sfPost(access_token, instance_url, 'Saved_Card__c', savedCardBody)

  return {
    contactId,
    membershipId: membershipResult.id,
    savedCardId: savedCardResult.id,
    cruzyMemberId,
  }
}
