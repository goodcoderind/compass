"use client";

import Link from "next/link";
import {
  ArrowRight,
  Compass,
  HeartHandshake,
  Lightbulb,
  Shield,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const values = [
  {
    title: "Specificity over slogans",
    body: "We push the model toward concrete rewrites, dated milestones, and named skills — because vague encouragement does not change outcomes.",
    icon: Lightbulb,
  },
  {
    title: "Respect for your time",
    body: "No forced onboarding, no PDF homework. You bring context; we return something you can paste, schedule, or ship the same day.",
    icon: Compass,
  },
  {
    title: "Honest limits",
    body: "Compass is coaching software, not a recruiter and not a guarantee. It amplifies judgment you already have; it does not replace it.",
    icon: Shield,
  },
];

const notList = [
  "A replacement for mentors, managers, or real interview practice.",
  "A certificate mill or a list of buzzwords to paste everywhere.",
  "A black box that hides why it suggested a change — we show the reasoning in the output.",
];

const productSurface = [
  {
    name: "Resume Review",
    detail:
      "Structured ATS-style score, strengths, improvements with rewrites, and a before/after bullet you can drop straight into your doc.",
  },
  {
    name: "Roadmap Generator",
    detail:
      "A month-by-month path from your current skills to a target role — milestones, skills to add, and resources worth your attention.",
  },
  {
    name: "Portfolio Projects",
    detail:
      "Four scoped project ideas with difficulty, skills demonstrated, and why a hiring manager would care.",
  },
  {
    name: "Learning Plan",
    detail:
      "A four-week plan with weekly goals, concrete resources, and a milestone you can verify.",
  },
];

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      <section className="border-b border-border bg-surface/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
              About
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Career tools should feel like{" "}
              <span className="font-serif italic">a map</span>
              , not a maze.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              Compass exists because most “career help” optimizes for content
              volume: more templates, more tabs, more generic tips. We optimize
              for clarity — fewer moves, higher leverage, and language that
              matches how hiring actually works.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/app" className="gap-2">
                  Try the product
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/">Back to home</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:items-start">
          <blockquote className="font-serif text-3xl italic leading-snug text-foreground sm:text-4xl lg:sticky lg:top-28">
            Most career tools give you templates. Compass gives you a map.
          </blockquote>
          <div className="space-y-6 text-base leading-relaxed text-muted">
            <p className="text-foreground/90">
              Built for people who are serious about where they are going — who
              want language that matches their industry, feedback that respects
              their constraints, and next steps they can schedule on a calendar.
            </p>
            <p>
              No fluff. No filler. Real coaching, on demand: resume critique
              that names missing signals, roadmaps that respect your timeline,
              projects that read as deliberate practice instead of tutorial
              churn.
            </p>
            <p>
              Your career is not a checklist. Stop treating it like one. Compass
              is built to connect where you are, where you want to be, and the
              smallest set of high-leverage moves in between.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface/40 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent-secondary">
              What we optimize for
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Principles that shape every tab.
            </h2>
          </div>
          <ul className="grid gap-6 md:grid-cols-3">
            {values.map((v) => (
              <li
                key={v.title}
                className="rounded-xl border border-border bg-card p-6"
              >
                <v.icon
                  className="mb-4 h-8 w-8 text-accent"
                  strokeWidth={1.35}
                />
                <h3 className="font-semibold text-foreground">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {v.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-border py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                The product
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Four surfaces, one coach.
              </h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {productSurface.map((p) => (
              <div
                key={p.name}
                className="rounded-xl border border-border bg-card p-6 transition-colors duration-200 hover:border-muted"
              >
                <h3 className="text-sm font-semibold text-accent">{p.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {p.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface/40 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-accent-secondary" />
                <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                  Who we build for
                </h2>
              </div>
              <p className="mt-4 text-muted">
                Students and early-career professionals navigating their first
                real job search. People pivoting into a new function or industry
                who need vocabulary that lands with hiring managers. Individual
                contributors leveling up before they interview for the next
                band.
              </p>
              <p className="mt-4 text-sm text-muted">
                If you are looking for a magic button or a promise of an offer,
                we are not the right tool. If you want a sharper map and are
                willing to execute, you are in the right place.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <HeartHandshake className="h-6 w-6 text-muted" />
                <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                  What Compass is not
                </h2>
              </div>
              <ul className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
                {notList.map((line) => (
                  <li key={line} className="flex gap-3">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card px-6 py-12 sm:px-10">
            <p className="font-serif text-2xl italic leading-snug text-foreground sm:text-3xl">
              Stop collecting templates. Start making moves.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/app">Open Compass</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
