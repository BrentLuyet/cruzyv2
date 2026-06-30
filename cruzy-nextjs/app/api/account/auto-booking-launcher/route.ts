import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { determineSiid, buildBookingToken, hasActiveMembership } from '@/lib/bookingSso'
import { findContactById, getContactMemberships, resolveAccountContext } from '@/lib/sfPortal'

type Membership = {
  Name?: string | null
  Status__c?: string | null
  Partner__c?: string | null
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function redirectTo(req: NextRequest, path: string) {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'portal.cruzyv2.luyetcompanies.com'
  return NextResponse.redirect(`https://${host}${path}`)
}

function isActiveMembership(m: Membership): boolean {
  const s = (m.Status__c || '').toLowerCase()
  return s === 'active' || s === 'trial'
}

function pickPartnerForBooking(primaryContact: { Cruzy_Plus_MBR_Number__c?: string | null }, memberships: Membership[]): string | null {
  const active = memberships.filter(isActiveMembership)
  if (active.length === 0) return memberships[0]?.Partner__c || null

  // Prefer the active membership matching the user's current membership number.
  const memberNumber = (primaryContact.Cruzy_Plus_MBR_Number__c || '').trim()
  if (memberNumber) {
    const byMemberNumber = active.find((m) => (m.Name || '').trim() === memberNumber)
    if (byMemberNumber?.Partner__c) return byMemberNumber.Partner__c
  }

  return active[0]?.Partner__c || memberships[0]?.Partner__c || null
}

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('cruzy_session')?.value
    if (!sessionCookie) {
      return redirectTo(req, '/login')
    }

    const payload = verifyToken(sessionCookie)
    if (!payload) {
      return redirectTo(req, '/login')
    }

    const ctx = await resolveAccountContext(payload.contactId)
    const [primaryContact, memberships] = await Promise.all([
      findContactById(ctx.primaryContactId),
      getContactMemberships(ctx.primaryContactId),
    ])

    if (!primaryContact) {
      return redirectTo(req, '/account')
    }

    if (!hasActiveMembership(memberships)) {
      return redirectTo(req, '/account')
    }

    const partner = pickPartnerForBooking(primaryContact, memberships)
    const siid = determineSiid(partner)
    const token = buildBookingToken(primaryContact)

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Launching Booking...</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f5f7fa; color: #1a2b4a;">
  <div style="max-width: 720px; margin: 80px auto; text-align: center;">
    <h2 style="margin: 0 0 12px;">Launching booking...</h2>
    <p style="margin: 0; color: #5f6b7a;">You are being redirected to the booking system.</p>
  </div>
  <form id="autoBookForm" action="https://book.cruzy.com/web/customer-sso/login?siid=${encodeURIComponent(String(siid))}" method="POST">
    <input type="hidden" name="cust_token" value="${escapeHtml(token)}">
  </form>
  <script>document.getElementById('autoBookForm')?.submit();</script>
</body>
</html>`

    return new NextResponse(html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
      },
    })
  } catch (err) {
    console.error('Auto-booking launcher error:', err)
    return redirectTo(req, '/account')
  }
}
