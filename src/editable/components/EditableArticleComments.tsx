'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { MessageCircle, Send } from 'lucide-react'

type Comment = { id: string; name: string; comment: string; createdAt: string }

const storageKey = (slug: string) => `editable:article-comments:${slug}`

function timeAgo(value?: string) {
  if (!value) return ''
  const then = new Date(value).getTime()
  if (Number.isNaN(then)) return ''
  const mins = Math.max(1, Math.floor((Date.now() - then) / 60000))
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`
  return new Date(then).toLocaleDateString()
}

function initial(name: string) {
  return (name.trim()[0] || 'G').toUpperCase()
}

export function EditableArticleComments({ slug, comments = [] }: { slug: string; comments?: Comment[] }) {
  const [stored, setStored] = useState<Comment[]>([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(slug))
      setStored(raw ? (JSON.parse(raw) as Comment[]) : [])
    } catch {
      setStored([])
    }
  }, [slug])

  const persist = (next: Comment[]) => {
    setStored(next)
    try {
      window.localStorage.setItem(storageKey(slug), JSON.stringify(next))
    } catch {
      setStored(next)
    }
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const body = text.trim()
    if (!body) return
    const entry: Comment = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim() || 'Guest',
      comment: body,
      createdAt: new Date().toISOString(),
    }
    persist([entry, ...stored])
    setText('')
  }

  const all = useMemo(() => [...stored, ...comments], [stored, comments])

  return (
    <section className="mt-16">
      <div className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-[0_20px_44px_rgba(16,24,40,0.08)] sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
            <MessageCircle className="h-5 w-5" />
          </span>
          <div>
            <h2 className="editable-display text-2xl font-black tracking-[-0.03em]">Comments</h2>
            <p className="text-sm text-[var(--tk-muted)]">{all.length} responses so far</p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 rounded-[1.5rem] bg-[var(--tk-raised)] p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)]">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              maxLength={60}
              className="h-12 rounded-2xl border border-[var(--tk-line)] bg-white px-4 text-sm text-[var(--tk-text)] outline-none transition focus:border-[var(--tk-accent)]"
            />
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Share your thoughts"
              rows={3}
              maxLength={1500}
              className="min-h-[120px] resize-y rounded-2xl border border-[var(--tk-line)] bg-white px-4 py-3 text-sm leading-6 text-[var(--tk-text)] outline-none transition focus:border-[var(--tk-accent)]"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={!text.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-6 py-3 text-sm font-black text-[var(--tk-on-accent)] shadow-[0_14px_28px_rgba(112,113,232,0.22)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> Post comment
            </button>
          </div>
        </form>

        <div className="mt-6 grid gap-4">
          {all.length ? (
            all.map((comment) => (
              <div key={comment.id} className="rounded-[1.5rem] border border-[var(--tk-line)] bg-white p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-sm font-black text-[var(--tk-accent)]">
                    {initial(comment.name)}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[var(--tk-text)]">{comment.name || 'Guest'}</p>
                    <p className="text-xs text-[var(--tk-muted)]">{timeAgo(comment.createdAt)}</p>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--tk-text)]">{comment.comment}</p>
              </div>
            ))
          ) : (
            <p className="rounded-[1.5rem] border border-dashed border-[var(--tk-line)] bg-[var(--tk-raised)] px-5 py-6 text-sm text-[var(--tk-muted)]">
              Be the first to share a thoughtful note on this page.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
