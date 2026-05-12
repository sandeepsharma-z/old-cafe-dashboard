'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'

interface TrialDetail {
  id: number
  product_name: string
  brand_name: string
  status: string
  start_date: string
  end_date: string
}

export default function TrialFeedbackPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [trial, setTrial] = useState<TrialDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [notes, setNotes] = useState('')
  const [wouldOrderAgain, setWouldOrderAgain] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    api.get<{ trial: TrialDetail }>(`/api/trials/cafe/${id}`)
      .then(data => setTrial(data.trial))
      .catch(() => setError('Could not load trial details.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { load() }, [load])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) {
      setSubmitError('Please select a star rating.')
      return
    }
    setSubmitting(true)
    setSubmitError('')
    try {
      await api.post(`/api/trials/${id}/feedback`, { rating, notes, would_order_again: wouldOrderAgain })
      setSuccess(true)
      setTimeout(() => router.push('/trials'), 1800)
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to submit feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div>
        <div style={{ height: '50px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 18px', flexShrink: 0 }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>← Trials · Trial Feedback</span>
        </div>
        <div style={{ padding: '18px' }}>
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--border)', padding: '18px' }}>
            <div style={{ width: '180px', height: '14px', background: 'var(--bg)', borderRadius: '4px', marginBottom: '8px' }} />
            <div style={{ width: '120px', height: '12px', background: 'var(--bg)', borderRadius: '4px' }} />
          </div>
        </div>
      </div>
    )
  }

  if (error || !trial) {
    return (
      <div>
        <div style={{ height: '50px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 18px', flexShrink: 0 }}>
          <Link href="/trials" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>← Trials</Link>
        </div>
        <div style={{ padding: '18px' }}>
          <p style={{ color: '#dc2626', fontSize: '13px' }}>{error || 'Trial not found.'}</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div>
        <div style={{ height: '50px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 18px', flexShrink: 0 }}>
          <Link href="/trials" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>← Trials</Link>
        </div>
        <div style={{ padding: '18px' }}>
          <div style={{ background: 'var(--badge-accepted-bg)', borderRadius: '10px', border: '1px solid var(--border)', padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>✓</div>
            <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--badge-accepted-text)', margin: 0 }}>Feedback submitted!</p>
            <p style={{ fontSize: '12px', color: 'var(--badge-accepted-text)', marginTop: '5px' }}>Redirecting to trials…</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Breadcrumb topbar */}
      <div style={{ height: '50px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 18px', gap: '6px', flexShrink: 0 }}>
        <Link href="/trials" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>← Trials</Link>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>·</span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Trial Feedback</span>
      </div>

      <div style={{ padding: '18px', maxWidth: '560px' }}>
        {/* Trial product info */}
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--border)', padding: '16px', marginBottom: '12px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>Trial Product</div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>{trial.product_name}</div>
          <div style={{ fontSize: '12px', color: 'var(--portal-primary)', fontWeight: 500 }}>by {trial.brand_name}</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--border)', padding: '18px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Star rating */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Rating <span style={{ color: 'var(--portal-primary)' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '5px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', fontSize: '28px', lineHeight: 1, color: star <= (hoverRating || rating) ? '#F59E0B' : 'var(--border)', transition: 'color 0.1s' }}
                  >
                    ★
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Your Feedback</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Share your thoughts — taste, quality, packaging, etc."
                rows={4}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-primary)', resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6 }}
              />
            </div>

            {/* Would order again */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '9px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={wouldOrderAgain}
                  onChange={e => setWouldOrderAgain(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--portal-primary)', cursor: 'pointer', flexShrink: 0 }}
                />
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>I would order this regularly</span>
              </label>
            </div>

            {submitError && <p style={{ color: '#dc2626', fontSize: '12px', margin: 0 }}>{submitError}</p>}

            <button type="submit" disabled={submitting} className="btn-primary" style={{ opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '13px', padding: '11px' }}>
              {submitting ? 'Submitting…' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
