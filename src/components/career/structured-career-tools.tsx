"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  CircleCheck,
  Copy,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type InterviewQuestionType =
  | "Behavioural"
  | "Technical"
  | "Situational";

export type InterviewPrepData = {
  questions: {
    question: string;
    howToAnswer: string;
    type: InterviewQuestionType;
  }[];
  theyAreTesting: {
    title: string;
    explanation: string;
  }[];
  questionToAsk: {
    question: string;
    whyItWorks: string;
  };
};

export type LinkedInOptimizationData = {
  headline: {
    current: string;
    optimized: string;
  };
  about: {
    current: string;
    optimized: string;
  };
  experience: {
    current: string;
    optimized: string;
  };
  missingKeywords: {
    keyword: string;
    whyItMatters: string;
  }[];
};

export type JdAnalysisData = {
  mustHave: string[];
  niceToHave: string[];
  keywords: string[];
  expectedQuestions: string[];
  redFlags: string[];
};

type StructuredToolOutputCardProps = {
  children: ReactNode;
  textToCopy: string;
  onStartOver: () => void;
  disabledCopy?: boolean;
  animationKey: string | number;
};

function safeList(items?: string[]): string {
  return items?.map((item) => `- ${item}`).join("\n") ?? "";
}

export function interviewPrepToCopy(data: InterviewPrepData): string {
  const questions = data.questions
    ?.map(
      (item, index) =>
        `${index + 1}. ${item.question}\nDifficulty: ${item.type}\nHow to answer: ${item.howToAnswer}`
    )
    .join("\n\n");

  const testing = data.theyAreTesting
    ?.map((item) => `${item.title}: ${item.explanation}`)
    .join("\n\n");

  return `10 Interview Questions\n${questions}\n\n3 Things They're Really Testing\n${testing}\n\nOne Question You Should Ask Them\n${data.questionToAsk?.question}\nWhy it works: ${data.questionToAsk?.whyItWorks}`;
}

export function linkedInOptimizationToCopy(
  data: LinkedInOptimizationData
): string {
  const keywords = data.missingKeywords
    ?.map((item) => `${item.keyword}: ${item.whyItMatters}`)
    .join("\n");

  return `New Headline\nCurrent: ${data.headline?.current}\nOptimized: ${data.headline?.optimized}\n\nNew About Section\nCurrent: ${data.about?.current}\nOptimized: ${data.about?.optimized}\n\nExperience Rewrite\nCurrent: ${data.experience?.current}\nOptimized: ${data.experience?.optimized}\n\n3 Keywords You're Missing\n${keywords}`;
}

export function jdAnalysisToCopy(data: JdAnalysisData): string {
  return `Required vs Nice-to-Have Skills\nMust Have:\n${safeList(
    data.mustHave
  )}\n\nNice to Have:\n${safeList(
    data.niceToHave
  )}\n\nKeywords to Put in Your Resume\n${safeList(
    data.keywords
  )}\n\nQuestions to Expect\n${safeList(
    data.expectedQuestions
  )}\n\nRed Flags\n${
    data.redFlags?.length
      ? safeList(data.redFlags)
      : "Looks like a solid JD."
  }`;
}

async function copyText(text: string) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* clipboard can be unavailable in some browsers */
  }
}

