import { ButtonHTMLAttributes, forwardRef } from 'react'
import { RotateCw } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'default', isLoading, children, ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-lg text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95"

        const variants = {
            primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg",
            secondary: "bg-pink-500 text-white hover:bg-pink-600 shadow-md hover:shadow-lg",
            outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50",
            ghost: "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50",
        }

        const sizes = {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10",
        }

        return (
            <button
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                ref={ref}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <RotateCw className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        )
    }
)
Button.displayName = 'Button'

export { Button }
