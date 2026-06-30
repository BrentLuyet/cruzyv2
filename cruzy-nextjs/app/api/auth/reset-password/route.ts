import { NextRequest, NextResponse } from 'next/server'
import { findContactByResetToken, updateContact } from '@/lib/sfPortal'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ success: false, error: 'Token and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const contact = await findContactByResetToken(token)

    if (!contact) {
      return NextResponse.json({ success: false, error: 'Invalid or expired link. Please request a new one.' }, { status: 400 })
    }

    if (contact.Portal_Reset_Expiry__c && new Date(contact.Portal_Reset_Expiry__c) < new Date()) {
      return NextResponse.json({ success: false, error: 'This link has expired. Please request a new one.' }, { status: 400 })
    }

    const hash = await hashPassword(password)

    await updateContact(contact.Id, {
      Portal_Password_Hash__c: hash,
      Portal_Status__c: 'Active',
      Portal_Reset_Token__c: '',
      Portal_Reset_Expiry__c: null,
    })

    const sessionToken = generateToken(contact.Id, contact.Email)

    const response = NextResponse.json({ success: true })

    response.cookies.set('cruzy_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Reset password error:', err)
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 })
  }
}
