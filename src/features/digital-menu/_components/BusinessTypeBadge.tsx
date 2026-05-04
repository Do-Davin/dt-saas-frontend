import { Badge } from "@/components/ui/badge"

// Defines the expected input properties for this component
export interface BusinessTypeBadgeProps {
    type: string
}

// Formats raw enum strings (e.g., "COFFEE_SHOP") into readable text (e.g., "Coffee Shop")
function formatBusinessType(type: string) {
    if (!type) return ""

    return type
        .replace(/[_-]+/g, " ")
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(" ")
}

// Displays the formatted business type as a small, badge-style UI label
export function BusinessTypeBadge({ type }: BusinessTypeBadgeProps) {
    const label = formatBusinessType(type)

    return (
        <Badge className="px-2 py-0.5 text-xs font-medium" data-testid="business-type-badge">
            {label}
        </Badge>
    )
}

export default BusinessTypeBadge