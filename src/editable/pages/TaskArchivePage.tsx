import Link from 'next/link'
import { ArrowUpRight, BriefcaseBusiness, ChevronDown, FileText, Search, Star, UserRound } from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo) || asText(content.avatar)
  return [...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])].filter(Boolean).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const getSummary = (post: SitePost) =>
  stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body)) || 'Explore the full post for more details.'
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
}

export function TaskArchiveView({ task, posts, pagination, category, basePath }: { task: TaskKey; posts: SitePost[]; pagination: SiteFeedPagination; category: string; basePath: string }) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const label = taskConfig?.label || task
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category
  const lead = posts[0]
  const rest = posts.slice(1)
  const archiveAdSlot: Record<TaskKey, 'header' | 'sidebar' | 'in-feed' | 'article-bottom' | 'footer'> = {
    article: 'in-feed',
    listing: 'header',
    classified: 'in-feed',
    image: 'footer',
    sbm: 'footer',
    pdf: 'article-bottom',
    profile: 'sidebar',
  }

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        <header className="relative overflow-hidden border-b border-[var(--tk-line)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(58%_58%_at_50%_0%,var(--tk-glow),transparent_75%)]" />
          <div className="relative mx-auto max-w-[var(--editable-container)] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div className="rounded-[2rem] border border-[var(--tk-line)] bg-white p-6 shadow-[0_22px_52px_rgba(16,24,40,0.08)] sm:p-8 lg:p-10">
              <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--tk-accent)]">{theme.kicker}</p>
                  <h1 className="editable-display mt-4 text-4xl font-black leading-[1.02] tracking-[-0.04em] sm:text-5xl">
                    {voice?.headline || `Browse ${label}`}
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--tk-muted)]">
                    {voice?.description || theme.note}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {(voice?.chips || ['Curated', 'Responsive', 'Fresh']).slice(0, 4).map((chip) => (
                      <span key={chip} className="rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--tk-muted)]">
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,#f2ecff_0%,#fff4fb_100%)] p-5 sm:p-6">
                  <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
                    <div>
                      <p className="text-sm font-semibold text-[var(--tk-text)]">
                        <span className="font-black">{posts.length}</span> posts in view
                      </p>
                      <p className="mt-1 text-sm text-[var(--tk-muted)]">{categoryLabel}</p>
                    </div>
                    <form action={basePath} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                      <label className="relative block">
                        <select
                          name="category"
                          defaultValue={category}
                          className="h-12 w-full appearance-none rounded-full border border-[var(--tk-line)] bg-white pl-4 pr-10 text-sm font-medium outline-none transition focus:border-[var(--tk-accent)]"
                        >
                          <option value="all">All categories</option>
                          {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tk-muted)]" />
                      </label>
                      <button className="h-12 rounded-full bg-[var(--tk-accent)] px-5 text-sm font-black text-[var(--tk-on-accent)] shadow-[0_14px_28px_rgba(112,113,232,0.22)]">
                        Apply
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-12 sm:px-6 lg:px-8">
          {lead ? (
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <FeaturedArchiveCard post={lead} href={`${basePath}/${lead.slug}` || buildPostUrl(task, lead.slug)} task={task} />
              <div className="grid gap-5">
                {rest.slice(0, 3).map((post, index) => (
                  <CompactArchiveCard key={post.id || post.slug || index} post={post} href={`${basePath}/${post.slug}` || buildPostUrl(task, post.slug)} task={task} />
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-[1.75rem] border border-dashed border-[var(--tk-line)] bg-white px-8 py-16 text-center shadow-[0_20px_44px_rgba(16,24,40,0.06)]">
              <Search className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
              <h2 className="editable-display mt-5 text-2xl font-black tracking-[-0.03em]">Nothing here yet</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--tk-muted)]">Try another category, or check back after new content is published.</p>
            </div>
          )}

          <div className="mx-auto max-w-6xl px-4 py-6">
            <Ads slot={archiveAdSlot[task]} showLabel eager className="mx-auto w-full" />
          </div>

          {rest.length ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {rest.slice(3).map((post, index) => (
                <MosaicArchiveCard key={post.id || post.slug || index} post={post} href={`${basePath}/${post.slug}` || buildPostUrl(task, post.slug)} task={task} index={index} />
              ))}
            </div>
          ) : null}

          {posts.length ? (
            <nav className="mt-14 flex items-center justify-center gap-3 text-sm">
              {pagination.hasPrevPage ? <Link href={pageHref(basePath, category, page - 1)} className="rounded-full border border-[var(--tk-line)] bg-white px-5 py-3 font-semibold transition hover:border-[var(--tk-accent)]">Prev</Link> : <span className="rounded-full border border-[var(--tk-line)] bg-white/60 px-5 py-3 font-semibold text-[var(--tk-muted)]">Prev</span>}
              <span className="rounded-full bg-[var(--tk-accent)] px-5 py-3 font-black text-[var(--tk-on-accent)]">{page}</span>
              {pagination.hasNextPage ? <Link href={pageHref(basePath, category, page + 1)} className="rounded-full border border-[var(--tk-line)] bg-white px-5 py-3 font-semibold transition hover:border-[var(--tk-accent)]">Next</Link> : <span className="rounded-full border border-[var(--tk-line)] bg-white/60 px-5 py-3 font-semibold text-[var(--tk-muted)]">Next</span>}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function ratingOf(post: SitePost) {
  const real = Number(getContent(post).rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return 4.2
}

function RatingLine({ post }: { post: SitePost }) {
  const rating = ratingOf(post)
  return (
    <div className="mt-3 flex items-center gap-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className={`h-4 w-4 ${i < Math.round(rating) ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
      ))}
      <span className="text-sm font-semibold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
    </div>
  )
}

function metaBits(post: SitePost) {
  const location = getField(post, ['location', 'address', 'city', 'state']) || 'Featured location'
  const domain = (getField(post, ['website', 'url']) || post.slug || post.title || 'site').replace(/^https?:\/\//i, '').replace(/\/$/, '').toUpperCase()
  return { location, domain }
}

function FeaturedArchiveCard({ post, href, task }: { post: SitePost; href: string; task: TaskKey }) {
  const image = getImage(post)
  const { location, domain } = metaBits(post)
  return (
    <article className="overflow-hidden rounded-[1.8rem] border border-[var(--tk-line)] bg-white shadow-[0_22px_52px_rgba(16,24,40,0.08)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <Link href={href} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-[#ffd21f] px-6 py-3 text-sm font-black text-[#111827] shadow-[0_16px_30px_rgba(255,210,31,0.24)]">
          View Business Website
        </Link>
      </div>
      <div className="bg-[#060b22] px-5 py-4" />
      <div className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full border border-[#c7d2fe] bg-[#eef2ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#4f46e5]">{domain}</span>
          <span className="rounded-full bg-[#ff7a1a] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white">{location}</span>
        </div>
        <h2 className="mt-4 text-3xl font-black leading-tight tracking-[-0.03em]">{post.title}</h2>
        <RatingLine post={post} />
        <p className="mt-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-5 flex items-center justify-between border-t border-[var(--tk-line)] pt-4 text-sm">
          <span className="text-[var(--tk-muted)]">{getCategory(post, task)}</span>
          <Link href={href} className="font-bold text-[#0284c7]">Launch WebSite</Link>
        </div>
      </div>
    </article>
  )
}

function CompactArchiveCard({ post, href, task }: { post: SitePost; href: string; task: TaskKey }) {
  const role = getField(post, ['role', 'designation', 'company', 'condition', 'price']) || getCategory(post, task)
  const { location } = metaBits(post)
  return (
    <Link href={href} className="rounded-[1.5rem] border border-[var(--tk-line)] bg-white p-5 shadow-[0_20px_44px_rgba(16,24,40,0.08)] transition hover:-translate-y-1">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
          {task === 'profile' ? <UserRound className="h-6 w-6" /> : task === 'listing' ? <BriefcaseBusiness className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--tk-accent)]">{role}</p>
          <h3 className="mt-2 line-clamp-2 text-lg font-black leading-snug tracking-[-0.03em]">{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{location}</p>
        </div>
      </div>
    </Link>
  )
}

function MosaicArchiveCard({ post, href, task, index }: { post: SitePost; href: string; task: TaskKey; index: number }) {
  if (index % 3 === 0) return <HorizontalArchiveCard post={post} href={href} task={task} />
  if (index % 3 === 1) return <EditorialArchiveCard post={post} href={href} task={task} />
  return <ImageArchiveCard post={post} href={href} task={task} />
}

function HorizontalArchiveCard({ post, href, task }: { post: SitePost; href: string; task: TaskKey }) {
  const image = getImage(post)
  const { location, domain } = metaBits(post)
  return (
    <article className="group grid overflow-hidden rounded-[1.6rem] border border-[var(--tk-line)] bg-white shadow-[0_20px_44px_rgba(16,24,40,0.08)]">
      <div className="relative aspect-[16/11] overflow-hidden bg-[var(--tk-raised)]">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
        <Link href={href} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-[#ffd21f] px-6 py-3 text-sm font-black text-[#111827]">View Business Website</Link>
      </div>
      <div className="bg-[#060b22] px-5 py-4" />
      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full border border-[#c7d2fe] bg-[#eef2ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#4f46e5]">{domain}</span>
          <span className="rounded-full bg-[#ff7a1a] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white">{location}</span>
        </div>
        <h3 className="mt-4 text-xl font-black leading-snug tracking-[-0.03em]">{post.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-[var(--tk-muted)]">{getCategory(post, task)}</span>
          <ArrowUpRight className="h-4 w-4 text-[var(--tk-accent)]" />
        </div>
      </div>
    </article>
  )
}

function EditorialArchiveCard({ post, href, task }: { post: SitePost; href: string; task: TaskKey }) {
  return (
    <Link href={href} className="rounded-[1.6rem] border border-[var(--tk-line)] bg-white p-6 shadow-[0_20px_44px_rgba(16,24,40,0.08)] transition hover:-translate-y-1">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tk-accent)]">{getCategory(post, task)}</p>
      <h3 className="mt-4 text-[1.55rem] font-black leading-tight tracking-[-0.03em]">{post.title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[var(--tk-accent)]">
        Open details <ArrowUpRight className="h-4 w-4" />
      </span>
    </Link>
  )
}

function ImageArchiveCard({ post, href, task }: { post: SitePost; href: string; task: TaskKey }) {
  const image = getImage(post)
  const { location } = metaBits(post)
  return (
    <article className="overflow-hidden rounded-[1.6rem] border border-[var(--tk-line)] bg-white shadow-[0_20px_44px_rgba(16,24,40,0.08)]">
      <div className="relative aspect-[16/12] overflow-hidden bg-[var(--tk-raised)]">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <Link href={href} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-[#ffd21f] px-6 py-3 text-sm font-black text-[#111827]">View Business Website</Link>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--tk-accent)]">{getCategory(post, task)}</span>
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#ff7a1a]">{location}</span>
        </div>
        <h3 className="mt-4 text-xl font-black leading-snug tracking-[-0.03em]">{post.title}</h3>
      </div>
    </article>
  )
}
