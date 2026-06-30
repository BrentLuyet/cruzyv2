import { NextRequest, NextResponse } from 'next/server'
import { findContactByEmail, updateContact, getContactMemberships } from '@/lib/sfPortal'
import { generateResetToken, getResetExpiry } from '@/lib/auth'
import { sendEmail, resetPasswordEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    // Generic response used for every "not eligible" case, so the form never
    // reveals whether an email exists or has a membership (anti-enumeration).
    const generic = NextResponse.json({
      success: true,
      message: 'If that email is on file, a reset link is on its way.',
    })

    const contact = await findContactByEmail(email.toLowerCase().trim())
    if (!contact || contact.Portal_Status__c === 'Inactive') {
      return generic
    }

    // Only members can reset a portal password — verify they have a membership.
    const memberships = await getContactMemberships(contact.Id)
    if (!memberships || memberships.length === 0) {
      return generic
    }

    const token = generateResetToken()
    const expiry = getResetExpiry()

    await updateContact(contact.Id, {
      Portal_Reset_Token__c: token,
      Portal_Reset_Expiry__c: expiry,
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`

    // Email the "click to reset password" link to the member.
    await sendEmail({
      to: contact.Email,
      subject: 'Reset your Cruzy password',
      html: resetPasswordEmail(contact.FirstName, resetUrl),
    })

    return NextResponse.json({
      success: true,
      message: 'If that email is on file, a reset link is on its way.',
      // Only expose the link in dev mode for easy demo testing
      ...(process.env.NODE_ENV !== 'production' && { devResetUrl: resetUrl }),
    })
  } catch (err) {
    console.error('Forgot password error:', err)
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 })
  }
}
