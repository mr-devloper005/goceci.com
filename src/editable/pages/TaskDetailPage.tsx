import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, Bookmark, Building2, Camera, Download, ExternalLink, FileText, Globe2, Mail, MapPin, Phone, Star, UserRound } from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
const safeUrl = (value: string) => (/^https?:\/\//i.test(value) ? value : '#')
const linkifyMarkdown = (value: string) => value.replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)
const linkifyText = (value: string) => linkifyMarkdown(value).replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)
const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})
const sanitizeHtml = (html: string) => hardenLinks(html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '').replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))
const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value.split(/\n{2,}/).map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`).join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

export function TaskDetailView({ task, post, related, comments = [] }: { task: TaskKey; post: SitePost; related: SitePost[]; comments?: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

function ratingOf(post: SitePost) {
  const real = Number(getContent(post).rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return 4.3
}

function DetailMeta({ post, category, center = false }: { post: SitePost; category?: string; center?: boolean }) {
  const rating = ratingOf(post)
  return (
    <div className={`mt-4 flex flex-wrap items-center gap-3 ${center ? 'justify-center' : ''}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className={`h-4 w-4 ${i < Math.round(rating) ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
      ))}
      <span className="text-sm font-bold">{rating.toFixed(1)}</span>
      {category ? <span className="rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--tk-accent)]">{category}</span> : null}
    </div>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  return (
    <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--tk-muted)] transition hover:text-[var(--tk-text)]">
      <ArrowLeft className="h-4 w-4" /> Back to {taskConfig?.label || 'posts'}
    </Link>
  )
}

function HeaderCard({ task, post, icon, badge }: { task: TaskKey; post: SitePost; icon: React.ReactNode; badge: string }) {
  const images = getImages(post)
  const hero = images[0] || '/placeholder.svg?height=900&width=1400'
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-4 pt-10 sm:px-6 lg:px-8">
      <BackLink task={task} />
      <div className="mt-6 overflow-hidden rounded-[2rem] border border-[var(--tk-line)] bg-white shadow-[0_24px_56px_rgba(16,24,40,0.08)]">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative min-h-[320px] bg-[var(--tk-raised)]">
            <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <div className="p-7 sm:p-9">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
              {icon}
            </div>
            <p className="mt-5 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--tk-accent)]">{badge}</p>
            <h1 className="editable-display mt-3 text-3xl font-black leading-[1.05] tracking-[-0.04em] sm:text-4xl">{post.title}</h1>
            <DetailMeta post={post} category={categoryOf(post, badge)} />
            {leadText(post) ? <p className="mt-5 text-base leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
          </div>
        </div>
      </div>
    </section>
  )
}

function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <>
      <HeaderCard task="article" post={post} icon={<FileText className="h-6 w-6" />} badge="Editorial" />
      <article className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 rounded-[2rem] border border-[var(--tk-line)] bg-white p-7 shadow-[0_20px_44px_rgba(16,24,40,0.08)] sm:p-9">
            <BodyContent post={post} />
            <div className="mx-auto max-w-6xl px-4 py-6">
              <Ads slot="article-bottom" showLabel eager className="mx-auto w-full" />
            </div>
            <EditableArticleComments slug={post.slug} comments={comments} />
          </div>
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <InfoPanel items={[['Published by', SITE_CONFIG.name, FileText], ['Category', categoryOf(post, 'Article'), Star]]} />
            <RelatedPanel task="article" post={post} related={related} />
          </aside>
        </div>
      </article>
    </>
  )
}

function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const mapSrc = mapSrcFor(post)
  return (
    <>
      <HeaderCard task="listing" post={post} icon={<Building2 className="h-6 w-6" />} badge="Business listing" />
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <article className="min-w-0 rounded-[2rem] border border-[var(--tk-line)] bg-white p-7 shadow-[0_20px_44px_rgba(16,24,40,0.08)] sm:p-9">
            <InfoGrid items={[['Location', address, MapPin], ['Phone', phone, Phone], ['Email', email, Mail], ['Website', website, Globe2]]} />
            <Divider />
            <BodyContent post={post} />
            <div className="mx-auto max-w-6xl px-4 py-6">
              <Ads slot="in-feed" showLabel eager className="mx-auto w-full" />
            </div>
            <ImageStrip images={getImages(post).slice(1)} label="Photos from this page" />
          </article>
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {mapSrc ? <MapBox src={mapSrc} label={address || post.title} /> : null}
            <ContactAction website={website} phone={phone} email={email} />
            <RelatedPanel task="listing" post={post} related={related} />
          </aside>
        </div>
      </section>
    </>
  )
}

function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const price = getField(post, ['price', 'amount', 'budget']) || 'Open offer'
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-4 pt-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-[var(--tk-line)] bg-white shadow-[0_24px_56px_rgba(16,24,40,0.08)]">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative min-h-[320px] bg-[var(--tk-raised)]">
              <img src={getImages(post)[0] || '/placeholder.svg?height=900&width=1400'} alt="" className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <div className="p-7 sm:p-9">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
                <Bookmark className="h-6 w-6" />
              </div>
              <p className="mt-5 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--tk-accent)]">Classified</p>
              <h1 className="editable-display mt-3 text-3xl font-black leading-[1.05] tracking-[-0.04em] sm:text-4xl">{post.title}</h1>
              <DetailMeta post={post} category={categoryOf(post, 'Classified')} />
              {leadText(post) ? <p className="mt-5 text-base leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="rounded-[2rem] border border-[var(--tk-line)] bg-white p-7 shadow-[0_20px_44px_rgba(16,24,40,0.08)] lg:sticky lg:top-24 lg:self-start">
            <p className="text-4xl font-black tracking-[-0.04em] text-[var(--tk-accent)]">{price}</p>
            <div className="mt-5 space-y-3">
              {location ? <BadgeLine label="Location" value={location} /> : null}
              <BadgeLine label="Category" value={categoryOf(post, 'Classified')} />
            </div>
            <div className="mt-6">
              <ContactAction website={website} phone={phone} email={email} bare />
            </div>
          </aside>
          <article className="rounded-[2rem] border border-[var(--tk-line)] bg-white p-7 shadow-[0_20px_44px_rgba(16,24,40,0.08)] sm:p-9">
            <ImageStrip images={getImages(post)} label="Offer images" large />
            <BodyContent post={post} />
            <div className="mx-auto max-w-6xl px-4 py-6">
              <Ads slot="footer" showLabel eager className="mx-auto w-full" />
            </div>
          </article>
        </div>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <HeaderCard task="image" post={post} icon={<Camera className="h-6 w-6" />} badge="Gallery" />
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {gallery.map((image, index) => (
              <figure key={`${image}-${index}`} className="overflow-hidden rounded-[1.5rem] border border-[var(--tk-line)] bg-white shadow-[0_20px_44px_rgba(16,24,40,0.08)]">
                <img src={image} alt="" className="aspect-[4/3] w-full object-cover" />
              </figure>
            ))}
          </div>
          <div className="rounded-[2rem] border border-[var(--tk-line)] bg-white p-7 shadow-[0_20px_44px_rgba(16,24,40,0.08)] sm:p-9">
            <BodyContent post={post} compact />
            <div className="mx-auto max-w-6xl px-4 py-6">
              <Ads slot="sidebar" showLabel eager className="mx-auto w-full" />
            </div>
          </div>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <>
      <HeaderCard task="sbm" post={post} icon={<Bookmark className="h-6 w-6" />} badge="Saved resource" />
      <article className="mx-auto max-w-[980px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[var(--tk-line)] bg-white p-7 shadow-[0_20px_44px_rgba(16,24,40,0.08)] sm:p-9">
          {website ? (
            <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-black text-[var(--tk-on-accent)]">
              Open resource <ExternalLink className="h-4 w-4" />
            </Link>
          ) : null}
          <BodyContent post={post} />
          <div className="mx-auto max-w-6xl px-4 py-6">
            <Ads slot="header" showLabel eager className="mx-auto w-full" />
          </div>
        </div>
      </article>
      <RelatedStrip task="sbm" related={related} />
    </>
  )
}

function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  return (
    <>
      <HeaderCard task="pdf" post={post} icon={<FileText className="h-6 w-6" />} badge="Document" />
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="rounded-[2rem] border border-[var(--tk-line)] bg-white p-7 shadow-[0_20px_44px_rgba(16,24,40,0.08)] sm:p-9">
            <BodyContent post={post} />
            <div className="mx-auto max-w-6xl px-4 py-6">
              <Ads slot="article-bottom" showLabel eager className="mx-auto w-full" />
            </div>
            {fileUrl ? (
              <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-[var(--tk-line)]">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--tk-line)] bg-[var(--tk-raised)] p-4">
                  <span className="text-sm font-bold">Document preview</span>
                  <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2 text-xs font-black text-[var(--tk-on-accent)]">Download <Download className="h-4 w-4" /></Link>
                </div>
                <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[70vh] w-full bg-[var(--tk-raised)]" />
              </div>
            ) : null}
          </article>
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {fileUrl ? <ContactAction website={fileUrl} bare /> : null}
            <RelatedPanel task="pdf" post={post} related={related} />
          </aside>
        </div>
      </section>
    </>
  )
}

function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  const mapSrc = mapSrcFor(post)
  return (
    <>
      <HeaderCard task="profile" post={post} icon={<UserRound className="h-6 w-6" />} badge="Profile" />
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[2rem] border border-[var(--tk-line)] bg-white p-7 text-center shadow-[0_20px_44px_rgba(16,24,40,0.08)]">
              <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)]">
                {images[0] ? <img src={images[0]} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-14 w-14 text-[var(--tk-muted)]" />}
              </div>
              <h2 className="mt-5 text-2xl font-black tracking-[-0.03em]">{post.title}</h2>
              {role ? <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--tk-accent)]">{role}</p> : null}
              <DetailMeta post={post} center />
              <ContactAction website={website} email={email} bare />
            </div>
            {mapSrc ? <MapBox src={mapSrc} label={getField(post, ['location', 'address', 'city']) || post.title} /> : null}
          </aside>
          <article className="rounded-[2rem] border border-[var(--tk-line)] bg-white p-7 shadow-[0_20px_44px_rgba(16,24,40,0.08)] sm:p-9">
            <BodyContent post={post} />
            <div className="mx-auto max-w-6xl px-4 py-6">
              <Ads slot="sidebar" showLabel eager className="mx-auto w-full" />
            </div>
            <ImageStrip images={images.slice(1)} label="Photos from this profile" />
          </article>
        </div>
      </section>
      <RelatedStrip task="profile" related={related} />
    </>
  )
}

function Divider() {
  return <div className="my-8 h-px bg-[var(--tk-line)]" />
}

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-2 max-w-none text-[var(--tk-text)] ${compact ? 'text-[15px] leading-7' : 'text-[1rem] leading-8'}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function InfoGrid({ items }: { items: Array<[string, string, typeof MapPin]> }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {visible.map(([label, value, Icon]) => (
        <div key={label} className="rounded-[1.4rem] border border-[var(--tk-line)] bg-[var(--tk-raised)] p-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--tk-muted)]"><Icon className="h-4 w-4 text-[var(--tk-accent)]" /> {label}</div>
          <p className="mt-2 break-words text-sm font-semibold leading-6">{value}</p>
        </div>
      ))}
    </div>
  )
}

function InfoPanel({ items }: { items: Array<[string, string, typeof FileText]> }) {
  return (
    <div className="rounded-[2rem] border border-[var(--tk-line)] bg-white p-6 shadow-[0_20px_44px_rgba(16,24,40,0.08)]">
      <div className="grid gap-4">
        {items.map(([label, value, Icon]) => (
          <div key={label} className="rounded-[1.2rem] bg-[var(--tk-raised)] p-4">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--tk-muted)]"><Icon className="h-4 w-4 text-[var(--tk-accent)]" /> {label}</div>
            <p className="mt-2 text-sm font-semibold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-10">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tk-muted)]">{label}</p>
      <div className={`mt-4 grid gap-4 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] rounded-[1.25rem] border border-[var(--tk-line)] object-cover" />)}
      </div>
    </section>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-[var(--tk-line)] bg-white shadow-[0_20px_44px_rgba(16,24,40,0.08)]">
      <div className="flex items-center gap-2 p-4 text-sm font-bold"><MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {label}</div>
      <iframe src={src} title="Map" loading="lazy" className="h-72 w-full border-0" />
    </div>
  )
}

