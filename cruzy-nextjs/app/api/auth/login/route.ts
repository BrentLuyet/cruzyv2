import { NextRequest, NextResponse } from 'next/server'
import { findContactByEmail, updateContact } from '@/lib/sfPortal'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 })
    }

    const contact = await findContactByEmail(email.toLowerCase().trim())

    if (!contact) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 })
    }

    if (contact.Portal_Status__c === 'Inactive') {
      return NextResponse.json({ success: false, error: 'Your account has been deactivated. Please contact support.' }, { status: 403 })
    }

    if (contact.Portal_Status__c === 'Locked') {
      return NextResponse.json({ success: false, error: 'Your account is locked. Please reset your password or contact support.' }, { status: 403 })
    }

    if (contact.Portal_Status__c === 'Pending' || !contact.Portal_Password_Hash__c) {
      return NextResponse.json({ success: false, error: 'Please check your email to set your password before logging in.' }, { status: 403 })
    }

    const valid = await verifyPassword(password, contact.Portal_Password_Hash__c)
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 })
    }

    // Update last login + increment count
    await updateContact(contact.Id, {
      Portal_Last_Login__c: new Date().toISOString(),
      Portal_Login_Count__c: (contact.Portal_Login_Count__c || 0) + 1,
    })

    const token = generateToken(contact.Id, contact.Email)

    const response = NextResponse.json({
      success: true,
      contactId: contact.Id,
      name: `${contact.FirstName} ${contact.LastName}`,
      email: contact.Email,
      memberId: contact.Cruzy_Plus_MBR_Number__c,
    })

    response.cookies.set('cruzy_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 })
  }
}
