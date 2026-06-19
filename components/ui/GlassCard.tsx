import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.ComponentProps<"div"> {
  hoverable?: boolean;
}

export function GlassCard({ className, hoverable = false, ...props }: GlassCardProps) {
  return (
    <div
      data-slot="glass-card"
      className={cn(
        "glass-card rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-foreground shadow-none",
        hoverable && "glass-card-hover transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.15)]",
        className
      )}
      {...props}
    />
  );
}
