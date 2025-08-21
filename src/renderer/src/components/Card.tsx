import { useState } from 'react'

interface CardProps {
  title: string
  description?: string
  onClick?: () => void
  className?: string
}

export function Card({ title, description, onClick, className = '' }: CardProps): React.JSX.Element {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`bg-[var(--c-bg-2)] border border-[var(--c-border-1)] rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-[var(--c-accent-1)] ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3 className="text-lg font-semibold text-[var(--c-text-1)] mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-[var(--c-text-2)] text-sm leading-relaxed">
          {description}
        </p>
      )}
      {isHovered && onClick && (
        <div className="mt-3 text-[var(--c-accent-1)] text-sm font-medium">
          Click to view details →
        </div>
      )}
    </div>
  )
}