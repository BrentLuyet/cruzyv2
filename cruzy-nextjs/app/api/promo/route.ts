import { NextRequest, NextResponse } from 'next/server'

const MEMBERSHIP_PRICE = parseFloat(process.env.NEXT_PUBLIC_MEMBERSHIP_PRICE || '99.00')

const PROMO_CODES: Record<string, { type: 'percent' | 'fixed'; amount: number; label: string }> = {
  CRUZY10: { type: 'percent', amount: 10, label: '10% off membership' },
  CRUZY20: { type: 'percent', amount: 20, label: '20% off membership' },
  SAVE25: { type: 'percent', amount: 25, label: '25% off membership' },
  WELCOME: { type: 'fixed', amount: 20, label: '$20 off membership' },
  FRIEND50: { type: 'fixed', amount: 50, label: '$50 referral discount' },
  CRUISE2026: { type: 'percent', amount: 15, label: '15% off — 2026 special' },
}

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, error: 'No code provided' }, { status: 400 })
    }

    const promo = PROMO_CODES[code.trim().toUpperCase()]

    if (!promo) {
      return NextResponse.json({ valid: false })
    }

    const discountAmount =
      promo.type === 'percent'
        ? (MEMBERSHIP_PRICE * promo.amount) / 100
        : promo.amount

    return NextResponse.json({
      valid: true,
      code: code.trim().toUpperCase(),
      type: promo.type,
      amount: promo.amount,
      discountAmount: Math.min(discountAmount, MEMBERSHIP_PRICE),
      label: promo.label,
    })
  } catch {
    return NextResponse.json({ valid: false, error: 'Server error' }, { status: 500 })
  }
}
