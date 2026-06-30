'use client'

import { useEffect, useState, type FormEvent, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

interface Contact {
  Id: string
  FirstName: string
  LastName: string
  Email: string
  Phone: string
  MailingCity: string
  MailingState: string
  Cruzy_Plus_MBR_Number__c: string
  VIFP_Level__c: string
  Portal_Last_Login__c: string
  Portal_Login_Count__c: number
  Cruzy_Plus_Enrolled__c: boolean
}

interface Membership {
  Id: string
  Name: string
  Status__c: string
  Enroll_Date__c: string
  Expiration_Date__c: string
  Next_Billing_Date__c: string
  Auto_Renewal__c: boolean
  Partner__c: string
}

interface Booking {
  Id: string
  Name: string
  Status__c: string
  Ship__c: string
  Itinerary__c: string
  Departure_Date__c: string
  Departure_Port__c: string
  Cabin_Category__c: string
  PAX_Count__c: number
  Original_Cruise_Total__c: number
  Current_Balance_Due__c: number
}

interface Reward {
  Id: string
  Name: string
  Status__c: string
  Reward_Number__c: string
  Reward_Location__c: string
  Issue_Date__c: string
  Book_By_Date__c: string
  Expiration_Date__c: string
}

interface SavedCard {
  Id: string
  Name: string
  Card_Brand__c: string
  Last_Four__c: string
  Expiry_Month__c: string
  Expiry_Year__c: string
  Is_Default__c: boolean
}

interface AuthorizedUser {
  Id: string
  Name: string
  Status__c: string
  Invite_Date__c: string
  Invited_By__c: string
  Contact__r: {
    FirstName: string
    LastName: string
    Email: string
    Portal_Status__c: string
  } | null
}

type Tab = 'overview' | 'bookings' | 'membership' | 'rewards' | 'cards' | 'authorized'

const fmt = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
const fmtMoney = (n: number) => n != null ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'

const statusColor = (s: string) => {
  if (!s) return '#767676'
  const l = s.toLowerCase()
  if (l === 'active' || l === 'booking' || l === 'completed') return '#1a8a4a'
  if (l === 'quote') return '#b36b00'
  if (l === 'cancelled' || l === 'expired' || l === 'inactive') return '#bd1f34'
  if (l === 'used') return '#10559a'
  return '#767676'
}

const statusBg = (s: string) => {
  const c = statusColor(s)
  return { color: c, background: c + '18', borderRadius: '20px', padding: '3px 12px', fontSize: '12px', fontWeight: 600 }
}

const manageBtn: CSSProperties = {
  background: '#fff',
  border: '1px solid #dde3ec',
  borderRadius: '8px',
  padding: '6px 12px',
  fontSize: '13px',
  fontWeight: 600,
  color: '#10559a',
  cursor: 'pointer',
  fontFamily: 'Poppins, sans-serif',
}

const vifpColor: Record<string, string> = {
  Red: '#bd1f34', Gold: '#b8860b', Platinum: '#7b7b7b', Diamond: '#1a6ebd', 'Diamond Plus': '#6a0dad',
}

export default function AccountPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')
  const [data, setData] = useState<{ contact: Contact; memberships: Membership[]; bookings: Booking[]; rewards: Reward[]; savedCards: SavedCard[]; isAuthorizedUser?: boolean; accountHolderName?: string | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [authUsers, setAuthUsers] = useState<AuthorizedUser[]>([])
  const [authLoading, setAuthLoading] = useState(false)
  const [inviteForm, setInviteForm] = useState({ firstName: '', lastName: '', email: '' })
  const [inviteBusy, setInviteBusy] = useState(false)
  const [inviteMsg, setInviteMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function loadAuthUsers() {
    setAuthLoading(true)
    try {
      const r = await fetch('/api/account/authorized-users')
      const d = await r.json()
      if (d.success) setAuthUsers(d.authorizedUsers)
    } catch {
      /* non-fatal */
    } finally {
      setAuthLoading(false)
    }
  }

  useEffect(() => {
    if (tab === 'authorized') loadAuthUsers()
  }, [tab])

  async function handleManageAuthUser(authUserId: string, action: 'revoke' | 'reactivate' | 'resend') {
    if (action === 'revoke' && !confirm('Revoke this person\'s access? Their portal login will be switched off.')) return
    setInviteMsg(null)
    try {
      const r = await fetch('/api/account/authorized-users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, authUserId }),
      })
      const d = await r.json()
      if (d.success) {
        const note = action === 'revoke' ? 'Access revoked.' : action === 'reactivate' ? 'Access restored.' : 'Set-password link re-sent.'
        setInviteMsg({ type: 'success', text: note })
        loadAuthUsers()
      } else {
        setInviteMsg({ type: 'error', text: d.error || 'Action failed.' })
      }
    } catch {
      setInviteMsg({ type: 'error', text: 'Something went wrong. Please try again.' })
    }
  }

  async function handleInvite(e: FormEvent) {
    e.preventDefault()
    setInviteMsg(null)
    setInviteBusy(true)
    try {
      const r = await fetch('/api/account/authorized-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm),
      })
      const d = await r.json()
      if (d.success) {
        setInviteMsg({ type: 'success', text: `Invite sent to ${inviteForm.email}. They'll get an email to set their password.` })
        setInviteForm({ firstName: '', lastName: '', email: '' })
        loadAuthUsers()
      } else {
        setInviteMsg({ type: 'error', text: d.error || 'Invite failed.' })
      }
    } catch {
      setInviteMsg({ type: 'error', text: 'Something went wrong. Please try again.' })
    } finally {
      setInviteBusy(false)
    }
  }

  useEffect(() => {
    fetch('/api/account')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setData(d)
        } else if (d.error === 'Not authenticated' || d.error === 'Session expired') {
          router.push('/login')
        } else {
          setError(d.error || 'Failed to load account')
        }
      })
      .catch(() => setError('Failed to load account data'))
      .finally(() => setLoading(false))
  }, [router])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (loading) {
    return (
      <div style={{ background: '#f5f7fa', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
        <SiteHeader bookYourCruiseHref="/api/account/auto-booking-launcher" bookYourCruiseTarget="_blank" />
        <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
          <div style={{ textAlign: 'center', color: '#767676' }}>
            <div style={{ width: '48px', height: '48px', border: '4px solid #dde3ec', borderTopColor: '#10559a', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p>Loading your account…</p>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ background: '#f5f7fa', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
        <SiteHeader bookYourCruiseHref="/api/account/auto-booking-launcher" bookYourCruiseTarget="_blank" />
        <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
          <div style={{ textAlign: 'center', color: '#bd1f34' }}>{error}</div>
        </div>
      </div>
    )
  }

  const { contact, memberships, bookings, rewards, savedCards } = data!
  const isAuthorizedUser = !!data!.isAuthorizedUser
  const accountHolderName = data!.accountHolderName
  const activeMembership = memberships.find(m => m.Status__c === 'Active')
  const activeRewards = rewards.filter(r => r.Status__c === 'Active')
  const upcomingBookings = bookings.filter(b => b.Departure_Date__c && new Date(b.Departure_Date__c) >= new Date())

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'bookings', label: 'My Cruises', count: bookings.length },
    { id: 'membership', label: 'Membership', count: memberships.length },
    { id: 'rewards', label: 'Rewards', count: activeRewards.length },
    { id: 'cards', label: 'Payment', count: savedCards.length },
    { id: 'authorized', label: 'Authorized Users' },
  ]

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
      <SiteHeader bookYourCruiseHref="/api/account/auto-booking-launcher" bookYourCruiseTarget="_blank" />

      {/* Hero banner */}
      <div style={{ background: '#10559a', color: '#fff', padding: '40px 0 0' }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between flex-wrap gap-4 pb-6">
            <div className="flex items-center gap-4">
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '50%', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 700 }}>
                {contact.FirstName?.[0]}{contact.LastName?.[0]}
              </div>
              <div>
                <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '24px', margin: 0 }}>
                  {contact.FirstName} {contact.LastName}
                </h1>
                <p style={{ margin: '4px 0 0', color: '#7bb3e8', fontSize: '14px' }}>{contact.Email}</p>
                {contact.Cruzy_Plus_MBR_Number__c && (
                  <p style={{ margin: '2px 0 0', color: '#a8d0f5', fontSize: '13px', fontFamily: 'monospace' }}>
                    {contact.Cruzy_Plus_MBR_Number__c}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {contact.VIFP_Level__c && (
                <span style={{ background: vifpColor[contact.VIFP_Level__c] || '#555', color: '#fff', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', fontWeight: 700 }}>
                  VIFP {contact.VIFP_Level__c}
                </span>
              )}
              <button
                onClick={handleLogout}
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  background: tab === t.id ? '#fff' : 'transparent',
                  color: tab === t.id ? '#10559a' : 'rgba(255,255,255,0.75)',
                  border: 'none',
                  borderRadius: '8px 8px 0 0',
                  padding: '12px 22px',
                  fontSize: '14px',
                  fontWeight: tab === t.id ? 700 : 500,
                  cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {t.label}
                {t.count != null && t.count > 0 && (
                  <span style={{ background: tab === t.id ? '#10559a' : 'rgba(255,255,255,0.25)', color: tab === t.id ? '#fff' : '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: 700 }}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">

        {isAuthorizedUser && (
          <div style={{ background: '#eaf3fb', border: '1px solid #c2dcf5', borderRadius: '10px', padding: '12px 18px', marginBottom: '20px', color: '#10559a', fontSize: '14px' }}>
            You&apos;re an authorized user{accountHolderName ? <> on <strong>{accountHolderName}&apos;s</strong> Cruzy+ membership</> : ''}. You have full access to this account.
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>

            {/* Membership card */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#767676', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Membership</p>
              {activeMembership ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span style={statusBg(activeMembership.Status__c)}>{activeMembership.Status__c}</span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#1a2b4a', margin: '4px 0' }}><strong>Expires:</strong> {fmt(activeMembership.Expiration_Date__c)}</p>
                  <p style={{ fontSize: '14px', color: '#1a2b4a', margin: '4px 0' }}><strong>Next Billing:</strong> {fmt(activeMembership.Next_Billing_Date__c)}</p>
                  <p style={{ fontSize: '14px', color: '#1a2b4a', margin: '4px 0' }}><strong>Auto-Renew:</strong> {activeMembership.Auto_Renewal__c ? 'On' : 'Off'}</p>
                </>
              ) : (
                <p style={{ color: '#767676', fontSize: '14px' }}>No active membership</p>
              )}
            </div>

            {/* Upcoming cruises */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#767676', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Upcoming Cruises</p>
              {upcomingBookings.length === 0 ? (
                <p style={{ color: '#767676', fontSize: '14px' }}>No upcoming cruises</p>
              ) : (
                upcomingBookings.slice(0, 2).map(b => (
                  <div key={b.Id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '10px', marginBottom: '10px' }}>
                    <p style={{ fontWeight: 600, color: '#1a2b4a', fontSize: '14px', margin: '0 0 2px' }}>{b.Ship__c}</p>
                    <p style={{ color: '#767676', fontSize: '13px', margin: '0' }}>{b.Itinerary__c} · {fmt(b.Departure_Date__c)}</p>
                    {b.Current_Balance_Due__c > 0 && (
                      <p style={{ color: '#bd1f34', fontSize: '12px', margin: '2px 0 0' }}>Balance due: {fmtMoney(b.Current_Balance_Due__c)}</p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Rewards */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#767676', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Active Rewards</p>
              {activeRewards.length === 0 ? (
                <p style={{ color: '#767676', fontSize: '14px' }}>No active rewards</p>
              ) : (
                activeRewards.slice(0, 3).map(r => (
                  <div key={r.Id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '8px', marginBottom: '8px' }}>
                    <p style={{ fontWeight: 600, color: '#1a2b4a', fontSize: '14px', margin: '0 0 2px' }}>{r.Reward_Number__c}</p>
                    <p style={{ color: '#767676', fontSize: '13px', margin: '0' }}>Book by {fmt(r.Book_By_Date__c)}</p>
                  </div>
                ))
              )}
            </div>

            {/* Account info */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#767676', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Account Info</p>
              <p style={{ fontSize: '14px', color: '#1a2b4a', margin: '4px 0' }}><strong>Phone:</strong> {contact.Phone || '—'}</p>
              <p style={{ fontSize: '14px', color: '#1a2b4a', margin: '4px 0' }}><strong>Location:</strong> {[contact.MailingCity, contact.MailingState].filter(Boolean).join(', ') || '—'}</p>
              <p style={{ fontSize: '14px', color: '#1a2b4a', margin: '4px 0' }}><strong>Last Login:</strong> {contact.Portal_Last_Login__c ? fmt(contact.Portal_Last_Login__c) : 'First time'}</p>
              <p style={{ fontSize: '14px', color: '#1a2b4a', margin: '4px 0' }}><strong>Total Logins:</strong> {contact.Portal_Login_Count__c || 1}</p>
            </div>
          </div>
        )}

        {/* ── BOOKINGS ── */}
        {tab === 'bookings' && (
          <div>
            <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '22px', color: '#1a2b4a', marginBottom: '20px' }}>My Cruises</h2>
            {bookings.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#767676' }}>No bookings found.</div>
            ) : (
              <div className="flex flex-col gap-4">
                {bookings.map(b => (
                  <div key={b.Id} style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span style={{ fontFamily: 'monospace', color: '#767676', fontSize: '13px' }}>{b.Name}</span>
                        <span style={statusBg(b.Status__c)}>{b.Status__c}</span>
                      </div>
                      <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '18px', color: '#1a2b4a', margin: '0 0 4px' }}>{b.Ship__c}</h3>
                      <p style={{ color: '#767676', fontSize: '14px', margin: '0 0 4px' }}>{b.Itinerary__c}</p>
                      <p style={{ color: '#767676', fontSize: '13px', margin: '0' }}>
                        {fmt(b.Departure_Date__c)} · {b.Departure_Port__c} · {b.Cabin_Category__c} · {b.PAX_Count__c} guest{b.PAX_Count__c !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '20px', fontWeight: 700, color: '#1a2b4a', margin: '0 0 4px' }}>{fmtMoney(b.Original_Cruise_Total__c)}</p>
                      {b.Current_Balance_Due__c > 0 ? (
                        <p style={{ color: '#bd1f34', fontSize: '13px', fontWeight: 600, margin: '0' }}>Balance due: {fmtMoney(b.Current_Balance_Due__c)}</p>
                      ) : (
                        <p style={{ color: '#1a8a4a', fontSize: '13px', fontWeight: 600, margin: '0' }}>Paid in full</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MEMBERSHIP ── */}
        {tab === 'membership' && (
          <div>
            <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '22px', color: '#1a2b4a', marginBottom: '20px' }}>Membership</h2>
            {memberships.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#767676' }}>No memberships found.</div>
            ) : (
              <div className="flex flex-col gap-4">
                {memberships.map(m => (
                  <div key={m.Id} style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                      <div>
                        <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '18px', color: '#1a2b4a', margin: '0 0 4px' }}>{m.Name}</h3>
                        <p style={{ color: '#767676', fontSize: '13px', margin: '0' }}>{m.Partner__c}</p>
                      </div>
                      <span style={statusBg(m.Status__c)}>{m.Status__c}</span>
                    </div>
                    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                      {[
                        ['Enrolled', fmt(m.Enroll_Date__c)],
                        ['Expires', fmt(m.Expiration_Date__c)],
                        ['Next Billing', fmt(m.Next_Billing_Date__c)],
                        ['Auto-Renew', m.Auto_Renewal__c ? 'On' : 'Off'],
                      ].map(([label, value]) => (
                        <div key={label} style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px 16px' }}>
                          <p style={{ fontSize: '11px', fontWeight: 600, color: '#767676', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' }}>{label}</p>
                          <p style={{ fontSize: '15px', fontWeight: 600, color: '#1a2b4a', margin: '0' }}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── REWARDS ── */}
        {tab === 'rewards' && (
          <div>
            <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '22px', color: '#1a2b4a', marginBottom: '20px' }}>Rewards</h2>
            {rewards.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#767676' }}>No rewards found.</div>
            ) : (
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {rewards.map(r => (
                  <div key={r.Id} style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${statusColor(r.Status__c)}` }}>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <p style={{ fontFamily: 'monospace', fontSize: '13px', color: '#767676', margin: '0 0 2px' }}>{r.Reward_Number__c}</p>
                        <p style={{ fontWeight: 600, fontSize: '15px', color: '#1a2b4a', margin: '0' }}>{r.Reward_Location__c}</p>
                      </div>
                      <span style={statusBg(r.Status__c)}>{r.Status__c}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#767676', margin: '4px 0' }}>Issued: {fmt(r.Issue_Date__c)}</p>
                    <p style={{ fontSize: '13px', color: '#767676', margin: '4px 0' }}>Book by: {fmt(r.Book_By_Date__c)}</p>
                    <p style={{ fontSize: '13px', color: r.Status__c === 'Active' ? '#bd1f34' : '#767676', margin: '4px 0', fontWeight: r.Status__c === 'Active' ? 600 : 400 }}>
                      Expires: {fmt(r.Expiration_Date__c)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PAYMENT ── */}
        {tab === 'cards' && (
          <div>
            <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '22px', color: '#1a2b4a', marginBottom: '20px' }}>Payment Methods</h2>
            {savedCards.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#767676' }}>No saved cards.</div>
            ) : (
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {savedCards.map(c => (
                  <div key={c.Id} style={{ background: 'linear-gradient(135deg, #1a2b4a 0%, #10559a 100%)', borderRadius: '12px', padding: '24px', color: '#fff', position: 'relative', boxShadow: '0 4px 16px rgba(16,85,154,0.3)' }}>
                    {c.Is_Default__c && (
                      <span style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', padding: '2px 10px', fontSize: '11px', fontWeight: 600 }}>Default</span>
                    )}
                    <p style={{ fontWeight: 700, fontSize: '16px', margin: '0 0 16px', letterSpacing: '0.5px' }}>{c.Card_Brand__c}</p>
                    <p style={{ fontFamily: 'monospace', fontSize: '18px', letterSpacing: '3px', margin: '0 0 16px', opacity: 0.9 }}>•••• •••• •••• {c.Last_Four__c}</p>
                    <p style={{ fontSize: '13px', opacity: 0.7, margin: '0' }}>Expires {c.Expiry_Month__c}/{c.Expiry_Year__c}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── AUTHORIZED USERS ── */}
        {tab === 'authorized' && (
          <div>
            <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '22px', color: '#1a2b4a', marginBottom: '8px' }}>Authorized Users</h2>
            <p style={{ color: '#767676', fontSize: '14px', marginBottom: '20px' }}>
              Invite someone to access the portal under your membership. They get their own login and can set their own password.
            </p>

            {/* Invite form */}
            <form onSubmit={handleInvite} style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#767676', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>Invite an Authorized User</p>
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '14px' }}>
                <input
                  required placeholder="First name" value={inviteForm.firstName}
                  onChange={e => setInviteForm(f => ({ ...f, firstName: e.target.value }))}
                  style={{ padding: '10px 14px', border: '1px solid #dde3ec', borderRadius: '8px', fontSize: '14px', fontFamily: 'Poppins, sans-serif' }}
                />
                <input
                  required placeholder="Last name" value={inviteForm.lastName}
                  onChange={e => setInviteForm(f => ({ ...f, lastName: e.target.value }))}
                  style={{ padding: '10px 14px', border: '1px solid #dde3ec', borderRadius: '8px', fontSize: '14px', fontFamily: 'Poppins, sans-serif' }}
                />
                <input
                  required type="email" placeholder="Email" value={inviteForm.email}
                  onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
                  style={{ padding: '10px 14px', border: '1px solid #dde3ec', borderRadius: '8px', fontSize: '14px', fontFamily: 'Poppins, sans-serif' }}
                />
              </div>
              {inviteMsg && (
                <p style={{ fontSize: '13px', margin: '0 0 12px', color: inviteMsg.type === 'success' ? '#1a8a4a' : '#bd1f34' }}>{inviteMsg.text}</p>
              )}
              <button
                type="submit" disabled={inviteBusy}
                style={{ background: inviteBusy ? '#7bb3e8' : '#10559a', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 22px', fontSize: '14px', fontWeight: 600, cursor: inviteBusy ? 'default' : 'pointer', fontFamily: 'Poppins, sans-serif' }}
              >
                {inviteBusy ? 'Sending invite…' : 'Send Invite'}
              </button>
            </form>

            {/* List */}
            {authLoading ? (
              <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#767676' }}>Loading…</div>
            ) : authUsers.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#767676' }}>No authorized users yet.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {authUsers.map(au => {
                  const revoked = au.Status__c === 'Revoked' || au.Contact__r?.Portal_Status__c === 'Inactive'
                  return (
                  <div key={au.Id} style={{ background: '#fff', borderRadius: '12px', padding: '18px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <p style={{ fontWeight: 600, color: '#1a2b4a', fontSize: '15px', margin: '0 0 2px' }}>
                        {au.Contact__r ? `${au.Contact__r.FirstName} ${au.Contact__r.LastName}` : '—'}
                      </p>
                      <p style={{ color: '#10559a', fontSize: '13px', margin: '0' }}>{au.Contact__r?.Email}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={statusBg(revoked ? 'inactive' : au.Status__c)}>
                        {revoked ? 'Revoked' : au.Status__c}
                      </span>
                      <button onClick={() => handleManageAuthUser(au.Id, 'resend')} style={manageBtn}>Re-send link</button>
                      {revoked ? (
                        <button onClick={() => handleManageAuthUser(au.Id, 'reactivate')} style={{ ...manageBtn, color: '#1a8a4a', borderColor: '#bfe3cd' }}>Reactivate</button>
                      ) : (
                        <button onClick={() => handleManageAuthUser(au.Id, 'revoke')} style={{ ...manageBtn, color: '#bd1f34', borderColor: '#f3c2ca' }}>Revoke</button>
                      )}
                    </div>
                  </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </div>

      <SiteFooter />
    </div>
  )
}
