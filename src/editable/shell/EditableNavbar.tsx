'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, LogIn, Menu, PlusCircle, Search, UserPlus, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

const hiddenTaskKeys = new Set(['classified', 'profile'])

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()
  const navItems = useMemo(
    () =>
      SITE_CONFIG.tasks
        .filter((task) => task.enabled && !hiddenTaskKeys.has(task.key))
        .map((task) => ({ label: task.label, href: task.route })),
    []
  )

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--editable-border)] bg-[var(--editable-nav-bg)] text-[var(--editable-nav-text)] backdrop-blur-xl">
      <nav className="mx-auto flex min-h-[72px] w-full max-w-[var(--editable-container)] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--slot4-accent)] text-sm font-black text-white shadow-[0_10px_22px_rgba(112,113,232,0.25)]">
            <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-4 w-4 object-contain" />
          </span>
          <span className="min-w-0">
            <span className="editable-display block truncate text-[1.05rem] font-black uppercase tracking-[-0.03em] sm:text-[1.15rem]">
              {SITE_CONFIG.name}
            </span>
          </span>
          <span className="hidden rounded-md border border-[var(--editable-border)] bg-white px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--slot4-muted-text)] lg:inline-flex">
            {globalContent.nav?.tagline || SITE_CONFIG.tagline}
          </span>
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {[{ label: 'Home', href: '/' }, ...navItems.slice(0, 5)].map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition ${
                  active
                    ? 'bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]'
                    : 'text-[var(--slot4-muted-text)] hover:bg-white hover:text-[var(--slot4-page-text)]'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <form action="/search" className="hidden flex-1 justify-center xl:flex">
          <label className="flex w-full max-w-[340px] items-center gap-3 rounded-full border border-[var(--editable-border)] bg-white px-4 py-2 shadow-[0_10px_30px_rgba(16,24,40,0.05)]">
            <Search className="h-4 w-4 shrink-0 text-[var(--slot4-muted-text)]" />
            <input
              name="q"
              type="search"
              placeholder="Search businesses, profiles, posts"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--slot4-soft-muted-text)]"
            />
          </label>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {session ? (
            <>
              <Link
                href="/create"
                className="hidden items-center gap-2 rounded-full bg-[var(--editable-cta-bg)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--editable-cta-text)] shadow-[0_12px_24px_rgba(112,113,232,0.22)] transition hover:-translate-y-0.5 sm:inline-flex"
              >
                <PlusCircle className="h-3.5 w-3.5" /> Create
              </Link>
              <button
                type="button"
                onClick={logout}
                className="hidden rounded-full border border-[var(--editable-border)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--slot4-muted-text)] transition hover:bg-white hover:text-[var(--slot4-page-text)] sm:inline-flex"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden items-center gap-2 rounded-full border border-[var(--editable-border)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--slot4-muted-text)] transition hover:bg-white hover:text-[var(--slot4-page-text)] sm:inline-flex"
              >
                <LogIn className="h-3.5 w-3.5" /> Login
              </Link>
              <Link
                href="/signup"
                className="hidden items-center gap-2 rounded-full bg-[var(--editable-cta-bg)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--editable-cta-text)] shadow-[0_12px_24px_rgba(112,113,232,0.22)] transition hover:-translate-y-0.5 sm:inline-flex"
              >
                <UserPlus className="h-3.5 w-3.5" /> Sign up
              </Link>
            </>
          )}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--editable-border)] bg-white text-[var(--slot4-accent)] shadow-[0_10px_24px_rgba(16,24,40,0.05)] lg:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <button
            type="button"
            className="hidden h-10 w-10 items-center justify-center rounded-2xl border border-[var(--editable-border)] bg-white text-[#f59e0b] shadow-[0_10px_24px_rgba(16,24,40,0.05)] lg:inline-flex"
            aria-label="Theme options"
          >
            <span className="text-base">*</span>
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-[var(--editable-border)] bg-white/95 px-4 py-4 lg:hidden">
          <form action="/search" className="mb-4">
            <label className="flex items-center gap-3 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-page-bg)] px-4 py-3">
              <Search className="h-4 w-4 text-[var(--slot4-muted-text)]" />
              <input
                name="q"
                type="search"
                placeholder="Search the site"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--slot4-soft-muted-text)]"
              />
            </label>
          </form>
          <div className="grid gap-2">
            {[{ label: 'Home', href: '/' }, ...navItems, { label: 'Contact', href: '/contact' }].map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold ${
                    active ? 'bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]' : 'bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]'
                  }`}
                >
                  {item.label}
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </Link>
              )
            })}
            {session ? (
              <button type="button" onClick={logout} className="rounded-2xl bg-[var(--slot4-page-bg)] px-4 py-3 text-left text-sm font-semibold">
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="rounded-2xl bg-[var(--slot4-page-bg)] px-4 py-3 text-sm font-semibold">
                  Login
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="rounded-2xl bg-[var(--slot4-accent)] px-4 py-3 text-sm font-semibold text-white">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}
