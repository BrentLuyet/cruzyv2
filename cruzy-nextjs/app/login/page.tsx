'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (data.success) {
        router.push('/account')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
      <SiteHeader />

      <div className="flex items-center justify-center px-4 py-16">
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%', maxWidth: '440px', padding: '48px 40px' }}>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div style={{ background: '#10559a', borderRadius: '50%', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          </div>

          <h1 className="text-center mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '26px', color: '#1a2b4a' }}>
            Member Login
          </h1>
          <p className="text-center mb-8" style={{ color: '#767676', fontSize: '14px' }}>
            Sign in to your Cruzy+ account
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

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1a2b4a', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #dde3ec', borderRadius: '8px', fontSize: '15px', color: '#1a2b4a', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div className="flex justify-end">
              <a href="/forgot-password" style={{ fontSize: '13px', color: '#10559a' }}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#7bafd4' : '#10559a',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '14px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Poppins, sans-serif',
                marginTop: '4px',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-6" style={{ fontSize: '13px', color: '#767676' }}>
            Not a member yet?{' '}
            <a href="/" style={{ color: '#10559a', fontWeight: 600 }}>Join Cruzy+</a>
          </p>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
