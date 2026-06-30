import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import {
  getAuthorizedUsers,
  inviteAuthorizedUser,
  authUserAction,
  findContactById,
  resolveAccountContext,
} from '@/lib/sfPortal'

function requireSession(req: NextRequest) {
  const sessionCookie = req.cookies.get('cruzy_session')?.value
  if (!sessionCookie) return null
  return verifyToken(sessionCookie)
}

export async function GET(req: NextRequest) {
  const payload = requireSession(req)
  if (!payload) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
  }
  try {
    const ctx = await resolveAccountContext(payload.contactId)
    const authorizedUsers = await getAuthorizedUsers(ctx.primaryContactId)
    return NextResponse.json({ success: true, authorizedUsers })
  } catch (err) {
    console.error('Authorized users fetch error:', err)
    return NextResponse.json({ success: false, error: 'Failed to load authorized users' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const payload = requireSession(req)
  if (!payload) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
  }
  try {
    const { firstName, lastName, email } = await req.json()

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
      return NextResponse.json({ success: false, error: 'First name, last name, and email are required.' }, { status: 400 })
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const ctx = await resolveAccountContext(payload.contactId)
    const me = await findContactById(payload.contactId)
    const inviterName = me ? `${me.FirstName} ${me.LastName}` : 'a member'

    const result = await inviteAuthorizedUser({
      primaryContactId: ctx.primaryContactId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      invitedByLabel: `Member: ${inviterName}`,
    })

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Invite failed.' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Authorized user invite error:', err)
    return NextResponse.json({ success: false, error: 'Failed to invite authorized user' }, { status: 500 })
  }
}

// Manage an existing authorized user: revoke, reactivate, or re-send link.
export async function PATCH(req: NextRequest) {
  const payload = requireSession(req)
  if (!payload) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
  }
  try {
    const { action, authUserId } = await req.json()

    if (!['revoke', 'reactivate', 'resend'].includes(action) || !authUserId) {
      return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 })
    }

    // Ownership check: the target must belong to this account's membership.
    const ctx = await resolveAccountContext(payload.contactId)
    const owned = await getAuthorizedUsers(ctx.primaryContactId)
    if (!owned.some((u: { Id: string }) => u.Id === authUserId)) {
      return NextResponse.json({ success: false, error: 'Not allowed.' }, { status: 403 })
    }

    const result = await authUserAction({ action, authUserId })
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Action failed.' }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Authorized user manage error:', err)
    return NextResponse.json({ success: false, error: 'Failed to update authorized user' }, { status: 500 })
  }
}
