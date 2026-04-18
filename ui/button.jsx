import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  /* Base — minimal, functional, consistent */
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97] select-none",
  {
    variants: {
      variant: {
        /* Primary — high emphasis, one per view */
        default:
          "bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white rounded-xl shadow-md hover:shadow-lg hover:brightness-110 hover:-translate-y-0.5 border border-white/10",
        /* Destructive */
        destructive:
          "bg-error text-white rounded-xl shadow-sm hover:brightness-110 hover:-translate-y-0.5",
        /* Secondary — medium emphasis */
        outline:
          "bg-white/5 text-white/80 rounded-xl border border-white/12 hover:bg-white/10 hover:text-white hover:border-white/20 hover:-translate-y-0.5",
        /* Ghost — low emphasis */
        secondary:
          "bg-white/7 text-white/75 rounded-xl border border-white/8 hover:bg-white/12 hover:text-white hover:-translate-y-0.5",
        /* Ghost — no background */
        ghost:
          "text-white/60 rounded-xl hover:bg-white/8 hover:text-white/90",
        /* Link */
        link:
          "text-[var(--theme-primary)] underline-offset-4 hover:underline hover:brightness-110 rounded-none",
      },
      size: {
        sm:      "h-8 px-3 text-xs rounded-lg",
        default: "h-10 px-5 text-sm",
        lg:      "h-12 px-7 text-base",
        xl:      "h-14 px-8 text-base",
        icon:    "h-10 w-10 rounded-xl",
        'icon-sm': "h-8 w-8 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }