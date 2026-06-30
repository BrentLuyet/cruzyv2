import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import {
  findContactById,
  getContactMemberships,
  getContactBookings,
  getContactRewards,
  getContactSavedCards,
  resolveAccountContext,
} from '@/lib/sfPortal'

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('cruzy_session')?.value

    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const payload = verifyToken(sessionCookie)
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Session expired' }, { status: 401 })
    }

    // An authorized user has no membership of their own — load the account they
    // are attached to so they see the full picture (parity with the member).
    const ctx = await resolveAccountContext(payload.contactId)

    const [contact, memberships, bookings, rewards, savedCards] = await Promise.all([
      findContactById(payload.contactId),
      getContactMemberships(ctx.primaryContactId),
      getContactBookings(ctx.primaryContactId),
      getContactRewards(ctx.primaryContactId),
      getContactSavedCards(ctx.primaryContactId),
    ])

    if (!contact) {
      return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      contact,
      memberships,
      bookings,
      rewards,
      savedCards,
      isAuthorizedUser: ctx.isAuthorizedUser,
      accountHolderName: ctx.accountHolderName,
    })
  } catch (err) {
    console.error('Account fetch error:', err)
    return NextResponse.json({ success: false, error: 'Failed to load account data' }, { status: 500 })
  }
}
