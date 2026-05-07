import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface ProductAvailabilityLabelProps {
  isAvailable: boolean
  label?: string
  className?: string // Added for parent layout control
}

export function ProductAvailabilityLabel({
  isAvailable,
  label,
  className,
}: ProductAvailabilityLabelProps) {
  const text = label ?? (isAvailable ? "Available" : "Unavailable")
  
  // Explicitly typing the variant makes TypeScript happy without using 'any'
  const variant: "default" | "destructive" = isAvailable ? "default" : "destructive"

  return (
    <Badge
      variant={variant}
      className={cn(
        "uppercase tracking-wider px-2 py-0.5 text-[11px]",
        className
      )}
    >
      {text}
    </Badge>
  )
}

export default ProductAvailabilityLabel