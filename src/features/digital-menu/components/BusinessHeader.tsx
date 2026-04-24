import { MapPin, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Business } from "../types/digitalMenu.types";

interface BusinessHeaderProps {
  business: Business;
}

function formatLocation(business: Business): string | null {
  const a = business.address;
  if (!a) return null;
  const parts = [a.street, a.city, a.state].filter(Boolean);
  return parts.join(", ");
}

export function BusinessHeader({ business }: BusinessHeaderProps) {
  const location = formatLocation(business);
  const telegramHandle = business.contact?.telegram;

  return (
    <Card className="rounded-none border-x-0 border-t-0 shadow-none">
      <CardContent className="mx-auto max-w-3xl px-4 py-5">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="shrink-0">
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt={`${business.name} logo`}
                className="h-16 w-16 rounded-xl object-cover"
              />
            ) : (
              <div
                className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground"
                aria-hidden="true"
              >
                {business.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold leading-tight tracking-tight">
              {business.name}
            </h1>

            {business.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {business.description}
              </p>
            )}

            {location && (
              <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Telegram CTA — full width below on small screens */}
        {telegramHandle && (
          <Button
            asChild
            variant="outline"
            className="mt-4 w-full gap-2 sm:w-auto"
          >
            <a
              href={`https://t.me/${telegramHandle}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              Contact on Telegram
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
