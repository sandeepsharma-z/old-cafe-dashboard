'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface ProfileData {
  account_id: string
  role: string
  email: string
  name: string
  owner_name: string
  phone: string
  location: string
  business_name: string
}


function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

function GhostInput({
  type = 'text', value, onChange, placeholder, disabled,
}: {
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '12px 16px',
        borderRadius: '12px',
        border: 'none',
        background: '#f2f4f6',
        fontSize: '14px',
        color: '#1e293b',
        outline: 'none',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        opacity: disabled ? 0.6 : 1,
        transition: 'background 0.15s',
      }}
      onFocus={e => { e.currentTarget.style.background = '#eaecef' }}
      onBlur={e => { e.currentTarget.style.background = '#f2f4f6' }}
    />
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{
        fontSize: '14px',
        color: '#1e293b',
        fontFamily: mono ? 'monospace' : 'inherit',
        fontWeight: mono ? 600 : 400,
        background: mono ? '#f2f4f6' : 'transparent',
        padding: mono ? '6px 10px' : '0',
        borderRadius: mono ? '8px' : '0',
        display: 'inline-block',
      }}>
        {value || '—'}
      </span>
    </div>
  )
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Edit state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [saveError, setSaveError] = useState('')

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPw, setChangingPw] = useState(false)
  const [pwMsg, setPwMsg] = useState('')
  const [pwError, setPwError] = useState('')

  useEffect(() => {
    setLoading(true)
    api.get<{ data: ProfileData } | ProfileData>('/api/auth/me')
      .then(res => {
        const data = ('data' in res && res.data) ? res.data : res as ProfileData
        setProfile(data)
        setName(data.name ?? data.owner_name ?? '')
        setPhone(data.phone ?? '')
      })
      .catch(() => setError('Could not load profile.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    setSaveMsg('')
    setSaveError('')
    try {
      await api.put('/api/auth/profile', { name, phone })
      setSaveMsg('Profile updated successfully.')
      setProfile(prev => prev ? { ...prev, name, phone } : prev)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwMsg('')
    setPwError('')
    if (!newPassword) { setPwError('New password is required.'); return }
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match.'); return }
    if (newPassword.length < 8) { setPwError('Password must be at least 8 characters.'); return }
    setChangingPw(true)
    try {
      await api.post('/api/auth/change-password', { currentPassword, newPassword })
      setPwMsg('Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e: unknown) {
      setPwError(e instanceof Error ? e.message : 'Failed to change password.')
    } finally {
      setChangingPw(false)
    }
  }

  if (loading) {
    return (
      <>
        <div style={{ height: '50px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 18px', flexShrink: 0 }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Profile</span>
        </div>
        <div style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#fff', borderRadius: '10px', border: '1px solid var(--border)', padding: '18px', marginBottom: '14px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--bg)' }} />
            <div>
              <div style={{ width: '140px', height: '14px', background: 'var(--bg)', borderRadius: '4px', marginBottom: '8px' }} />
              <div style={{ width: '100px', height: '11px', background: 'var(--bg)', borderRadius: '4px' }} />
            </div>
          </div>
          {[1, 2].map(i => <div key={i} style={{ background: 'var(--bg)', borderRadius: '10px', height: '180px', marginBottom: '14px' }} />)}
        </div>
      </>
    )
  }

  if (error || !profile) {
    return (
      <>
        <div style={{ height: '50px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 18px', flexShrink: 0 }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Profile</span>
        </div>
        <div style={{ padding: '18px' }}>
          <div style={{ background: '#fee2e2', borderRadius: '10px', padding: '16px', color: '#991b1b', fontSize: '13px' }}>{error || 'Could not load profile.'}</div>
        </div>
      </>
    )
  }

  const displayName = profile.business_name || profile.name || profile.owner_name || 'Cafe'
  const initials = getInitials(displayName)

  const inputStyle: React.CSSProperties = { border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontSize: '12px', width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit', color: 'var(--text-primary)', background: '#fff' }
  const labelStyle: React.CSSProperties = { fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }

  return (
    <>
      <div style={{ height: '50px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 18px', flexShrink: 0 }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Profile</span>
        <div style={{ marginLeft: 'auto', width: '28px', height: '28px', borderRadius: '50%', background: 'var(--portal-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff', fontWeight: 700 }}>{initials}</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '18px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '14px' }}>Profile</div>

        {/* Avatar hero */}
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--border)', padding: '18px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--portal-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{displayName}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{profile.email}{profile.location && ` · ${profile.location}`}</div>
            <span style={{ display: 'inline-block', marginTop: '5px', background: 'var(--bg)', color: 'var(--portal-primary)', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, textTransform: 'capitalize', border: '1px solid var(--border)' }}>{profile.role}</span>
          </div>
        </div>

        {/* Account info */}
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--border)', padding: '18px', marginBottom: '14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--portal-primary)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '14px' }}>Account Info</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <InfoRow label="Account ID" value={profile.account_id} mono />
            <InfoRow label="Role" value={profile.role} />
            <InfoRow label="Email" value={profile.email} />
            {profile.business_name && <InfoRow label="Business Name" value={profile.business_name} />}
            {profile.owner_name && <InfoRow label="Owner" value={profile.owner_name} />}
            {profile.location && <InfoRow label="Location" value={profile.location} />}
          </div>
        </div>

        {/* Edit profile */}
        <form onSubmit={handleSave}>
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--border)', padding: '18px', marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--portal-primary)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '14px' }}>Edit Profile</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Name / Owner Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" style={inputStyle} />
              </div>
            </div>
            {saveMsg && <div style={{ background: 'var(--badge-accepted-bg)', color: 'var(--badge-accepted-text)', padding: '9px 12px', borderRadius: '8px', fontSize: '12px', marginTop: '12px' }}>{saveMsg}</div>}
            {saveError && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '9px 12px', borderRadius: '8px', fontSize: '12px', marginTop: '12px' }}>{saveError}</div>}
            <button type="submit" disabled={saving} className="btn-primary" style={{ marginTop: '14px', opacity: saving ? 0.6 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Change password */}
        <form onSubmit={handleChangePassword}>
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--border)', padding: '18px', marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '14px' }}>Change Password</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Current Password</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter current password" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 8 characters" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" style={inputStyle} />
              </div>
            </div>
            {pwMsg && <div style={{ background: 'var(--badge-accepted-bg)', color: 'var(--badge-accepted-text)', padding: '9px 12px', borderRadius: '8px', fontSize: '12px', marginTop: '12px' }}>{pwMsg}</div>}
            {pwError && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '9px 12px', borderRadius: '8px', fontSize: '12px', marginTop: '12px' }}>{pwError}</div>}
            <button type="submit" disabled={changingPw} className="btn-primary" style={{ marginTop: '14px', opacity: changingPw ? 0.6 : 1, cursor: changingPw ? 'not-allowed' : 'pointer' }}>
              {changingPw ? 'Changing…' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
