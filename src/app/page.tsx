"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  FileSearch,
  Layers,
  Linkedin,
  Map,
  MessageSquareText,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const heroStats = [
  { label: "Career tools in one workspace", value: "7" },
  { label: "Account required", value: "0" },
  { label: "Output styles", value: "Live + structured" },
];

const toolPills = [
  { name: "Resume Review", desc: "ATS score + bullet rewrite" },
  { name: "Roadmap Generator", desc: "Month-by-month path" },
  { name: "Portfolio Projects", desc: "Proof-of-work ideas" },
  { name: "Learning Plan", desc: "Four weeks of focused study" },
  { name: "Interview Prep", desc: "Questions + answer frameworks" },
  { name: "LinkedIn Optimizer", desc: "Before/after profile rewrite" },
  { name: "JD Analyzer", desc: "Must-haves, keywords, red flags" },
];

const toolCards = [
  {
    title: "Resume Review",
    body: "ATS alignment, strengths, improvements, and one sharper bullet you can paste back into your resume.",
    icon: FileCheck2,
    accent: "text-accent",
  },
  {
    title: "Roadmap Generator",
    body: "A month-by-month plan for a target role, with milestones, skills, and resources tied to your timeline.",
    icon: Map,
    accent: "text-accent-secondary",
  },
  {
    title: "Portfolio Projects",
    body: "Project ideas scoped to your stack and level, with difficulty tags and recruiter-facing rationale.",
    icon: Sparkles,
    accent: "text-accent",
  },
  {
    title: "Learning Plan",
    body: "Weekly goals, concrete resources, and measurable milestones so progress is visible instead of vague.",
    icon: BookOpen,
    accent: "text-accent-secondary",
  },
  {
    title: "Interview Prep",
    body: "Ten likely interview questions, answer frameworks, hidden evaluation signals, and one strong question to ask back.",
    icon: MessageSquareText,
    accent: "text-accent",
  },
  {
    title: "LinkedIn Optimizer",
    body: "A role-targeted headline, About section, and experience rewrite with missing keywords called out clearly.",
    icon: Linkedin,
    accent: "text-accent-secondary",
  },
  {
    title: "JD Analyzer",
    body: "A structured read of must-have skills, nice-to-haves, ATS keywords, likely questions, and real red flags.",
    icon: FileSearch,
    accent: "text-accent",
  },
];

const workflow = [
  {
    title: "Decode the role",
    body: "Start with the JD Analyzer to separate true requirements from nice-to-haves, pull exact keywords, and spot vague or risky signals.",
    icon: FileSearch,
  },
  {
    title: "Sharpen your story",
    body: "Use Resume Review and LinkedIn Optimizer to make the same role-specific narrative show up across your application.",
    icon: ClipboardList,
  },
  {
    title: "Build credible proof",
    body: "Generate portfolio projects and a learning plan that close the gap between where you are and what the role asks for.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Walk in prepared",
    body: "Use Interview Prep to practice the questions that are likely to come from the job description, not a random list.",
    icon: MessageSquareText,
  },
];

const outputExamples = [
  "ATS score with three specific improvements",
  "Before/after resume bullet rewrite",
  "Month-by-month roadmap",
  "Four portfolio project cards",
  "Four-week learning schedule",
  "Ten interview question cards",
  "LinkedIn before/after sections",
  "JD keyword checklist",
  "Must-have vs nice-to-have skill split",
  "Honest red-flag assessment",
];

const differentiators = [
  {
    title: "Role-specific by default",
    body: "Compass asks for the role, the JD, your level, and your current material because career advice gets useful only when it has context.",
    icon: Target,
  },
  {
    title: "Structured where it matters",
    body: "The newer tools return JSON-backed cards, badges, sections, checklists, and before/after panels instead of loose paragraphs.",
    icon: Layers,
  },
  {
    title: "Fast enough to iterate",
    body: "Run a JD, update your resume, rewrite LinkedIn, and generate interview prep in one sitting while the role is still fresh.",
    icon: Zap,
  },
];

const audiences = [
  {
    title: "Students and interns",
    body: "Turn coursework, projects, and early experience into a role-ready story without pretending you have senior credentials.",
  },
  {
    title: "Career switchers",
    body: "Translate older experience into the vocabulary of the role you want next, then plan the proof you still need to build.",
  },
  {
    title: "Early-career professionals",
    body: "Tighten your application package before you apply, then prepare for the questions your resume and the JD will create.",
  },
];

