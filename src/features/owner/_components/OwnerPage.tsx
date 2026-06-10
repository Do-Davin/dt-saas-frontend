import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface OwnerPageProps {
  children: ReactNode;
  className?: string;
}

export function OwnerPage({ children, className }: OwnerPageProps) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}
