import { LanguageSwitcher } from "./LanguageSwitcher";

interface MenuHeaderProps {
  restaurantName: string;
}

export function MenuHeader({ restaurantName }: MenuHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <h1 className="text-lg font-semibold tracking-tight">{restaurantName}</h1>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
