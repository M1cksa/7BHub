import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
        return (
          (<textarea
            className={cn(
              "flex min-h-[60px] w-full rounded-2xl border-2 border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md px-4 py-3 text-base shadow-lg transition-all duration-300 placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:border-cyan-400/60 focus-visible:shadow-xl focus-visible:shadow-cyan-500/30 focus-visible:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm hover:border-white/40 hover:bg-white/12 hover:shadow-xl",
              className
            )}
            ref={ref}
            {...props} />)
        );
      })
Textarea.displayName = "Textarea"

export { Textarea }