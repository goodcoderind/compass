"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { cn } from "@/lib/utils";

const lightComponents: Components = {
  h1: ({ className, ...p }) => (
    <h1
      className={cn(
        "mb-3 mt-6 text-xl font-semibold tracking-tight text-[#111118] first:mt-0",
        className
      )}
      {...p}
    />
  ),
  h2: ({ className, ...p }) => (
    <h2
      className={cn(
        "mb-2 mt-6 text-lg font-semibold tracking-tight text-[#111118] first:mt-0",
        className
      )}
      {...p}
    />
  ),
  h3: ({ className, ...p }) => (
    <h3
      className={cn("mb-2 mt-4 text-base font-semibold text-[#1a1a24]", className)}
      {...p}
    />
  ),
  p: ({ className, ...p }) => (
    <p
      className={cn("mb-3 text-sm leading-relaxed text-[#3d3d4d] last:mb-0", className)}
      {...p}
    />
  ),
  ul: ({ className, ...p }) => (
    <ul
      className={cn("mb-3 list-disc space-y-1.5 pl-5 text-sm text-[#3d3d4d]", className)}
      {...p}
    />
  ),
  ol: ({ className, ...p }) => (
    <ol
      className={cn("mb-3 list-decimal space-y-1.5 pl-5 text-sm text-[#3d3d4d]", className)}
      {...p}
    />
  ),
  li: ({ className, ...p }) => (
    <li className={cn("leading-relaxed", className)} {...p} />
  ),
  strong: ({ className, ...p }) => (
    <strong className={cn("font-semibold text-[#111118]", className)} {...p} />
  ),
  em: ({ className, ...p }) => (
    <em className={cn("italic text-[#2a2a38]", className)} {...p} />
  ),
  a: ({ className, ...p }) => (
    <a
      className={cn("font-medium text-[#7C6AF7] underline-offset-2 hover:underline", className)}
      {...p}
    />
  ),
  code: ({ className, ...p }) => (
    <code
      className={cn(
        "rounded bg-[#E8E8F0] px-1.5 py-0.5 font-mono text-[0.85em] text-[#111118]",
        className
      )}
      {...p}
    />
  ),
  pre: ({ className, ...p }) => (
    <pre
      className={cn(
        "mb-3 overflow-x-auto rounded-lg bg-[#E8E8F0] p-3 text-sm text-[#111118]",
        className
      )}
      {...p}
    />
  ),
  blockquote: ({ className, ...p }) => (
    <blockquote
      className={cn(
        "mb-3 border-l-4 border-[#7C6AF7]/40 pl-4 text-sm italic text-[#4a4a5c]",
        className
      )}
      {...p}
    />
  ),
  hr: () => <hr className="my-6 border-[#d8d8e4]" />,
};

export function StreamingMarkdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  if (!content.trim()) return null;
  return (
    <div className={cn("tool-output-markdown", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={lightComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