function ContactAction({ website, phone, email, bare = false }: { website?: string; phone?: string; email?: string; bare?: boolean }) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-2.5 ${bare ? 'justify-center' : ''}`}>
      {website ? <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2.5 text-sm font-black text-[var(--tk-on-accent)]">Website <ExternalLink className="h-4 w-4" /></Link> : null}
      {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-sm font-bold"><Phone className="h-4 w-4" /> Call</a> : null}
      {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-sm font-bold"><Mail className="h-4 w-4" /> Email</a> : null}
    </div>
  )
  if (bare) return <div className="mt-6">{buttons}</div>
  return (
    <div className="rounded-[2rem] border border-[var(--tk-line)] bg-white p-6 shadow-[0_20px_44px_rgba(16,24,40,0.08)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tk-muted)]">Quick actions</p>
      <div className="mt-4">{buttons}</div>
    </div>
  )
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-3 text-sm">
      <span className="font-bold uppercase tracking-[0.12em] text-[var(--tk-muted)]">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function RelatedPanel({ task, related }: { task: TaskKey; post: SitePost; related: SitePost[] }) {
  const taskConfig = getTaskConfig(task)
  if (!related.length) return null
  return (
    <div className="rounded-[2rem] border border-[var(--tk-line)] bg-white p-6 shadow-[0_20px_44px_rgba(16,24,40,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="editable-display text-xl font-black tracking-[-0.03em]">More like this</h2>
        <Link href={taskConfig?.route || '/'} className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--tk-accent)]">View all</Link>
      </div>
      <div className="mt-5 grid gap-3">
        {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} />)}
      </div>
    </div>
  )
}

function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-4 pb-14 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-[var(--tk-line)] bg-white p-7 shadow-[0_20px_44px_rgba(16,24,40,0.08)] sm:p-9">
        <div className="flex items-center justify-between">
          <h2 className="editable-display text-2xl font-black tracking-[-0.03em]">More {(taskConfig?.label || 'posts').toLowerCase()}</h2>
          <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-sm font-black text-[var(--tk-accent)]">View all <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} grid />)}
        </div>
      </div>
    </section>
  )
}

function RelatedCard({ task, post, grid = false }: { task: TaskKey; post: SitePost; grid?: boolean }) {
  const image = getImages(post)[0]
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  if (grid) {
    return (
      <Link href={href} className="group block overflow-hidden rounded-[1.5rem] border border-[var(--tk-line)] bg-[var(--tk-raised)] transition hover:-translate-y-1">
        <div className="aspect-[16/10] overflow-hidden bg-white">
          {image ? <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="flex h-full items-center justify-center"><FileText className="h-7 w-7 text-[var(--tk-muted)]" /></div>}
        </div>
        <div className="p-4">
          <h3 className="line-clamp-2 text-base font-black leading-snug tracking-[-0.02em]">{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
        </div>
      </Link>
    )
  }
  return (
    <Link href={href} className="group flex gap-3 rounded-[1.25rem] border border-[var(--tk-line)] bg-[var(--tk-raised)] p-3 transition hover:border-[var(--tk-accent)]">
      {image && task !== 'sbm' ? <img src={image} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" /> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white"><FileText className="h-5 w-5 text-[var(--tk-muted)]" /></div>}
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-black leading-snug tracking-[-0.02em]">{post.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
      </div>
    </Link>
  )
}