function SectionCopyButton({
  text,
  label = "Copy",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={() => copyText(text)}
      disabled={!text}
      className={cn(
        "h-8 border-border bg-surface px-2.5 text-xs text-foreground hover:bg-card hover:text-foreground",
        className
      )}
    >
      <Copy className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}

export function StructuredToolOutputCard({
  children,
  textToCopy,
  onStartOver,
  disabledCopy,
  animationKey,
}: StructuredToolOutputCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-card text-foreground shadow-[0_24px_48px_-12px_rgba(0,0,0,0.45)]">
      <div className="absolute right-4 top-4 z-10 flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => copyText(textToCopy)}
          disabled={disabledCopy || !textToCopy}
          className="h-9 border-border bg-surface text-foreground shadow-sm hover:bg-card hover:text-foreground"
        >
          <Copy className="h-4 w-4" />
          Copy
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onStartOver}
          className="h-9 text-muted hover:bg-surface hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4" />
          Start over
        </Button>
      </div>

      <div className="min-h-[220px] px-6 pb-6 pt-16">
        <motion.div
          key={animationKey}
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

export function StructuredEmptyState({
  icon: Icon,
  text,
}: {
  icon: LucideIcon;
  text: string;
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/40 px-6 py-10 text-center">
      <div className="mb-4 rounded-full border border-accent/25 bg-accent/10 p-3 text-accent">
        <Icon className="h-7 w-7" />
      </div>
      <p className="max-w-sm text-sm leading-relaxed text-muted">{text}</p>
    </div>
  );
}

export function StructuredLoadingCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-card p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.45)]">
      <div className="mb-8 flex justify-end gap-2">
        <div className="skeleton-shimmer h-9 w-20 rounded-md bg-surface" />
        <div className="skeleton-shimmer h-9 w-28 rounded-md bg-surface" />
      </div>
      {children}
    </div>
  );
}

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn("skeleton-shimmer h-4 rounded-md bg-surface", className)}
    />
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface/70 p-4", className)}>
      <SkeletonLine className="mb-4 h-5 w-2/3" />
      <SkeletonLine className="mb-2 w-full" />
      <SkeletonLine className="mb-2 w-[88%]" />
      <SkeletonLine className="w-1/3" />
    </div>
  );
}

function SkeletonSection({
  children,
  wide,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <section className="space-y-3 border-b border-border pb-6 last:border-b-0 last:pb-0">
      <div className="flex items-center justify-between gap-4">
        <SkeletonLine className="h-5 w-48" />
        <SkeletonLine className="h-8 w-20" />
      </div>
      <div className={wide ? "grid gap-3" : "grid gap-3 sm:grid-cols-2"}>
        {children}
      </div>
    </section>
  );
}

export function InterviewPrepSkeleton() {
  return (
    <StructuredLoadingCard>
      <div className="space-y-7">
        <SkeletonSection>
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </SkeletonSection>
        <SkeletonSection>
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </SkeletonSection>
        <SkeletonSection wide>
          <SkeletonCard />
        </SkeletonSection>
      </div>
    </StructuredLoadingCard>
  );
}

export function LinkedInOptimizerSkeleton() {
  return (
    <StructuredLoadingCard>
      <div className="space-y-7">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonSection key={index}>
            <SkeletonCard />
            <SkeletonCard className="border-accent/35" />
          </SkeletonSection>
        ))}
        <SkeletonSection>
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-surface/70 p-4"
            >
              <SkeletonLine className="mb-3 h-7 w-28 rounded-full" />
              <SkeletonLine className="w-full" />
            </div>
          ))}
        </SkeletonSection>
      </div>
    </StructuredLoadingCard>
  );
}

export function JdAnalyzerSkeleton() {
  return (
    <StructuredLoadingCard>
      <div className="space-y-7">
        <SkeletonSection>
          <SkeletonCard className="border-accent-secondary/30" />
          <SkeletonCard className="border-amber-400/30" />
        </SkeletonSection>
        <SkeletonSection>
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonLine
              key={index}
              className="h-9 rounded-full"
            />
          ))}
        </SkeletonSection>
        <SkeletonSection>
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </SkeletonSection>
        <SkeletonSection wide>
          <SkeletonCard />
        </SkeletonSection>
      </div>
    </StructuredLoadingCard>
  );
}

function SectionPanel({
  title,
  copyText,
  children,
}: {
  title: string;
  copyText: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 border-b border-border pb-7 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <SectionCopyButton text={copyText} />
      </div>
      {children}
    </section>
  );
}

const questionTypeClass: Record<InterviewQuestionType, string> = {
  Behavioural: "border-accent/35 bg-accent/10 text-foreground",
  Technical:
    "border-accent-secondary/35 bg-accent-secondary/10 text-accent-secondary",
  Situational: "border-amber-400/35 bg-amber-400/10 text-amber-200",
};

function QuestionTypeBadge({ type }: { type: InterviewQuestionType }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium",
        questionTypeClass[type] ?? questionTypeClass.Situational
      )}
    >
      {type}
    </span>
  );
}

