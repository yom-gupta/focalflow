import * as React from "react"

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`text-sm font-medium leading-none text-slate-300 ${className}`}
        {...props}
      />
    )
  }
)
Label.displayName = "Label"

export { Label }

