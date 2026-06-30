'use client'

import { useState } from 'react'

const MEMBERSHIP_PRICE = parseFloat(process.env.NEXT_PUBLIC_MEMBERSHIP_PRICE || '89.00')

interface Props {
  onPromoApplied: (discount: number, promoCode: string) => void
  promoDiscount: number
}

export default function OrderSummary({ onPromoApplied, promoDiscount }: Props) {
  const [promoInput, setPromoInput] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoLabel, setPromoLabel] = useState('')

  const affiliationAmount = MEMBERSHIP_PRICE
  const subtotal = Math.max(0, affiliationAmount - promoDiscount)
  const estimatedTax = 0
  const total = subtotal + estimatedTax

  const handleApply = async () => {
    if (!promoInput.trim()) return
    setPromoLoading(true)
    setPromoError('')

    try {
      const res = await fetch('/api/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput.trim().toUpperCase() }),
      })
      const data = await res.json()

      if (data.valid) {
        const discount = data.type === 'percent'
          ? (affiliationAmount * data.amount) / 100
          : data.amount
        setPromoApplied(true)
        setPromoLabel(data.label)
        onPromoApplied(discount, promoInput.trim().toUpperCase())
      } else {
        setPromoError('Invalid promo code.')
        setPromoApplied(false)
        onPromoApplied(0, '')
      }
    } catch {
      setPromoError('Error validating code.')
    } finally {
      setPromoLoading(false)
    }
  }

  const handleRemove = () => {
    setPromoInput('')
    setPromoApplied(false)
    setPromoLabel('')
    setPromoError('')
    onPromoApplied(0, '')
  }

  return (
    <div>
      {/* Promo Code row — matches real site layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <div className="md:col-span-1 md:col-start-3">
          <label>Promo Code</label>
          <div className="flex gap-1">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApply())}
              placeholder="Enter promo code"
              disabled={promoApplied}
              style={{ flex: 1 }}
            />
            {!promoApplied ? (
              <button
                type="button"
                onClick={handleApply}
                disabled={promoLoading || !promoInput.trim()}
                className="btn-navy"
                style={{ whiteSpace: 'nowrap', padding: '8px 14px' }}
              >
                {promoLoading ? '...' : 'Apply'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRemove}
                className="btn-outline-gray"
                style={{ whiteSpace: 'nowrap', padding: '8px 12px' }}
              >
                Remove
              </button>
            )}
          </div>
          {promoError && <span className="field-error">{promoError}</span>}
          {promoApplied && promoLabel && (
            <span style={{ color: '#28a745', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              ✓ {promoLabel}
            </span>
          )}
        </div>
      </div>

      {/* Amount Breakdown — matches real site .amount-breakdown */}
      <div className="amount-breakdown">
        <div className="br-row">
          <span>Affiliation Amount</span>
          <span>${affiliationAmount.toFixed(2)}</span>
        </div>
        {promoDiscount > 0 && (
          <div className="br-row" style={{ color: '#28a745' }}>
            <span>Promo Discount</span>
            <span>-${promoDiscount.toFixed(2)}</span>
          </div>
        )}
        {promoDiscount > 0 && (
          <div className="br-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        )}
        <div className="br-row">
          <span>Estimated Tax</span>
          <span>${estimatedTax.toFixed(2)}</span>
        </div>
        <div className="br-row br-total">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