export function InterviewPrepOutput({ data }: { data: InterviewPrepData }) {
  const questionsCopy = data.questions
    ?.map(
      (item, index) =>
        `${index + 1}. ${item.question}\nDifficulty: ${item.type}\nHow to answer: ${item.howToAnswer}`
    )
    .join("\n\n");
  const testingCopy = data.theyAreTesting
    ?.map((item) => `${item.title}: ${item.explanation}`)
    .join("\n\n");
  const askCopy = `${data.questionToAsk?.question}\nWhy it works: ${data.questionToAsk?.whyItWorks}`;

  return (
    <div className="space-y-8">
      <SectionPanel title="10 Interview Questions" copyText={questionsCopy}>
        <div className="grid gap-4">
          {data.questions?.map((item, index) => (
            <article
              key={`${item.question}-${index}`}
              className="rounded-xl border border-border bg-surface p-4 shadow-card"
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <p className="text-sm font-semibold leading-relaxed text-foreground">
                  <span className="me-2 text-accent">{index + 1}.</span>
                  {item.question}
                </p>
                <QuestionTypeBadge type={item.type} />
              </div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent-secondary">
                How to answer:
              </p>
              <p className="text-sm leading-relaxed text-muted">
                {item.howToAnswer}
              </p>
            </article>
          ))}
        </div>
      </SectionPanel>

      <SectionPanel
        title="3 Things They're Really Testing"
        copyText={testingCopy}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {data.theyAreTesting?.map((item, index) => (
            <article
              key={`${item.title}-${index}`}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <p className="mb-2 text-sm font-semibold text-foreground">
                {item.title}
              </p>
              <p className="text-sm leading-relaxed text-muted">
                {item.explanation}
              </p>
            </article>
          ))}
        </div>
      </SectionPanel>

      <SectionPanel title="One Question You Should Ask Them" copyText={askCopy}>
        <article className="rounded-xl border border-accent/35 bg-accent/10 p-4">
          <p className="text-base font-semibold leading-relaxed text-foreground">
            {data.questionToAsk?.question}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {data.questionToAsk?.whyItWorks}
          </p>
        </article>
      </SectionPanel>
    </div>
  );
}

function BeforeAfterSection({
  title,
  current,
  optimized,
}: {
  title: string;
  current: string;
  optimized: string;
}) {
  return (
    <SectionPanel
      title={title}
      copyText={`Current:\n${current}\n\nOptimized:\n${optimized}`}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-border bg-surface/75 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            Current
          </p>
          <p className="text-sm leading-relaxed text-muted line-through decoration-muted/80">
            {current || "Not provided"}
          </p>
        </article>
        <article className="rounded-xl border border-accent/60 bg-surface p-4 ring-1 ring-accent/15">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              Optimized
            </p>
            <SectionCopyButton
              text={optimized}
              label="Copy"
              className="h-7 px-2"
            />
          </div>
          <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-foreground">
            {optimized}
          </p>
        </article>
      </div>
    </SectionPanel>
  );
}

export function LinkedInOptimizerOutput({
  data,
}: {
  data: LinkedInOptimizationData;
}) {
  const keywordsCopy = data.missingKeywords
    ?.map((item) => `${item.keyword}: ${item.whyItMatters}`)
    .join("\n");

  return (
    <div className="space-y-8">
      <BeforeAfterSection
        title="New Headline"
        current={data.headline?.current}
        optimized={data.headline?.optimized}
      />
      <BeforeAfterSection
        title="New About Section"
        current={data.about?.current}
        optimized={data.about?.optimized}
      />
      <BeforeAfterSection
        title="Experience Rewrite"
        current={data.experience?.current}
        optimized={data.experience?.optimized}
      />
      <SectionPanel title="3 Keywords You're Missing" copyText={keywordsCopy}>
        <div className="grid gap-3 md:grid-cols-3">
          {data.missingKeywords?.map((item, index) => (
            <article
              key={`${item.keyword}-${index}`}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <span className="inline-flex rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-foreground">
                {item.keyword}
              </span>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {item.whyItMatters}
              </p>
            </article>
          ))}
        </div>
      </SectionPanel>
    </div>
  );
}

