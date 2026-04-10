"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileCheck2,
  Layers,
  Map,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const heroStats = [
  { label: "Coaching tools in one workspace", value: "4" },
  { label: "Early-career professionals", value: "2,400+" },
  { label: "Typical time to first output", value: "~2 min" },
];

const toolPills = [
  { name: "Resume Review", desc: "ATS-aware critique + rewrites" },
  { name: "Roadmap Generator", desc: "Month-by-month plans" },
  { name: "Portfolio Projects", desc: "Ideas that signal intent" },
  { name: "Learning Plan", desc: "4-week structured study" },
];

const featureCards = [
  {
    title: "Resume that passes ATS",
    body: "Line-level feedback on keywords, structure, and impact so hiring systems and humans both see the same story — with a before/after bullet you can steal.",
    icon: FileCheck2,
  },
  {
    title: "Roadmap built for your role",
    body: "Milestones tied to skills employers actually ask for in your lane. Timelines you choose; specificity we bring.",
    icon: Map,
  },
  {
    title: "Projects that actually impress",
    body: "Portfolio ideas with recruiter rationale, difficulty tags, and skills called out — scoped to your stack and seniority.",
    icon: Sparkles,
  },
  {
    title: "Learning plan you can execute",
    body: "Weekly goals, real resources, and measurable milestones so progress is obvious, not vibes-based.",
    icon: BookOpen,
  },
];

const differentiators = [
  {
    title: "Field-aware, not generic",
    body: "Prompts and outputs are tuned for real roles and constraints — not “10 tips to stand out.”",
    icon: Target,
  },
  {
    title: "Structured outputs",
    body: "Timelines, cards, and sections you can copy into Notion or your calendar — not a wall of motivational text.",
    icon: Layers,
  },
  {
    title: "Fast iteration",
    body: "Paste a resume, pick a tab, get direction in one session. No account maze, no PDF homework.",
    icon: Zap,
  },
];

const steps = [
  {
    step: "01",
    title: "Choose your lane",
    body: "Open the product, pick Resume, Roadmap, Projects, or Learning — whatever is blocking you today.",
  },
  {
    step: "02",
    title: "Give context",
    body: "Target role, stack, timeline, and honest skill level. The more specific you are, the sharper the map.",
  },
  {
    step: "03",
    title: "Act on the output",
    body: "Copy sections, rewrite bullets, schedule milestones. Compass ends where your calendar begins.",
  },
];

const audiences = [
  {
    title: "Early-career & interns",
    body: "Turn scattered coursework into a coherent story and a credible project list.",
  },
  {
    title: "Career pivoters",
    body: "Bridge old experience to a new title with language hiring managers recognize.",
  },
  {
    title: "Leveling up ICs",
    body: "Tighten your resume and learning plan before you interview for the next band.",
  },
];

const focusCards = [
  {
    headline: "Feedback that matches the role",
    body: "Not just “add metrics” — structure and wording that fit how your lane actually reads CVs and portfolios.",
  },
  {
    headline: "Plans you can put on a calendar",
    body: "Roadmaps and learning weeks are built to become dates and tasks — not inspiration you forget after closing the tab.",
  },
];

