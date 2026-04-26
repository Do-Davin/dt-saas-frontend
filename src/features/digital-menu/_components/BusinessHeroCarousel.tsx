import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, MapPin, ImageOff } from "lucide-react";
import type { Business } from "../_types/digitalMenu.types";
import { useLanguageStore } from "../_store/languageStore";
import { tText } from "../_utils/tText";

interface BusinessHeroCarouselProps {
  business: Business;
}

function formatLocation(business: Business): string | null {
  const a = business.address;
  if (!a) return null;
  const parts = [a.city, a.state].filter(Boolean);
  return parts.join(", ");
}

export function BusinessHeroCarousel({ business }: BusinessHeroCarouselProps) {
  const language = useLanguageStore((s) => s.language);

  const images: string[] = business.heroImages?.length
    ? business.heroImages
    : business.coverImageUrl
      ? [business.coverImageUrl]
      : [];

  const hasImages = images.length > 0;
  const hasMultiple = images.length > 1;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length],
  );
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );

  useEffect(() => {
    if (!hasMultiple || paused) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [hasMultiple, paused, next]);

  const location = formatLocation(business);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl bg-muted"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-video w-full sm:aspect-16/6">
        {hasImages ? (
          <>
            {images.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`${business.name} — image ${i + 1}`}
                className={[
                  "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
                  i === index ? "opacity-100" : "opacity-0",
                ].join(" ")}
              />
            ))}

            <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-10 sm:px-5 sm:pb-5">
              <h2 className="text-xl font-bold text-white sm:text-2xl">
                {business.name}
              </h2>

              {business.description && (
                <p className="mt-1 line-clamp-2 text-sm text-white/80 sm:text-base">
                  {tText(business.description, language)}
                </p>
              )}

              {location && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-white/60">
                  <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                  {location}
                </p>
              )}

              {hasMultiple && (
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 sm:bottom-5 sm:right-5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIndex(i)}
                      aria-label={`Go to image ${i + 1}`}
                      className="flex h-5 w-5 items-center justify-center"
                    >
                      <span
                        className={[
                          "block h-1.5 rounded-full transition-all duration-300",
                          i === index ? "w-4 bg-white" : "w-1.5 bg-white/40",
                        ].join(" ")}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {hasMultiple && (
              <>
                <button
                  onClick={prev}
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 sm:h-9 sm:w-9"
                >
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={next}
                  aria-label="Next image"
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 sm:h-9 sm:w-9"
                >
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted-foreground/10">
              <ImageOff className="h-6 w-6 text-muted-foreground/30" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-muted-foreground/50">{business.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}
