"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type LearningWeek = {
  week: number;
  goals: string[];
  resources: { title: string; detail?: string }[];
  milestone: string;
};

export function LearningWeeksPanel({ weeks }: { weeks: LearningWeek[] }) {
  return (
    <Accordion type="single" collapsible className="w-full space-y-2">
      {weeks.map((w) => (
        <AccordionItem
          key={w.week}
          value={`week-${w.week}`}
          className="overflow-hidden rounded-xl border border-[#e0e0ea] bg-white shadow-sm"
        >
          <AccordionTrigger className="px-4 py-3 text-left text-[#111118] hover:bg-[#f6f6fb] hover:text-[#7C6AF7] hover:no-underline [&>svg]:text-[#6B6A80]">
            <span className="text-sm font-semibold">Week {w.week}</span>
          </AccordionTrigger>
          <AccordionContent className="border-t border-[#ececf4] bg-[#FAFAFC] px-4 pb-4 pt-2 text-[#2a2a38]">
            <div className="space-y-5 text-sm">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#7C6AF7]">
                  Goals
                </p>
                <ul className="list-disc space-y-1.5 ps-4 text-[#2a2a38]">
                  {w.goals?.map((g, i) => (
                    <li key={i} className="leading-relaxed">
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#2a9d8f]">
                  Resources
                </p>
                <ul className="space-y-2">
                  {w.resources?.map((r, i) => (
                    <li
                      key={i}
                      className="rounded-lg border border-[#e4e4ee] bg-white px-3 py-2 text-[#3d3d4d]"
                    >
                      <span className="font-medium text-[#111118]">{r.title}</span>
                      {r.detail ? (
                        <span className="text-[#6B6A80]"> — {r.detail}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-[#7C6AF7]/20 bg-[#F4F2FF] px-3 py-2">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#6B6A80]">
                  Milestone
                </p>
                <p className="font-medium text-[#111118]">{w.milestone}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
