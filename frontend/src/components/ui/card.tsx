/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-2xl border transition-all duration-150 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-[var(--card)] border-[var(--border)] shadow-2xs",
        hoverable:
          "bg-[var(--card)] border-[var(--border)] shadow-2xs hover:border-[var(--oak)] hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
        flat: "bg-[var(--card)] border-[var(--border)]",
        canvas: "bg-[var(--canvas)] border-[var(--border-strong)]",
        tinted: "bg-[var(--oak-tint)]/40 border-[var(--border-strong)]",
        modal: "bg-[var(--card)] border-[var(--border-strong)] rounded-3xl shadow-xl",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

function Card({ className, variant, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
}

function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex items-center justify-between p-5 pb-3", className)}
      {...props}
    />
  )
}

function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        "font-semibold text-sm sm:text-base text-[var(--text)] tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-xs text-[var(--muted)]", className)}
      {...props}
    />
  )
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean
}

function CardContent({
  className,
  noPadding = false,
  ...props
}: CardContentProps) {
  return (
    <div
      data-slot="card-content"
      className={cn(!noPadding && "p-5 pt-0", className)}
      {...props}
    />
  )
}

function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center p-5 pt-0", className)}
      {...props}
    />
  )
}

function CardAction({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "text-xs text-[var(--oak)] hover:text-[var(--oak-hover)] font-medium cursor-pointer transition-colors",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
  cardVariants,
}