const avatars = [1, 2, 3, 4, 5];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="dot-grid-bg relative border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,340px)] lg:items-end lg:gap-16">
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted">
                Compass — Your career, mapped.
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Your career,
                <br />
                <span className="font-serif text-5xl italic text-foreground sm:text-6xl md:text-7xl">
                  mapped.
                </span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
                An AI coach that respects your field: resume critique, roadmaps,
                portfolio ideas, and learning plans — structured, copyable, and
                blunt when it needs to be.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/app">Start for free</Link>
                </Button>
                <Button asChild variant="ghost" size="lg">
                  <Link href="/app" className="gap-2">
                    Open the product
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <dl className="grid animate-in fade-in slide-in-from-bottom-2 gap-6 rounded-xl border border-border bg-surface/80 p-6 backdrop-blur-sm duration-500 sm:grid-cols-3 lg:grid-cols-1 lg:p-8">
              {heroStats.map((s) => (
                <div key={s.label} className="border-b border-border pb-6 last:border-0 last:pb-0 lg:border-b lg:pb-6">
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted">
                    {s.label}
                  </dt>
                  <dd className="mt-2 font-serif text-3xl italic text-foreground">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-14 flex flex-wrap gap-2 border-t border-border/60 pt-10 animate-in fade-in duration-500 delay-150">
            <span className="me-2 w-full text-xs font-medium uppercase tracking-wider text-muted sm:w-auto sm:me-4">
              Inside the app
            </span>
            {toolPills.map((t) => (
              <span
                key={t.name}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1.5 text-xs text-foreground/90"
                title={t.desc}
              >
                <span className="font-medium">{t.name}</span>
                <span className="hidden text-muted sm:inline">· {t.desc}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="border-b border-border bg-surface/40 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent-secondary">
              What you get
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Four tools. One point of view: your next move should be obvious.
            </h2>
            <p className="mt-4 text-muted">
              Each tab is built to produce something you can ship — a revised
              bullet, a month label on your calendar, a project spec, or a week
              of study you can defend in an interview.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {featureCards.map((f) => (
              <div key={f.title}>
                <Card className="h-full border-border bg-card transition-shadow duration-200 hover:shadow-card-hover">
                  <CardContent className="p-6 sm:p-7">
                    <f.icon
                      className="mb-5 h-9 w-9 text-accent"
                      strokeWidth={1.35}
                    />
                    <h3 className="text-lg font-semibold text-foreground">
                      {f.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      {f.body}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="border-b border-border py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                Why Compass
              </p>
              <h2 className="mt-3 font-serif text-3xl italic leading-snug text-foreground sm:text-4xl">
                Templates tell you what to write. We tell you what to fix.
              </h2>
              <p className="mt-6 text-muted">
                Most career products optimize for volume: more documents, more
                tabs, more “inspiration.” Compass optimizes for clarity — fewer
                moves, higher leverage, language that matches how hiring
                actually works in your discipline.
              </p>
            </div>
            <ul className="space-y-4">
              {differentiators.map((d) => (
                <li
                  key={d.title}
                  className="flex gap-4 rounded-lg border border-border bg-card p-5 transition-colors duration-200 hover:border-muted"
                >
                  <d.icon
                    className="mt-0.5 h-5 w-5 shrink-0 text-accent-secondary"
                    strokeWidth={1.5}
                  />
                  <div>
                    <p className="font-medium text-foreground">{d.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {d.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-border bg-surface/40 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted">
            How it works
          </p>
          <h2 className="mx-auto mt-3 max-w-xl text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Three steps. No workbook.
          </h2>
          <div className="mx-auto mt-14 grid max-w-4xl gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.step}
                className="relative text-center md:text-left"
              >
                <span className="font-serif text-4xl italic text-accent/90">
                  {s.step}
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audiences */}
      <section className="border-b border-border py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                Who it&apos;s for
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Serious about the next chapter.
              </h2>
            </div>
            <Button asChild variant="outline" className="w-fit shrink-0">
              <Link href="/about">Read our philosophy</Link>
            </Button>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {audiences.map((a) => (
              <div
                key={a.title}
                className="rounded-xl border border-border bg-card p-6"
              >
                <CheckCircle2 className="mb-4 h-5 w-5 text-accent-secondary" />
                <h3 className="font-semibold text-foreground">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {a.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof + focus */}
      <section className="border-b border-border bg-surface/40 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-16">
            <div className="flex flex-col items-center gap-4 lg:items-start">
              <div className="flex -space-x-2">
                {avatars.map((n) => (
                  <div
                    key={n}
                    className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-surface bg-card text-xs font-medium text-muted ring-1 ring-border"
                    aria-hidden
                  >
                    {String.fromCharCode(64 + n)}
                  </div>
                ))}
              </div>
              <p className="max-w-xs text-center text-sm text-muted lg:text-left">
                Trusted by{" "}
                <span className="font-medium text-foreground">
                  2,400+ early-career professionals
                </span>{" "}
                who wanted a plan, not another template library.
              </p>
            </div>
            <div className="grid flex-1 gap-6 sm:grid-cols-2">
              {focusCards.map((c) => (
                <div
                  key={c.headline}
                  className="rounded-xl border border-border bg-card p-6"
                >
                  <p className="font-serif text-lg italic leading-snug text-foreground/95">
                    {c.headline}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    {c.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl border border-border bg-card px-8 py-12 text-center sm:px-12 sm:py-16">
            <h2 className="mx-auto max-w-lg font-serif text-3xl italic leading-snug text-foreground sm:text-4xl">
              Ready to see your career on one page?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-muted">
              Open the product, pick a tool, and paste your context. Your first
              useful output is minutes away.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/app">Get started</Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/about">About Compass</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
