'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SuccessContent() {
  const params = useSearchParams()
  const name = params.get('name') || 'Member'
  const email = params.get('email') || ''
  const amount = params.get('amount') || '0'
  const memberId = params.get('memberId') || ''
  const joinDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>

      {/* Header — matches site */}
      <header style={{ background: '#10559a' }} className="w-full">
        <div className="container mx-auto px-4 flex items-center justify-between" style={{ height: '80px' }}>
          <a href="https://cruzy.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            <div className="flex flex-col leading-none">
              <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '28px', color: '#fff' }}>
                Cruzy<span style={{ color: '#fff' }}>+</span>
              </span>
              <span style={{ fontSize: '9px', color: '#7bb3e8', fontWeight: 400 }}>Powered by Carnival</span>
            </div>
          </a>
          <a
            href="tel:8554147823"
            className="text-white text-sm hover:opacity-80 transition-opacity"
          >
            855-514-7823
          </a>
        </div>
      </header>

      {/* Hero confirmation banner */}
      <div
        className="text-center py-10 px-4"
        style={{ background: '#dce9f7', borderBottom: '1px solid #c5d8ef' }}
      >
        {/* Checkmark circle */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: '#10559a' }}
        >
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1
          className="font-bold mb-2"
          style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '32px', color: '#10559a' }}
        >
          Welcome to Cruzy+, {name.split(' ')[0]}!
        </h1>
        <p style={{ fontSize: '15px', color: '#555', maxWidth: '500px', margin: '0 auto' }}>
          Your membership is confirmed and your account is active. Get ready to set sail!
        </p>
      </div>

      {/* Main content */}
      <main className="container mx-auto px-4 py-10" style={{ maxWidth: '800px' }}>

        {/* Member ID Card — hero element */}
        <div
          className="rounded-xl p-6 mb-6 text-center"
          style={{
            background: 'linear-gradient(135deg, #10559a 0%, #0d4480 100%)',
            boxShadow: '0 4px 20px rgba(16,85,154,0.3)',
          }}
        >
          <p style={{ color: '#90c4f0', fontSize: '12px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Your Cruzy+ Member ID
          </p>
          <p
            style={{
              color: '#fff',
              fontSize: '28px',
              fontWeight: 800,
              fontFamily: 'Montserrat, sans-serif',
              letterSpacing: '3px',
              marginBottom: '8px',
            }}
          >
            {memberId}
          </p>
          <p style={{ color: '#90c4f0', fontSize: '12px' }}>
            Save this ID — you&apos;ll need it when calling your Personal Cruise Counselor
          </p>
        </div>

        {/* Two column summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Membership Details */}
          <div
            className="rounded-xl p-6"
            style={{ background: '#fff', border: '3px solid #fff', borderRadius: '12px', boxShadow: '0 0.5rem 1rem rgba(0,0,0,0.15)' }}
          >
            <h2
              className="font-bold mb-4 pb-3"
              style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '16px', color: '#333', borderBottom: '1px solid #dee2e6' }}
            >
              Membership Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span style={{ fontSize: '13px', color: '#767676' }}>Member Name</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>{name}</span>
              </div>
              {email && (
                <div className="flex justify-between items-center">
                  <span style={{ fontSize: '13px', color: '#767676' }}>Email</span>
                  <span style={{ fontSize: '13px', color: '#333' }}>{email}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span style={{ fontSize: '13px', color: '#767676' }}>Membership Type</span>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#fff',
                    background: '#10559a',
                    padding: '2px 10px',
                    borderRadius: '12px',
                  }}
                >
                  Cruzy+ Annual
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ fontSize: '13px', color: '#767676' }}>Member Since</span>
                <span style={{ fontSize: '13px', color: '#333' }}>{joinDate}</span>
              </div>
              <div
                className="flex justify-between items-center pt-3"
                style={{ borderTop: '1px solid #dee2e6' }}
              >
                <span style={{ fontSize: '13px', color: '#767676' }}>Amount Charged</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#bd1f34' }}>
                  ${parseFloat(amount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div
            className="rounded-xl p-6"
            style={{ background: '#fff', border: '3px solid #fff', borderRadius: '12px', boxShadow: '0 0.5rem 1rem rgba(0,0,0,0.15)' }}
          >
            <h2
              className="font-bold mb-4 pb-3"
              style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '16px', color: '#333', borderBottom: '1px solid #dee2e6' }}
            >
              What Happens Next
            </h2>
            <ol className="space-y-4">
              {[
                { icon: '✉️', text: 'A confirmation email has been sent to your inbox.' },
                { icon: '📞', text: 'Your Personal Cruise Counselor will reach out within 1 business day.' },
                { icon: '⚓', text: 'You now have access to exclusive Cruzy+ member pricing on all sailings.' },
                { icon: '👨‍👩‍👧', text: 'Your authorized users can start booking at member rates immediately.' },
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }}>{step.icon}</span>
                  <span style={{ fontSize: '13px', color: '#555', lineHeight: '1.5' }}>{step.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Benefits reminder */}
        <div
          className="rounded-xl p-6 mb-6"
          style={{ background: '#f5f8ff', border: '1px solid #c5d8ef' }}
        >
          <h2
            className="font-bold mb-4 text-center"
            style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '16px', color: '#10559a' }}
          >
            Your Cruzy+ Benefits Are Now Active
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { img: 'https://cruzy.com/files/images/Save%20An%20Average%20of%2025_%20on%20Bookings.png', label: 'Save 25% Avg' },
              { img: 'https://cruzy.com/files/images/f2f.png', label: 'Priority Boarding' },
              { img: 'https://cruzy.com/files/images/Concierge%20Call%20Line.png', label: 'Concierge Line' },
              { img: 'https://cruzy.com/files/images/Personal%20Cruise%20Counselor.png', label: 'Personal PCC' },
            ].map((b) => (
              <div key={b.label} className="text-center flex flex-col items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.img} alt={b.label} style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#10559a' }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://cruzy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-center font-bold text-white py-3 px-8 rounded"
            style={{ background: '#bd1f34', fontFamily: 'Poppins, sans-serif', fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}
          >
            Explore Cruises
          </a>
          <a
            href="tel:8555147823"
            className="text-center font-bold py-3 px-8 rounded"
            style={{ background: 'transparent', border: '2px solid #10559a', color: '#10559a', fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
          >
            Call Your PCC: 855-514-7823
          </a>
        </div>
      </main>

      {/* Red CTA band */}
      <section style={{ background: '#bd1f34' }} className="py-8 mt-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <h2
            className="text-white font-bold text-xl md:text-2xl"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Discover Your Dream Getaway with Our Exclusive Cruise Deals!
          </h2>
          <a
            href="https://cruzy.com/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white font-semibold px-6 py-3 rounded whitespace-nowrap hover:bg-gray-100 transition-colors"
            style={{ color: '#333', fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
          >
            Contact Us
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative py-10"
        style={{
          backgroundImage: 'url(https://cruzy.com/files/images/footer_bottom_bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ background: '#0f559a', opacity: 0.85 }} />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <p className="text-white text-sm">
            Copyright © 2026 <strong>Cruzy</strong>. All Rights Reserved. Designed &amp; Hosted by AceOne Technologies.
          </p>
          <p className="text-white text-sm mt-1">
            <a href="mailto:info@cruzy.com" className="hover:text-red-300 transition-colors">info@cruzy.com</a>
            {' · '}
            <a href="tel:8555147823" className="hover:text-red-300 transition-colors">855-514-7823</a>
            {' · '}
            <span>PO Box 35, Conway, AR 72033</span>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#10559a', fontFamily: 'Poppins, sans-serif', fontSize: '16px' }}>Loading...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