function SkillsColumn({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: "green" | "amber";
}) {
  const isGreen = variant === "green";

  return (
    <article
      className={cn(
        "rounded-xl border bg-surface p-4",
        isGreen ? "border-accent-secondary/45" : "border-amber-400/45"
      )}
    >
      <p
        className={cn(
          "mb-3 text-sm font-semibold",
          isGreen ? "text-accent-secondary" : "text-amber-200"
        )}
      >
        {title}
      </p>
      <ul className="space-y-2">
        {items?.map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-2 text-sm text-muted">
            <Check
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0",
                isGreen ? "text-accent-secondary" : "text-amber-300"
              )}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function KeywordChecklist({ keywords }: { keywords: string[] }) {
  const [checked, setChecked] = useState<Set<string>>(() => new Set());

  function toggle(keyword: string) {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(keyword)) {
        next.delete(keyword);
      } else {
        next.add(keyword);
      }
      return next;
    });
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {keywords?.map((keyword, index) => {
        const isChecked = checked.has(keyword);
        return (
          <button
            key={`${keyword}-${index}`}
            type="button"
            onClick={() => toggle(keyword)}
            className={cn(
              "flex min-h-10 items-center gap-2 rounded-full border px-3 py-2 text-left text-xs font-medium transition-colors duration-200",
              isChecked
                ? "border-accent-secondary/45 bg-accent-secondary/10 text-foreground"
                : "border-border bg-surface text-muted hover:border-accent/35 hover:text-foreground"
            )}
          >
            <span
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                isChecked
                  ? "border-accent-secondary bg-accent-secondary text-background"
                  : "border-muted"
              )}
            >
              {isChecked ? <Check className="h-3 w-3" /> : null}
            </span>
            <span>{keyword}</span>
          </button>
        );
      })}
    </div>
  );
}

export function JdAnalyzerOutput({ data }: { data: JdAnalysisData }) {
  const skillsCopy = `Must Have:\n${safeList(
    data.mustHave
  )}\n\nNice to Have:\n${safeList(data.niceToHave)}`;
  const redFlagCopy = data.redFlags?.length
    ? safeList(data.redFlags)
    : "Looks like a solid JD.";

  return (
    <div className="space-y-8">
      <SectionPanel
        title="Required vs Nice-to-Have Skills"
        copyText={skillsCopy}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <SkillsColumn title="Must Have" items={data.mustHave} variant="green" />
          <SkillsColumn
            title="Nice to Have"
            items={data.niceToHave}
            variant="amber"
          />
        </div>
      </SectionPanel>

      <SectionPanel
        title="Keywords to Put in Your Resume"
        copyText={safeList(data.keywords)}
      >
        <KeywordChecklist keywords={data.keywords} />
      </SectionPanel>

      <SectionPanel
        title="Questions to Expect"
        copyText={safeList(data.expectedQuestions)}
      >
        <div className="grid gap-3">
          {data.expectedQuestions?.map((question, index) => (
            <article
              key={`${question}-${index}`}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <p className="text-sm font-medium leading-relaxed text-foreground">
                <span className="me-2 text-accent">{index + 1}.</span>
                {question}
              </p>
            </article>
          ))}
        </div>
      </SectionPanel>

      <SectionPanel title="Red Flags" copyText={redFlagCopy}>
        {data.redFlags?.length ? (
          <div className="grid gap-3">
            {data.redFlags.map((flag, index) => (
              <article
                key={`${flag}-${index}`}
                className="flex gap-3 rounded-xl border border-amber-400/40 bg-amber-400/10 p-4"
              >
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                <p className="text-sm leading-relaxed text-foreground">{flag}</p>
              </article>
            ))}
          </div>
        ) : (
          <article className="flex gap-3 rounded-xl border border-accent-secondary/35 bg-accent-secondary/10 p-4">
            <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-secondary" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Looks like a solid JD
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                No concerning signals stood out from the description provided.
              </p>
            </div>
          </article>
        )}
      </SectionPanel>
    </div>
  );
}
