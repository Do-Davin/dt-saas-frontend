import { LanguageSwitcher } from "./LanguageSwitcher";
import { BusinessTypeBadge } from "./BusinessTypeBadge";

interface MenuHeaderProps {
  restaurantName: string;
  businessType?: string;
}

export function MenuHeader({ restaurantName, businessType }: MenuHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg font-semibold tracking-tight">{restaurantName}</h1>
          {businessType && <BusinessTypeBadge type={businessType} />}
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
