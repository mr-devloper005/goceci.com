import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

export type TaskTheme = {
  kicker: string
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const FONT = "'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif"
const BODY = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"

const base = {
  dark: false,
  fontDisplay: FONT,
  fontBody: BODY,
  bg: '#f4f7fb',
  surface: '#ffffff',
  raised: '#f7f9fd',
  text: '#0f1728',
  muted: '#667085',
  line: '#d7deea',
  accent: '#7071E8',
  accentSoft: '#ede9ff',
  onAccent: '#ffffff',
  glow: 'rgba(198,131,215,0.18)',
  radius: '1.75rem',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Editorial', note: 'Longer reads with clearer pacing and polished presentation.' },
  listing: { ...base, kicker: 'Directory', note: 'Business profiles arranged for quick scanning and easy contact.' },
  classified: { ...base, kicker: 'Marketplace', note: 'Offers and notices with strong calls to action.' },
  image: { ...base, kicker: 'Gallery', note: 'Image-first browsing with a clean, immersive frame.' },
  sbm: { ...base, kicker: 'Collections', note: 'Curated links and saved resources in a lighter format.' },
  pdf: { ...base, kicker: 'Library', note: 'Documents and downloads with structured previews.' },
  profile: { ...base, kicker: 'Profiles', note: 'People and business identities with contact-first layouts.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
