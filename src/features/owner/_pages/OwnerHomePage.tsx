import { Link } from "react-router";
import {
  LayoutDashboardIcon,
  InboxIcon,
  SparklesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const QUICK_LINKS = [
  {
    label: "View requests",
    to: "/owner/requests",
    icon: InboxIcon,
    description: "Review & manage incoming customer orders and inquiries",
  },
] as const;

const TIPS = [
  "Pin your most active business to see its requests first.",
  "Use status filters on the request list to focus on what needs action.",
  "Bookmark the requests page for one-click access from your home screen.",
] as const;

export function OwnerHomePage() {
  return (
    <section className="space-y-6">
      {/* ── Hero welcome card ──────────────────────────────────────────── */}
      <Card className="relative overflow-hidden border-primary/15 bg-gradient-to-br from-primary/[0.04] via-card to-card">
        {/* Decorative glow — purely cosmetic */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/[0.06] blur-3xl"
          aria-hidden
        />

        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LayoutDashboardIcon className="size-5" />
            </span>
            <div>
              <CardTitle className="text-lg sm:text-xl tracking-tight">
                Welcome back
              </CardTitle>
              <CardDescription className="mt-0.5">
                Your owner dashboard at a glance
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed max-w-prose">
            This is your central hub for managing customer requests, tracking
            order statuses, and keeping your business running smoothly. Jump
            into the sections below to get started.
          </p>

          {/* Quick‑link cards */}
          <div className="grid gap-3 sm:grid-cols-2">
            {QUICK_LINKS.map((link) => (
              <div
                key={link.to}
                className="group rounded-lg border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-primary/[0.03]"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                    <link.icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold tracking-tight">
                      {link.label}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
                      {link.description}
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      asChild
                      className="mt-1.5 h-auto p-0 text-xs"
                    >
                      <Link to={link.to}>Go →</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Tips card ──────────────────────────────────────────────────── */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <SparklesIcon className="size-4 text-primary/70" />
            <CardTitle className="text-sm">Quick tips</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {TIPS.map((tip, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed"
              >
                <span
                  className="mt-1 size-1.5 shrink-0 rounded-full bg-primary/40"
                  aria-hidden
                />
                {tip}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
