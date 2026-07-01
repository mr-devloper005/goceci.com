import type { CSSProperties } from 'react'

export const editableRootStyle = {
  '--slot4-page-bg': '#f4f7fb',
  '--slot4-page-text': '#101828',
  '--slot4-panel-bg': '#ffffff',
  '--slot4-surface-bg': '#ffffff',
  '--slot4-muted-text': '#667085',
  '--slot4-soft-muted-text': '#98a2b3',
  '--slot4-accent': '#7071E8',
  '--slot4-accent-fill': '#7071E8',
  '--slot4-accent-soft': '#ede9ff',
  '--slot4-on-accent': '#ffffff',
  '--slot4-dark-bg': '#0b1020',
  '--slot4-dark-text': '#ffffff',
  '--slot4-media-bg': '#dde3f0',
  '--slot4-cream': '#fff7fb',
  '--slot4-warm': '#fff5f9',
  '--slot4-lavender': '#f2ecff',
  '--slot4-gray': '#eef2f7',
  '--slot4-body-gradient':
    'radial-gradient(circle at top, rgba(198,131,215,0.16), transparent 30%), linear-gradient(180deg, #fbfcff 0%, #f4f7fb 48%, #eef3f8 100%)',
  '--editable-page-bg': '#f4f7fb',
  '--editable-page-text': '#101828',
  '--editable-container': '1520px',
  '--editable-border': '#d7deea',
  '--editable-nav-bg': 'rgba(255,255,255,0.92)',
  '--editable-nav-text': '#101828',
  '--editable-nav-active': '#7071E8',
  '--editable-nav-active-text': '#ffffff',
  '--editable-cta-bg': '#7071E8',
  '--editable-cta-text': '#ffffff',
  '--editable-search-bg': '#ffffff',
  '--editable-footer-bg': '#232323',
  '--editable-footer-text': '#ffffff',
} as CSSProperties

export const editablePalette = {
  pageBg: 'bg-[var(--slot4-page-bg)]',
  pageText: 'text-[var(--slot4-page-text)]',
  panelBg: 'bg-[var(--slot4-panel-bg)]',
  panelText: 'text-[var(--slot4-page-text)]',
  surfaceBg: 'bg-[var(--slot4-surface-bg)]',
  surfaceText: 'text-[var(--slot4-page-text)]',
  mutedText: 'text-[var(--slot4-muted-text)]',
  softMutedText: 'text-[var(--slot4-soft-muted-text)]',
  accentText: 'text-[var(--slot4-accent)]',
  accentBg: 'bg-[var(--slot4-accent-fill)]',
  accentSoftBg: 'bg-[var(--slot4-accent-soft)]',
  accentSoftText: 'text-[var(--slot4-accent-soft)]',
  onAccentText: 'text-[var(--slot4-on-accent)]',
  darkBg: 'bg-[var(--slot4-dark-bg)]',
  darkText: 'text-[var(--slot4-dark-text)]',
  mediaBg: 'bg-[var(--slot4-media-bg)]',
  creamBg: 'bg-[var(--slot4-cream)]',
  warmBg: 'bg-[var(--slot4-warm)]',
  lavenderBg: 'bg-[var(--slot4-lavender)]',
  grayBg: 'bg-[var(--slot4-gray)]',
  border: 'border-[var(--editable-border)]',
  darkBorder: 'border-white/10',
  shadow: 'shadow-[0_20px_45px_rgba(16,24,40,0.08)]',
  shadowStrong: 'shadow-[0_30px_80px_rgba(11,16,32,0.22)]',
  overlay: 'bg-[linear-gradient(180deg,rgba(11,16,32,0.05),rgba(11,16,32,0.8))]',
} as const

export const editableDesignContract = {
  shell: {
    page: `min-h-screen ${editablePalette.pageBg} ${editablePalette.pageText}`,
    section: 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8',
    sectionY: 'py-14 sm:py-16 lg:py-20',
  },
  layout: {
    safeGrid: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
    featureGrid: 'grid gap-8 lg:grid-cols-[1.15fr_0.85fr]',
    rail: 'flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    minRailCard: 'w-[260px] shrink-0 snap-start',
  },
  type: {
    eyebrow: 'text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--slot4-accent)]',
    heroTitle: 'text-4xl font-black leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-[3.8rem]',
    sectionTitle: 'text-3xl font-black tracking-[-0.03em] sm:text-4xl',
    body: 'text-base leading-relaxed',
  },
  surface: {
    card: `rounded-[1.75rem] border ${editablePalette.border} ${editablePalette.surfaceBg} ${editablePalette.shadow}`,
    soft: `rounded-[1.75rem] border ${editablePalette.border} ${editablePalette.panelBg}`,
    dark: `rounded-[2rem] ${editablePalette.darkBg} ${editablePalette.darkText} ${editablePalette.shadowStrong}`,
  },
  button: {
    primary:
      'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-6 py-3 text-sm font-bold tracking-[0.01em] text-[var(--slot4-on-accent)] shadow-[0_14px_30px_rgba(112,113,232,0.28)] transition duration-300 hover:-translate-y-0.5 hover:brightness-95',
    secondary:
      'inline-flex items-center justify-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-6 py-3 text-sm font-bold tracking-[0.01em] text-[var(--slot4-page-text)] transition duration-300 hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]',
    accent:
      'inline-flex items-center justify-center gap-2 rounded-full bg-[#ffd21f] px-6 py-3 text-sm font-black text-[#111827] shadow-[0_14px_30px_rgba(255,210,31,0.28)] transition duration-300 hover:-translate-y-0.5 hover:brightness-95',
  },
  media: {
    frame: `relative overflow-hidden rounded-[1.5rem] ${editablePalette.mediaBg}`,
    ratio: 'aspect-[16/11]',
  },
  motion: {
    lift: 'transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_56px_rgba(16,24,40,0.14)]',
    fade: 'transition duration-300 hover:opacity-85',
  },
} as const

export const aiLayoutRules = [
  'Keep all redesign work inside src/editable.',
  'Use the shared CSS variables first so navbar, footer, archive pages and detail pages all align visually.',
  'Prefer multiple card silhouettes instead of repeating one card style.',
  'Preserve dynamic post fetching and route generation exactly as wired.',
  'Always provide safe fallbacks for image, summary, category, and optional business fields.',
] as const
