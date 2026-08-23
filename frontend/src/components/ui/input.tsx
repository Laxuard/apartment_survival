import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full rounded-lg border border-[var(--border-strong)] bg-[var(--canvas)] px-3 py-2 text-[13.5px] text-[var(--text)] placeholder:text-[var(--muted)] outline-none transition-all duration-150 focus:border-[var(--oak)] focus:ring-1 focus:ring-[var(--oak)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
