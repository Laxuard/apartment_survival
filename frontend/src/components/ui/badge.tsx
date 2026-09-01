/* eslint-disable react-refresh/only-export-components */
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap transition-all select-none [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--oak-tint)] text-[var(--oak)] border-[var(--oak)]/30 shadow-2xs",
        secondary:
          "bg-[var(--sage-tint)] text-[var(--sage)] border-[var(--sage)]/30 shadow-2xs",
        positive:
          "bg-[var(--positive-bg)] text-[var(--positive-text)] border-[var(--positive-text)]/25 shadow-2xs",
        destructive:
          "bg-[var(--negative-bg)] text-[var(--negative-text)] border-[var(--negative-text)]/25 shadow-2xs",
        warn:
          "bg-[var(--warn-bg)] text-[var(--warn-text)] border-[var(--warn-text)]/25 shadow-2xs",
        outline:
          "border-[var(--border-strong)] text-[var(--text)] bg-[var(--card)]",
        neutral:
          "bg-[var(--canvas)] text-[var(--muted)] border-[var(--border)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
