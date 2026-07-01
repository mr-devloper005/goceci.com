import Link from 'next/link'
import { ArrowRight, Building2, Search, Star, UserRound } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditableCategory, getEditableExcerpt, getEditablePostImage, postHref } from '@/editable/cards/PostCards'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8'

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

function locationOf(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (
    (typeof content.location === 'string' && content.location) ||
    (typeof content.address === 'string' && content.address) ||
    (typeof content.city === 'string' && content.city) ||
    (typeof content.state === 'string' && content.state) ||
    ''
  )
}

function domainOf(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const raw =
    (typeof content.website === 'string' && content.website) ||
    (typeof content.url === 'string' && content.url) ||
    post?.slug ||
    post?.title ||
    'featured-site'
  return raw.replace(/^https?:\/\//i, '').replace(/\/$/, '').toUpperCase()
}

function featuredPosts(posts: SitePost[]) {
  return dedupePosts(posts).slice(0, 10)
}

function getStateGroups(posts: SitePost[]) {
  const labels = dedupePosts(posts)
    .map((post) => locationOf(post) || getEditableCategory(post))
    .filter(Boolean)
    .slice(0, 4)
  return labels.length ? labels : ['Kerala', 'Rajasthan', 'Karnataka', 'Tamil Nadu']
}

function FeaturedHeroCard({ post, href }: { post: SitePost; href: string }) {
  const image = getEditablePostImage(post)
  return (
    <article className="relative overflow-hidden rounded-[2rem] bg-[var(--slot4-dark-bg)] text-white shadow-[0_24px_70px_rgba(11,16,32,0.24)]">
      <img src={image} alt={post.title} className="absolute inset-0 h-full w-full object-cover opacity-75" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,12,24,0.88)_0%,rgba(8,12,24,0.6)_45%,rgba(8,12,24,0.45)_100%)]" />
      <div className="relative grid min-h-[385px] gap-6 p-8 lg:grid-cols-[1.15fr_380px] lg:p-10">
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="editable-display max-w-[680px] text-4xl font-black leading-[1.02] tracking-[-0.04em] sm:text-5xl">
              India&apos;s trusted directory of company and business websites
            </h1>
            <p className="mt-4 max-w-[560px] text-base leading-7 text-white/84">
              Submit your website for free and explore a curated collection of standout business pages, profiles, and public listings.
            </p>
          </div>

          <div className="mt-8 max-w-[500px] rounded-[1.6rem] bg-[linear-gradient(135deg,#b4232b_0%,#ef6f3c_100%)] p-6 shadow-[0_20px_50px_rgba(180,35,43,0.28)]">
            <h2 className="editable-display text-3xl font-black tracking-[-0.03em]">Your brand deserves better.</h2>
            <p className="mt-2 text-sm font-medium text-white/82">
              Stand out with a cleaner profile, sharper visuals, and stronger first impressions.
            </p>
            <Link href={href} className="mt-5 inline-flex rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#b4232b]">
              Level up your brand
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-[380px] rounded-[1.6rem] bg-white p-8 text-[var(--slot4-page-text)] shadow-[0_30px_70px_rgba(16,24,40,0.18)]">
            <p className="text-center text-[11px] font-black uppercase tracking-[0.18em] text-[#0b1738]">
              Get started in seconds and put your business in front of more visitors today
            </p>
            <p className="mt-5 text-sm leading-7 text-[var(--slot4-muted-text)]">
              Showcase your website to a wider audience and manage your listing from one simple dashboard.
            </p>
            <Link
              href="/signup"
              className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-[#2f6fed] px-6 py-3 text-sm font-bold text-white shadow-[0_16px_28px_rgba(47,111,237,0.22)]"
            >
              Sign in with Google
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

function SearchBand({ count }: { count: number }) {
  return (
    <section className={container}>
      <div className="-mt-2 rounded-[2rem] border border-[var(--editable-border)] bg-white p-3 shadow-[0_18px_40px_rgba(16,24,40,0.08)] sm:p-4">
        <form action="/search" className="grid gap-3 lg:grid-cols-[1fr_240px_170px]">
          <label className="flex items-center gap-3 rounded-full border border-transparent px-4 py-3">
            <Search className="h-5 w-5 text-[var(--slot4-muted-text)]" />
            <input
              name="q"
              type="search"
              placeholder={`Search ${count || 32} business websites`}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--slot4-muted-text)]"
            />
          </label>
          <label className="relative flex items-center rounded-full border border-[var(--editable-border)] px-4 py-3">
            <select name="category" defaultValue="all" className="h-full w-full appearance-none bg-transparent pr-8 text-sm outline-none">
              <option value="all">All locations</option>
              <option value="featured">Featured</option>
              <option value="business">Business</option>
              <option value="profile">Profiles</option>
            </select>
          </label>
          <button className="rounded-full bg-[#ffd21f] px-6 py-3 text-sm font-black uppercase tracking-[0.06em] text-[#111827] shadow-[0_14px_28px_rgba(255,210,31,0.24)] transition hover:brightness-95">
            Filter websites
          </button>
        </form>
      </div>
    </section>
  )
}

