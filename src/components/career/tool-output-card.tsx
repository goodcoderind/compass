"use client";

import { motion } from "framer-motion";
import { Copy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ToolOutputCardProps = {
  children: React.ReactNode;
  textToCopy: string;
  onStartOver: () => void;
  disabledCopy?: boolean;
  animationKey: string | number;
  className?: string;
};

export function ToolOutputCard({
  children,
  textToCopy,
  onStartOver,
  disabledCopy,
  animationKey,
  className,
}: ToolOutputCardProps) {
  async function handleCopy() {
    if (!textToCopy || disabledCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#F4F4FA] text-[#111118] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.45)]",
        className
      )}
    >
      <div className="absolute right-4 top-4 z-10 flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleCopy}
          disabled={disabledCopy || !textToCopy}
          className="h-9 border-[#d0d0dc] bg-white text-[#111118] shadow-sm transition-colors duration-200 hover:bg-[#f0f0f6] hover:text-[#111118]"
        >
          <Copy className="h-4 w-4" />
          Copy
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onStartOver}
          className="h-9 text-[#5c5c6e] hover:bg-[#e8e8f0] hover:text-[#111118]"
        >
          <RotateCcw className="h-4 w-4" />
          Start over
        </Button>
      </div>

      <div className="min-h-[140px] px-6 pb-6 pt-16">
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

export function ToolOutputSkeleton() {
  return (
    <div className="space-y-4 rounded-2xl border border-white/[0.08] bg-[#ECECF4] p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)]">
      <div className="skeleton-shimmer-light ms-auto h-9 w-28 rounded-md bg-[#d8d8e6]" />
      <div className="skeleton-shimmer-light mt-8 h-16 w-40 rounded-lg bg-[#d8d8e6]" />
      <div className="skeleton-shimmer-light h-4 w-full rounded bg-[#d8d8e6]" />
      <div className="skeleton-shimmer-light h-4 w-[92%] rounded bg-[#d8d8e6]" />
      <div className="skeleton-shimmer-light h-24 w-full rounded-lg bg-[#d8d8e6]" />
    </div>
  );
}
