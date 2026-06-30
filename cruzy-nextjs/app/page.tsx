'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'

import { formSchema, FormValues } from '@/lib/schema'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import MembershipBenefits from '@/components/MembershipBenefits'
import PersonalInfoSection from '@/components/PersonalInfoSection'
import AuthorizedUsersSection from '@/components/AuthorizedUsersSection'
import PaymentSection from '@/components/PaymentSection'
import OrderSummary from '@/components/OrderSummary'

const MEMBERSHIP_PRICE = parseFloat(process.env.NEXT_PUBLIC_MEMBERSHIP_PRICE || '89.00')

function JoinForm() {
  const router = useRouter()

  const [cardError, setCardError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoCode, setPromoCode] = useState('')

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { authorizedUsers: [], country: 'United States' },
  })

  const watchCountry = watch('country')

  const handlePromoApplied = (discount: number, code: string) => {
    setPromoDiscount(discount)
    setPromoCode(code)
  }

  const tokenizeAndSubmit = (data: FormValues) => {
    setCardError(null)
    setSubmitError(null)

    if (!window.Accept) {
      setSubmitError('Payment library not loaded. Please refresh and try again.')
      setIsSubmitting(false)
      return
    }

    const cardNumber = data.cardNumber.replace(/\s/g, '')
    const authData = {
      clientKey: process.env.NEXT_PUBLIC_AUTHNET_CLIENT_KEY!,
      apiLoginID: process.env.NEXT_PUBLIC_AUTHNET_API_LOGIN_ID!,
    }
    const cardData = {
      cardNumber,
      month: data.cardExpMonth,
      year: data.cardExpYear,
      cardCode: data.cardCvv,
    }

    window.Accept.dispatchData({ authData, cardData }, async (response) => {
      if (response.messages.resultCode === 'Error') {
        setCardError(response.messages.message.map((m) => m.text).join(' '))
        setIsSubmitting(false)
        return
      }

      const opaqueData = response.opaqueData!

      try {
        const res = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            opaqueDataDescriptor: opaqueData.dataDescriptor,
            opaqueDataValue: opaqueData.dataValue,
            promoCode,
            promoDiscount,
          }),
        })

        const result = await res.json()

        if (result.success) {
          router.push(
            `/success?name=${encodeURIComponent(result.memberName)}&email=${encodeURIComponent(result.email)}&amount=${result.amount}&memberId=${encodeURIComponent(result.cruzyMemberId)}`
          )
        } else {
          setSubmitError(result.error || 'Payment failed. Please try again.')
          setIsSubmitting(false)
        }
      } catch {
        setSubmitError('An unexpected error occurred. Please try again.')
        setIsSubmitting(false)
      }
    })
  }

  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true)
    tokenizeAndSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-card">
        <PersonalInfoSection register={register} errors={errors} watchCountry={watchCountry} />
        <AuthorizedUsersSection register={register} errors={errors} control={control} />
        <PaymentSection
          register={register}
          errors={errors}
          cardError={cardError}
        />
        <OrderSummary onPromoApplied={handlePromoApplied} promoDiscount={promoDiscount} />

        <hr className="section-divider" />

        {/* Terms */}
        <div className="flex items-start gap-2 mb-4">
          <input
            id="agreeToTerms"
            type="checkbox"
            {...register('agreeToTerms')}
            style={{ marginTop: '3px', flexShrink: 0 }}
          />
          <label
            htmlFor="agreeToTerms"
            style={{ fontSize: '14px', fontWeight: 400, color: '#555', cursor: 'pointer', marginBottom: 0 }}
          >
            I have read and agree to the Cruzy+{' '}
            <a
              href="https://cruzy.com/terms-and-conditions"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#10559a' }}
            >
              Terms and Conditions.
            </a>
          </label>
        </div>
        {errors.agreeToTerms && (
          <span className="field-error mb-3 block">{errors.agreeToTerms.message}</span>
        )}

        {submitError && (
          <div
            className="mb-4 p-3 rounded"
            style={{ background: '#fff3f3', border: '1px solid #f5c6cb', color: '#721c24', fontSize: '14px' }}
          >
            {submitError}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary-cruzy flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </>
            ) : (
              'SUBMIT'
            )}
          </button>
        </div>
      </div>
    </form>
  )
}

export default function HomePage() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <SiteHeader />

      <div
        className="text-center py-8 px-4"
        style={{ background: '#dce9f7', borderBottom: '1px solid #c5d8ef' }}
      >
        <h1
          className="font-bold mb-2"
          style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '36px', color: '#10559a' }}
        >
          Join Cruzy+
        </h1>
        <p style={{ fontSize: '15px', color: '#555', maxWidth: '600px', margin: '0 auto' }}>
          <strong>Cruzy+ Membership</strong> — Experience the ultimate sea adventure with our exclusive{' '}
          <strong>Cruzy+ membership</strong>! For only{' '}
          <strong style={{ color: '#bd1f34', fontSize: '20px' }}>${MEMBERSHIP_PRICE.toFixed(2)}</strong>{' '}
          per year, unlock premium features, priority booking, and exclusive member benefits.
        </p>
      </div>

      <MembershipBenefits />

      <section className="py-10">
        <div className="container mx-auto px-4" style={{ maxWidth: '960px' }}>
          <JoinForm />
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
