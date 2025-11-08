import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50'
    
    const variants = {
      default: 'bg-gradient-to-r from-[#8B5CF6] to-[#6366f1] hover:from-[#7C3AED] hover:to-[#4F46E5] text-white shadow-lg shadow-purple-500/30',
      outline: 'border border-white/10 bg-slate-800/50 hover:bg-slate-800 text-white',
      ghost: 'hover:bg-white/5 text-zinc-400 hover:text-white'
    }
    
    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 px-3 text-sm',
      lg: 'h-11 px-8',
      icon: 'h-10 w-10'
    }
    
    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

