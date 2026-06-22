import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const variantStyles = {
  primary: 'bg-accent text-white hover:opacity-90 active:opacity-75',
  ghost: 'bg-transparent border border-border text-text-secondary hover:text-text-primary hover:border-text-secondary active:opacity-75',
  danger: 'bg-danger text-white hover:opacity-90 active:opacity-75',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-base rounded-xl',
  lg: 'px-7 py-3.5 text-lg rounded-xl',
}

export function Button({ variant = 'primary', size = 'md', children, className = '', ...props }: Props) {
  return (
    <button
      className={`font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
