"use client";

import { Check, ArrowRight } from "lucide-react";
import type { ParsedResume } from "@/lib/parse-resume-output";

export function ResumeStructuredOutput({ data }: { data: ParsedResume }) {
  return (
    <div className="space-y-8">
      <div className="border-b border-[#e4e4ee] pb-4">
        <h3 className="text-lg font-semibold text-[#111118]">Resume analysis</h3>
        <p className="mt-1 text-sm text-[#6B6A80]">
          ATS alignment, strengths, improvements, and a bullet rewrite.
        </p>
      </div>
      {data.atsScore !== null ? (
        <div className="flex flex-wrap items-baseline gap-1 border-b border-[#e4e4ee] pb-6">
          <span className="text-5xl font-bold tracking-tight text-[#7C6AF7] sm:text-6xl">
            {data.atsScore}
          </span>
          <span className="text-lg font-medium text-[#6B6A80] sm:text-xl">
            /100
          </span>
          <span className="ms-2 text-sm font-medium uppercase tracking-wider text-[#6B6A80]">
            ATS alignment
          </span>
        </div>
      ) : null}

      {data.strengths.length > 0 ? (
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#6B6A80]">
            Strengths
          </h3>
          <ul className="space-y-2">
            {data.strengths.map((s, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-r-lg border-l-4 border-emerald-500 bg-white py-3 pl-4 pr-3 shadow-sm"
              >
                <Check
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                  strokeWidth={2}
                />
                <span className="text-sm leading-relaxed text-[#1a1a24]">{s}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {data.improvements.length > 0 ? (
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#6B6A80]">
            Improvements
          </h3>
          <ul className="space-y-2">
            {data.improvements.map((s, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-r-lg border-l-4 border-amber-500 bg-white py-3 pl-4 pr-3 shadow-sm"
              >
                <ArrowRight
                  className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
                  strokeWidth={2}
                />
                <span className="text-sm leading-relaxed text-[#1a1a24]">{s}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {data.beforeBullet || data.afterBullet ? (
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#6B6A80]">
            Example bullet rewrite
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[#e4e4ee] bg-white/90 p-4 shadow-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6B6A80]">
                Before
              </p>
              <p className="text-sm leading-relaxed text-[#6B6A80] line-through decoration-[#9a9aaa]">
                {data.beforeBullet || "—"}
              </p>
            </div>
            <div className="rounded-xl border border-[#7C6AF7]/25 bg-[#F4F2FF] p-4 shadow-sm ring-1 ring-[#7C6AF7]/10">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#7C6AF7]">
                After
              </p>
              <p className="text-sm font-medium leading-relaxed text-[#111118]">
                {data.afterBullet || "—"}
              </p>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
