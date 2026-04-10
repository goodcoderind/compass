"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type RoadmapMonth = {
  month: string;
  milestones: string[];
  skills: string[];
  resources: string[];
};

export function RoadmapTimeline({
  months,
  light,
}: {
  months: RoadmapMonth[];
  light?: boolean;
}) {
  if (!months?.length) return null;

  const line = light ? "border-[#d0d0dc]" : "border-border";
  const dotRing = light ? "ring-[#F4F4FA]" : "ring-background";
  const dotBorder = "border-[#7C6AF7]";
  const dotBg = light ? "bg-[#F4F4FA]" : "bg-background";
  const title = light ? "text-[#111118]" : "text-foreground";
  const bodyMuted = light ? "text-[#5c5c6e]" : "text-muted";
  const liText = light ? "text-[#1a1a24]" : "text-foreground/90";
  const label = light ? "text-[#2a9d8f]" : "text-accent-secondary";

  return (
    <div className={cn(light && "space-y-2")}>
      {light ? (
        <div className="mb-6 border-b border-[#e4e4ee] pb-4">
          <h3 className="text-lg font-semibold text-[#111118]">Your roadmap</h3>
          <p className="mt-1 text-sm text-[#6B6A80]">
            Milestones, skills, and resources by month.
          </p>
        </div>
      ) : null}
      <ol className={cn("relative ms-2 border-s ps-8", line)}>
        {months.map((m, i) => (
          <motion.li
            key={`${m.month}-${i}`}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04, ease: "easeOut" }}
            className="mb-10 last:mb-2"
          >
            <span
              className={cn(
                "absolute -start-[5px] mt-1.5 flex h-2.5 w-2.5 rounded-full border-2 ring-4",
                dotBorder,
                dotBg,
                dotRing
              )}
            />
            <h4 className={cn("mb-3 font-semibold", title)}>{m.month}</h4>
            <div className={cn("space-y-4 text-sm", bodyMuted)}>
              <div>
                <p className={cn("mb-1.5 text-xs font-semibold uppercase tracking-wider", label)}>
                  Milestones
                </p>
                <ul className="list-disc space-y-1 ps-4">
                  {m.milestones?.map((x, j) => (
                    <li key={j} className={liText}>
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className={cn("mb-1.5 text-xs font-semibold uppercase tracking-wider", label)}>
                  Skills
                </p>
                <ul className="list-disc space-y-1 ps-4">
                  {m.skills?.map((x, j) => (
                    <li key={j}>{x}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className={cn("mb-1.5 text-xs font-semibold uppercase tracking-wider", label)}>
                  Resources
                </p>
                <ul className="list-disc space-y-1 ps-4">
                  {m.resources?.map((x, j) => (
                    <li key={j}>{x}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