const proofCards = [
  {
    headline: "No mystery meat output",
    body: "Sections are named. Cards are separated. Copy buttons are available where you need them. You can see what each answer is trying to do.",
  },
  {
    headline: "Honest about uncertainty",
    body: "The JD Analyzer does not manufacture red flags. If the description looks solid, it says so cleanly.",
  },
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <section className="dot-grid-bg relative border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted">
              Compass — your career, mapped.
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Compass career toolkit
              <span className="block font-serif text-5xl italic text-foreground sm:text-6xl md:text-7xl">
                for the whole job search.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              A focused AI workspace for resume reviews, job description
              analysis, LinkedIn rewrites, interview prep, portfolio ideas,
              roadmaps, and learning plans. Less vague advice. More artifacts
              you can use today.
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

          <dl className="mt-14 grid animate-in fade-in gap-4 duration-500 delay-150 sm:grid-cols-3">
            {heroStats.map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-border bg-surface/80 p-5 backdrop-blur-sm"
              >
                <dt className="text-xs font-medium uppercase tracking-wider text-muted">
                  {s.label}
                </dt>
                <dd className="mt-2 font-serif text-3xl italic text-foreground">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap gap-2 border-t border-border/60 pt-10 animate-in fade-in duration-500 delay-200">
            <span className="me-2 w-full text-xs font-medium uppercase tracking-wider text-muted sm:w-auto sm:me-4">
              Inside the app
            </span>
            {toolPills.map((tool) => (
              <span
                key={tool.name}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1.5 text-xs text-foreground/90"
                title={tool.desc}
              >
                <span className="font-medium">{tool.name}</span>
                <span className="hidden text-muted sm:inline">
                  · {tool.desc}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface/40 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent-secondary">
              The toolkit
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Seven tools that cover the application loop.
            </h2>
            <p className="mt-4 text-muted">
              Compass is built around the real sequence: understand the role,
              align your profile, build proof, and prepare for the conversation.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {toolCards.map((tool) => (
              <Card
                key={tool.title}
                className="h-full border-border bg-card transition-shadow duration-200 hover:shadow-card-hover"
              >
                <CardContent className="p-6">
                  <tool.icon
                    className={`mb-5 h-8 w-8 ${tool.accent}`}
                    strokeWidth={1.4}
                  />
                  <h3 className="text-lg font-semibold text-foreground">
                    {tool.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {tool.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
              A better flow
            </p>
            <h2 className="mt-3 font-serif text-3xl italic leading-snug text-foreground sm:text-4xl">
              Stop treating each career task like a separate island.
            </h2>
            <p className="mt-6 text-muted">
              A job description should influence your resume. Your resume should
              influence your interview prep. Your skill gaps should influence
              your projects and learning plan. Compass connects those moves in
              one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/app">Try the workflow</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/about">Read the philosophy</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4">
            {workflow.map((step, index) => (
              <div
                key={step.title}
                className="flex gap-4 rounded-lg border border-border bg-card p-5 transition-colors duration-200 hover:border-muted"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-accent">
                  <step.icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-1 font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface/40 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent-secondary">
                Concrete output
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                The app returns things you can act on.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted">
              Some tools stream live guidance. The new interview, LinkedIn, and
              JD tools render structured cards and checklists for easier use.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {outputExamples.map((item) => (
              <div
                key={item}
                className="flex min-h-20 items-start gap-3 rounded-lg border border-border bg-card p-4"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-secondary" />
                <p className="text-sm leading-relaxed text-foreground/90">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                Why Compass
              </p>
              <h2 className="mt-3 font-serif text-3xl italic leading-snug text-foreground sm:text-4xl">
                Templates tell you what to write. Compass helps you decide what
                to change.
              </h2>
              <p className="mt-6 text-muted">
                Most career products optimize for volume: more documents, more
                templates, more generic tips. Compass optimizes for clarity:
                fewer moves, better alignment, and sharper language around the
                role you actually want.
              </p>
            </div>
            <ul className="space-y-4">
              {differentiators.map((item) => (
                <li
                  key={item.title}
                  className="flex gap-4 rounded-lg border border-border bg-card p-5 transition-colors duration-200 hover:border-muted"
                >
                  <item.icon
                    className="mt-0.5 h-5 w-5 shrink-0 text-accent-secondary"
                    strokeWidth={1.5}
                  />
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface/40 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                Who it is for
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                People who want a sharper next move.
              </h2>
            </div>
            <Button asChild variant="outline" className="w-fit shrink-0">
              <Link href="/about">About Compass</Link>
            </Button>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {audiences.map((audience) => (
              <div
                key={audience.title}
                className="rounded-lg border border-border bg-card p-6"
              >
                <CheckCircle2 className="mb-4 h-5 w-5 text-accent-secondary" />
                <h3 className="font-semibold text-foreground">
                  {audience.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {audience.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-6 md:grid-cols-2">
            {proofCards.map((card) => (
              <div
                key={card.headline}
                className="rounded-lg border border-border bg-card p-6 sm:p-8"
              >
                <p className="font-serif text-xl italic leading-snug text-foreground/95">
                  {card.headline}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl border border-border bg-card px-8 py-12 text-center sm:px-12 sm:py-16">
            <h2 className="mx-auto max-w-2xl font-serif text-3xl italic leading-snug text-foreground sm:text-4xl">
              Bring one role. Leave with a clearer application plan.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted">
              Paste a job description, run the tools that match your blocker,
              and turn scattered career work into a sequence you can actually
              execute.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/app">Open Compass</Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/about">Learn more</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
