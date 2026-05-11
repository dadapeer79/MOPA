import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  isLoading?: boolean
  className?: string
  contentClassName?: string
  children: React.ReactNode
  gradient?: boolean
  hover?: boolean
  glass?: boolean
}

export function EnhancedCard({
  title,
  description,
  isLoading,
  className,
  contentClassName,
  children,
  gradient = false,
  hover = true,
  glass = false,
  ...props
}: EnhancedCardProps) {
  const cardClassName = cn(
    'relative overflow-hidden',
    hover && 'card-hover-effect',
    glass && 'glass-effect',
    gradient && 'gradient-border',
    className
  )

  if (isLoading) {
    return (
      <Card className={cardClassName} {...props}>
        {title && (
          <CardHeader>
            <div className="h-7 w-1/3 rounded-lg skeleton" />
            {description && <div className="h-4 w-2/3 rounded-lg skeleton mt-2" />}
          </CardHeader>
        )}
        <CardContent className={cn("space-y-4", contentClassName)}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 w-full rounded-lg skeleton" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cardClassName} {...props}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn("relative z-10", contentClassName)}>{children}</CardContent>
      {gradient && (
        <div className="absolute inset-0 opacity-5 blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent" />
        </div>
      )}
    </Card>
  )
}