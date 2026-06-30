'use client'

import { useEffect, useRef } from 'react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { FormValues } from '@/lib/schema'

interface Props {
  register: UseFormRegister<FormValues>
  errors: FieldErrors<FormValues>
  cardError: string | null
}

declare global {
  interface Window {
    Accept: {
      dispatchData: (
        payload: {
          authData: { clientKey: string; apiLoginID: string }
          cardData: { cardNumber: string; month: string; year: string; cardCode: string }
        },
        callback: (response: {
          messages: { resultCode: string; message: Array<{ code: string; text: string }> }
          opaqueData?: { dataDescriptor: string; dataValue: string }
        }) => void
      ) => void
    }
  }
}

export default function PaymentSection({ register, errors, cardError }: Props) {
  const scriptLoaded = useRef(false)

  useEffect(() => {
    if (scriptLoaded.current) return
    scriptLoaded.current = true

    // Load Authorize.net Accept.js (sandbox or production)
    const isSandbox = process.env.NEXT_PUBLIC_AUTHNET_ENV !== 'production'
    const src = isSandbox
      ? 'https://jstest.authorize.net/v1/Accept.js'
      : 'https://js.authorize.net/v1/Accept.js'

    const script = document.createElement('script')
    script.src = src
    script.charset = 'utf-8'
    document.head.appendChild(script)
  }, [])

  return (
    <>
      <hr className="section-divider" />
      <h4 className="payment-section-title">Payment Information</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Name on Card */}
        <div>
          <label>Name on Card <span className="required-star">*</span></label>
          <input type="text" {...register('nameOnCard')} autoComplete="cc-name" />
          {errors.nameOnCard && <span className="field-error">{errors.nameOnCard.message}</span>}
        </div>

        {/* Card Number */}
        <div>
          <label>Card Number <span className="required-star">*</span></label>
          <input
            type="text"
            {...register('cardNumber')}
            placeholder="•••• •••• •••• ••••"
            autoComplete="cc-number"
            maxLength={19}
            onChange={(e) => {
              // Auto-format with spaces
              const val = e.target.value.replace(/\D/g, '').slice(0, 16)
              e.target.value = val.replace(/(.{4})/g, '$1 ').trim()
            }}
          />
          {errors.cardNumber && <span className="field-error">{errors.cardNumber.message}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Expiry Month */}
        <div>
          <label>Exp. Month <span className="required-star">*</span></label>
          <select {...register('cardExpMonth')} autoComplete="cc-exp-month">
            <option value="">MM</option>
            {Array.from({ length: 12 }, (_, i) => {
              const m = String(i + 1).padStart(2, '0')
              return <option key={m} value={m}>{m}</option>
            })}
          </select>
          {errors.cardExpMonth && <span className="field-error">{errors.cardExpMonth.message}</span>}
        </div>

        {/* Expiry Year */}
        <div>
          <label>Exp. Year <span className="required-star">*</span></label>
          <select {...register('cardExpYear')} autoComplete="cc-exp-year">
            <option value="">YYYY</option>
            {Array.from({ length: 12 }, (_, i) => {
              const y = String(new Date().getFullYear() + i)
              return <option key={y} value={y}>{y}</option>
            })}
          </select>
          {errors.cardExpYear && <span className="field-error">{errors.cardExpYear.message}</span>}
        </div>

        {/* CVV */}
        <div>
          <label>CVV <span className="required-star">*</span></label>
          <input
            type="text"
            {...register('cardCvv')}
            placeholder="•••"
            autoComplete="cc-csc"
            maxLength={4}
          />
          {errors.cardCvv && <span className="field-error">{errors.cardCvv.message}</span>}
        </div>
      </div>

      {cardError && (
        <div
          className="mb-4 p-3 rounded"
          style={{ background: '#fff3f3', border: '1px solid #f5c6cb', color: '#721c24', fontSize: '13px' }}
        >
          {cardError}
        </div>
      )}

      <p style={{ fontSize: '12px', color: '#999', marginTop: '-8px', marginBottom: '8px' }}>
        🔒 Your payment is secured by Authorize.net. Card details are never stored on our servers.
      </p>
    </>
  )
}
