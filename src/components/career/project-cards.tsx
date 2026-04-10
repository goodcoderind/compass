"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ProjectItem = {
  name: string;
  description: string;
  impresses: string;
  skills: string[];
  difficulty: string;
};

const difficultyLight: Record<string, string> = {
  Beginner:
    "border-emerald-500/35 bg-emerald-50 text-emerald-800",
  Intermediate: "border-[#7C6AF7]/35 bg-[#F4F2FF] text-[#5a4ad1]",
  Advanced: "border-[#c8c8d4] bg-[#f0f0f6] text-[#2a2a38]",
};

const difficultyDark: Record<string, string> = {
  Beginner: "border-accent-secondary/40 bg-accent-secondary/10 text-accent-secondary",
  Intermediate: "border-accent/40 bg-accent/10 text-foreground",
  Advanced: "border-muted bg-surface text-foreground",
};

export function ProjectCards({
  projects,
  light,
}: {
  projects: ProjectItem[];
  light?: boolean;
}) {
  const map = light ? difficultyLight : difficultyDark;

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", light && "pt-1")}>
      {light ? (
        <div className="col-span-full mb-2 border-b border-[#e4e4ee] pb-4">
          <h3 className="text-lg font-semibold text-[#111118]">
            Suggested projects
          </h3>
          <p className="mt-1 text-sm text-[#6B6A80]">
            Four ideas with difficulty, skills, and recruiter rationale.
          </p>
        </div>
      ) : null}
      {projects.map((p, i) => (
        <motion.div
          key={`${p.name}-${i}`}
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: i * 0.05, ease: "easeOut" }}
        >
          <Card
            className={cn(
              "h-full border shadow-sm transition-shadow duration-200",
              light
                ? "border-[#e4e4ee] bg-white hover:shadow-md"
                : "hover:shadow-card-hover"
            )}
          >
            <CardHeader className="space-y-2 pb-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <CardTitle
                  className={cn(
                    "text-base font-semibold leading-snug",
                    light ? "text-[#111118]" : undefined
                  )}
                >
                  {p.name}
                </CardTitle>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                    map[p.difficulty] ?? map.Intermediate
                  )}
                >
                  {p.difficulty}
                </span>
              </div>
              <p
                className={cn(
                  "text-sm",
                  light ? "text-[#5c5c6e]" : "text-muted"
                )}
              >
                {p.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p
                  className={cn(
                    "mb-1 text-xs font-semibold uppercase tracking-wider",
                    light ? "text-[#7C6AF7]" : "text-accent"
                  )}
                >
                  Why it impresses
                </p>
                <p className={light ? "text-[#3d3d4d]" : "text-muted"}>
                  {p.impresses}
                </p>
              </div>
              <div>
                <p
                  className={cn(
                    "mb-1.5 text-xs font-semibold uppercase tracking-wider",
                    light ? "text-[#2a9d8f]" : "text-accent-secondary"
                  )}
                >
                  Skills demonstrated
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {p.skills?.map((s, j) => (
                    <span
                      key={j}
                      className={cn(
                        "rounded-md border px-2 py-0.5 text-xs",
                        light
                          ? "border-[#e4e4ee] bg-[#f6f6fb] text-[#1a1a24]"
                          : "border-border bg-surface text-foreground/90"
                      )}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
