'use client'

import Link from 'next/link'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableFooter() {
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <footer className="mt-auto bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--slot4-accent)] text-white">
                <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-5 w-5 object-contain" />
              </span>
              <span className="editable-display text-xl font-black uppercase tracking-[-0.03em]">{SITE_CONFIG.name}</span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/70">
              {globalContent.footer?.description || SITE_CONFIG.description}
            </p>
          </div>

          

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/50">Pages</h3>
            <div className="mt-5 grid gap-3">
              <Link href="/about" className="text-sm font-medium text-white/80 transition hover:text-white">About</Link>
              <Link href="/contact" className="text-sm font-medium text-white/80 transition hover:text-white">Contact</Link>
              {session ? (
                <>
                  <Link href="/create" className="text-sm font-medium text-white/80 transition hover:text-white">Create</Link>
                  <button type="button" onClick={logout} className="text-left text-sm font-medium text-white/80 transition hover:text-white">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-white/80 transition hover:text-white">Login</Link>
                  <Link href="/signup" className="text-sm font-medium text-white/80 transition hover:text-white">Sign up</Link>
                </>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/50">Note</h3>
            <p className="mt-5 text-sm leading-7 text-white/70">
              Curated public pages, profiles, and business highlights presented in a cleaner discovery format.
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-white/45">
        (c) {year} {SITE_CONFIG.name}. All rights reserved.
      </div>
    </footer>
  )
}
