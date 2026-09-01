/* eslint-disable react-refresh/only-export-components */
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap transition-all duration-150 outline-none select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oak)]/40 focus-visible:border-[var(--oak)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--oak)] text-white hover:bg-[var(--oak-hover)] shadow-2xs font-semibold",
        secondary:
          "bg-[var(--sage-tint)] text-[var(--sage)] hover:bg-[var(--sage)] hover:text-white border border-[var(--sage)]/25",
        subtle:
          "bg-[var(--oak-tint)] text-[var(--oak)] hover:bg-[var(--oak)] hover:text-white border border-[var(--oak)]/25 font-semibold",
        outline:
          "border border-[var(--border-strong)] bg-transparent text-[var(--text)] hover:bg-[var(--canvas)] hover:border-[var(--border-strong)]",
        ghost:
          "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--canvas)]",
        destructive:
          "bg-[var(--negative-bg)] text-[var(--negative-text)] hover:bg-[var(--negative-text)] hover:text-white border border-[var(--negative-text)]/20 font-semibold",
        link: "text-[var(--oak)] underline-offset-4 hover:underline hover:text-[var(--oak-hover)] p-0 h-auto",
      },
      size: {
        default: "h-10 px-4 rounded-xl text-xs sm:text-sm gap-2",
        xs: "h-6 px-2 rounded-lg text-xs gap-1 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 px-3 rounded-lg text-xs gap-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 px-5 rounded-xl text-xs sm:text-sm gap-2",
        xl: "h-12 px-6 rounded-xl text-sm sm:text-base gap-2.5 font-bold",
        icon: "size-10 rounded-xl",
        "icon-sm": "size-8 rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
