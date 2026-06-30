'use client'

import { useState } from 'react'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [devLink, setDevLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (data.success) {
        setSubmitted(true)
        if (data.devResetUrl) setDevLink(data.devResetUrl)
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
      <SiteHeader />

      <div className="flex items-center justify-center px-4 py-16">
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%', maxWidth: '440px', padding: '48px 40px' }}>

          <div className="flex justify-center mb-6">
            <div style={{ background: '#10559a', borderRadius: '50%', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
          </div>

          {!submitted ? (
            <>
              <h1 className="text-center mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '26px', color: '#1a2b4a' }}>
                Forgot Password?
              </h1>
              <p className="text-center mb-8" style={{ color: '#767676', fontSize: '14px' }}>
                Enter your email and we&apos;ll send you a reset link.
              </p>

              {error && (
                <div style={{ background: '#fff5f5', border: '1px solid #f5c6c6', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#bd1f34', fontSize: '14px' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1a2b4a', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #dde3ec', borderRadius: '8px', fontSize: '15px', color: '#1a2b4a', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ background: loading ? '#7bafd4' : '#10559a', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '16px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Poppins, sans-serif' }}
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-center mt-6" style={{ fontSize: '13px', color: '#767676' }}>
                <a href="/login" style={{ color: '#10559a' }}>Back to login</a>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-center mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '26px', color: '#1a2b4a' }}>
                Check Your Email
              </h1>
              <p className="text-center mb-6" style={{ color: '#767676', fontSize: '14px' }}>
                If <strong>{email}</strong> is on file, a password reset link is on its way.
              </p>

              {devLink && (
                <div style={{ background: '#f0f7ff', border: '1px solid #b3d1f5', borderRadius: '8px', padding: '14px 16px', marginBottom: '20px', fontSize: '13px' }}>
                  <p style={{ color: '#10559a', fontWeight: 700, marginBottom: '6px' }}>Dev Mode — Reset Link:</p>
                  <a href={devLink} style={{ color: '#10559a', wordBreak: 'break-all', fontSize: '12px' }}>{devLink}</a>
                </div>
              )}

              <a
                href="/login"
                style={{ display: 'block', textAlign: 'center', background: '#10559a', color: '#fff', borderRadius: '8px', padding: '14px', fontSize: '16px', fontWeight: 700, textDecoration: 'none' }}
              >
                Back to Login
              </a>
            </>
          )}
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