function WebsiteCard({ post, href, variant }: { post: SitePost; href: string; variant: 'featured' | 'compact' | 'horizontal' | 'editorial' | 'image' }) {
  const image = getEditablePostImage(post)
  const title = post.title || 'Untitled post'
  const summary = getEditableExcerpt(post, variant === 'compact' ? 92 : 150) || 'Explore this published page and view its latest public details.'
  const location = locationOf(post) || 'Featured location'
  const category = getEditableCategory(post)
  const domain = domainOf(post)

  if (variant === 'horizontal') {
    return (
      <article className="group grid overflow-hidden rounded-[1.6rem] border border-[var(--editable-border)] bg-white shadow-[0_18px_40px_rgba(16,24,40,0.08)] md:grid-cols-[300px_minmax(0,1fr)]">
        <div className="relative min-h-[240px] overflow-hidden bg-[var(--slot4-media-bg)]">
          <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
          <Link href={href} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-[#ffd21f] px-6 py-3 text-sm font-black text-[#111827] shadow-[0_16px_30px_rgba(255,210,31,0.24)]">
            View Business Website
          </Link>
        </div>
        <div className="flex flex-col p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full border border-[#c7d2fe] bg-[#eef2ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#4f46e5]">{domain}</span>
            <span className="rounded-full bg-[#ff7a1a] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white">{location}</span>
          </div>
          <h3 className="mt-5 text-2xl font-black leading-tight tracking-[-0.03em] text-[var(--slot4-page-text)]">{title}</h3>
          <p className="mt-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{summary}</p>
          <div className="mt-5 flex items-center justify-between border-t border-[var(--editable-border)] pt-4 text-sm">
            <span className="text-[var(--slot4-muted-text)]">Curated public listing</span>
            <Link href={href} className="font-bold text-[#0284c7]">Launch WebSite</Link>
          </div>
        </div>
      </article>
    )
  }

  if (variant === 'editorial') {
    return (
      <article className="group rounded-[1.6rem] border border-[var(--editable-border)] bg-white p-6 shadow-[0_18px_40px_rgba(16,24,40,0.08)]">
        <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--slot4-accent)]">
          <span>{category}</span>
          <span className="h-1 w-1 rounded-full bg-[var(--slot4-accent)]/40" />
          <span className="text-[var(--slot4-muted-text)]">{location}</span>
        </div>
        <h3 className="mt-4 text-[1.65rem] font-black leading-tight tracking-[-0.03em]">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{summary}</p>
        <Link href={href} className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[var(--slot4-accent)]">
          Open profile <ArrowRight className="h-4 w-4" />
        </Link>
      </article>
    )
  }

  if (variant === 'compact') {
    return (
      <article className="group rounded-[1.6rem] border border-[var(--editable-border)] bg-white p-5 shadow-[0_18px_40px_rgba(16,24,40,0.08)]">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--slot4-lavender)] text-[var(--slot4-accent)]">
            <UserRound className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--slot4-accent)]">{category}</p>
            <h3 className="mt-2 line-clamp-2 text-lg font-black leading-snug tracking-[-0.03em]">{title}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--slot4-muted-text)]">{summary}</p>
          </div>
        </div>
      </article>
    )
  }

  if (variant === 'image') {
    return (
      <article className="group overflow-hidden rounded-[1.6rem] border border-[var(--editable-border)] bg-white shadow-[0_18px_40px_rgba(16,24,40,0.08)]">
        <div className="relative aspect-[16/12] overflow-hidden bg-[var(--slot4-media-bg)]">
          <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
          <Link href={href} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-[#ffd21f] px-6 py-3 text-sm font-black text-[#111827] shadow-[0_16px_30px_rgba(255,210,31,0.24)]">
            View Business Website
          </Link>
        </div>
        <div className="bg-[#060b22] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full border border-[#c7d2fe] bg-[#eef2ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#4f46e5]">{domain}</span>
            <span className="rounded-full bg-[#ff7a1a] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white">{location}</span>
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-xl font-black leading-snug tracking-[-0.03em]">{title}</h3>
          <div className="mt-4 flex items-center justify-between border-t border-[var(--editable-border)] pt-4 text-sm">
            <span className="text-[var(--slot4-muted-text)]">Curated profile</span>
            <Link href={href} className="font-bold text-[#0284c7]">Launch WebSite</Link>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="group overflow-hidden rounded-[1.6rem] border border-[var(--editable-border)] bg-white shadow-[0_18px_40px_rgba(16,24,40,0.08)]">
      <div className="relative aspect-[16/11] overflow-hidden bg-[var(--slot4-media-bg)]">
        <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
        <Link href={href} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-[#ffd21f] px-6 py-3 text-sm font-black text-[#111827] shadow-[0_16px_30px_rgba(255,210,31,0.24)]">
          View Business Website
        </Link>
      </div>
      <div className="bg-[#060b22] px-5 py-4" />
      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full border border-[#c7d2fe] bg-[#eef2ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#4f46e5]">{domain}</span>
          <span className="rounded-full bg-[#ff7a1a] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white">{location}</span>
        </div>
        <h3 className="mt-4 text-[1.65rem] font-black leading-tight tracking-[-0.03em]">{title}</h3>
        <div className="mt-4 flex items-center justify-between border-t border-[var(--editable-border)] pt-4 text-sm">
          <span className="text-[var(--slot4-muted-text)]">Curated public listing</span>
          <Link href={href} className="font-bold text-[#0284c7]">Launch WebSite</Link>
        </div>
      </div>
    </article>
  )
}

export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = featuredPosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const heroPost = pool[0]
  const highlightPosts = pool.slice(1, 4)
  const bottomPosts = pool.slice(4, 10)

  return (
    <section className="pb-14 pt-10 sm:pt-12">
      <div className={container}>
        {heroPost ? <FeaturedHeroCard post={heroPost} href={postHref(primaryTask, heroPost, primaryRoute)} /> : null}
      </div>
      <div className="mt-8">
        <SearchBand count={pool.length} />
      </div>
      {!!highlightPosts.length && (
        <div className={`${container} mt-12 grid gap-8 lg:grid-cols-3`}>
          {highlightPosts.map((post, index) => (
            <WebsiteCard
              key={post.id || post.slug || `${post.title}-${index}`}
              post={post}
              href={postHref(primaryTask, post, primaryRoute)}
              variant={index === 0 ? 'featured' : 'image'}
            />
          ))}
        </div>
      )}
      {!!bottomPosts.length && (
        <div className={`${container} mt-8 grid gap-8 lg:grid-cols-3`}>
          {bottomPosts.map((post, index) => (
            <WebsiteCard
              key={post.id || post.slug || `${post.title}-${index}`}
              post={post}
              href={postHref(primaryTask, post, primaryRoute)}
              variant={index === 0 ? 'horizontal' : index === 1 ? 'editorial' : 'compact'}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export function EditableStoryRail({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = featuredPosts([...posts, ...timeSections.flatMap((section) => section.posts)]).slice(0, 6)
  if (!pool.length) return null

  return (
    <section className="pb-14">
      <div className={container}>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-[var(--editable-border)] bg-white p-8 shadow-[0_18px_40px_rgba(16,24,40,0.08)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--slot4-accent)]">
              {pagesContent.home.hero.badge || 'Browse'}
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.03em]">Fresh company and profile discoveries</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--slot4-muted-text)]">
              Scan newly curated pages, compare standout profiles, and jump into the listings that are getting noticed right now.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {pool.slice(0, 4).map((post) => (
                <Link
                  key={post.id || post.slug}
                  href={postHref(primaryTask, post, primaryRoute)}
                  className="flex items-start gap-3 rounded-[1.25rem] bg-[var(--slot4-page-bg)] p-4 transition hover:-translate-y-0.5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--slot4-accent)]">{getEditableCategory(post)}</p>
                    <h3 className="mt-1 line-clamp-2 text-base font-black leading-snug tracking-[-0.02em]">{post.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--editable-border)] bg-[linear-gradient(135deg,#f4efff_0%,#fff5fb_100%)] p-8 shadow-[0_18px_40px_rgba(16,24,40,0.08)]">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--slot4-accent)]">
              <Star className="h-4 w-4 fill-[var(--slot4-accent)] text-[var(--slot4-accent)]" />
              Popular Focus
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.03em]">Profiles, listings, and visual showcases in one place</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--slot4-muted-text)]">
              Designed for profile makers and business owners who want a sharper public presence and a cleaner discovery journey.
            </p>
            <Link href={primaryRoute} className="mt-6 inline-flex rounded-full bg-[var(--slot4-accent)] px-6 py-3 text-sm font-black text-white">
              Explore everything
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = featuredPosts([...posts, ...timeSections.flatMap((section) => section.posts)]).slice(0, 6)
  if (!pool.length) return null

  return (
    <section className="pb-16">
      <div className={`${container} grid gap-8 lg:grid-cols-3`}>
        {pool.map((post, index) => (
          <WebsiteCard
            key={post.id || post.slug || `${post.title}-${index}`}
            post={post}
            href={postHref(primaryTask, post, primaryRoute)}
            variant={index % 3 === 0 ? 'image' : index % 3 === 1 ? 'horizontal' : 'featured'}
          />
        ))}
      </div>
    </section>
  )
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sectionPosts = timeSections.length
    ? timeSections.flatMap((section) => section.posts)
    : posts
  const pool = featuredPosts(sectionPosts).slice(0, 4)
  if (!pool.length) return null
  const states = getStateGroups(pool)

  return (
    <section className="bg-[#2f2f31] py-16 text-white sm:py-20">
      <div className={`${container} grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center`}>
        <div>
          <h2 className="text-5xl font-black uppercase leading-[0.95] tracking-[-0.05em]">
            Companies by
            <br />
            state
          </h2>
          <p className="mt-6 max-w-sm text-base italic text-white/70">Remarkable experiences to inspire the mind.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {pool.map((post, index) => (
            <Link
              key={post.id || post.slug || `${post.title}-${index}`}
              href={postHref(primaryTask, post, primaryRoute)}
              className="group relative overflow-hidden rounded-[1.5rem] bg-black"
            >
              <img src={getEditablePostImage(post)} alt={post.title} className="h-[420px] w-full object-cover opacity-82 transition duration-500 group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.78)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/80">{states[index] || locationOf(post) || 'Featured'}</p>
                <h3 className="mt-3 text-2xl font-black uppercase leading-tight tracking-[-0.03em]">
                  {index === 0 ? "God's own country" : index === 1 ? 'The land of kings' : index === 2 ? 'One state, many worlds' : 'Vibrant cultural heritage'}
                </h3>
                <span className="mt-6 inline-flex rounded-sm border border-white/70 px-4 py-3 text-sm font-medium uppercase tracking-[0.12em] text-white">
                  Explore websites
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function EditableHomeCta() {
  return (
    <section className="bg-white py-5 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-muted-text)]">
      2026 all rights reserved. All brand names, logos, and trademarks displayed on this website remain the exclusive property of their respective owners.
    </section>
  )
}
