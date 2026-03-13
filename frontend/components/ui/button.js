import * as React from "react"

const Button = React.forwardRef(({ className = "", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-4 py-2 ${className}`}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }