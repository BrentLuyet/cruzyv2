'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

function SetPasswordForm() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()

      if (data.success) {
        router.push('/account')
      } else {
        setError(data.error || 'Failed to set password')
      }
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center" style={{ color: '#bd1f34', padding: '40px' }}>
        Invalid link. Please request a new one from the <a href="/forgot-password" style={{ color: '#10559a' }}>forgot password page</a>.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div style={{ background: '#fff5f5', border: '1px solid #f5c6c6', borderRadius: '8px', padding: '12px 16px', color: '#bd1f34', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1a2b4a', marginBottom: '6px' }}>New Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          placeholder="At least 8 characters"
          style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #dde3ec', borderRadius: '8px', fontSize: '15px', color: '#1a2b4a', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1a2b4a', marginBottom: '6px' }}>Confirm Password</label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          placeholder="Re-enter password"
          style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #dde3ec', borderRadius: '8px', fontSize: '15px', color: '#1a2b4a', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{ background: loading ? '#7bafd4' : '#10559a', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '16px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Poppins, sans-serif', marginTop: '4px' }}
      >
        {loading ? 'Saving…' : 'Set Password & Sign In'}
      </button>
    </form>
  )
}

export default function SetPasswordPage() {
  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
      <SiteHeader />

      <div className="flex items-center justify-center px-4 py-16">
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%', maxWidth: '440px', padding: '48px 40px' }}>

          <div className="flex justify-center mb-6">
            <div style={{ background: '#10559a', borderRadius: '50%', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
          </div>

          <h1 className="text-center mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '26px', color: '#1a2b4a' }}>
            Set Your Password
          </h1>
          <p className="text-center mb-8" style={{ color: '#767676', fontSize: '14px' }}>
            Create a password for your Cruzy+ account.
          </p>

          <Suspense>
            <SetPasswordForm />
          </Suspense>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
