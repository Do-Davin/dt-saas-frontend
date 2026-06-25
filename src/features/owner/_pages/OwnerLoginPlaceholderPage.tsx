import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/client";
import { loginOwner } from "../_api/auth";
import { useOwnerAuthStore } from "../_store/ownerAuth";

function toSafeErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return "Invalid username or password.";
    if (err.status === 0)
      return "Could not connect to the server. Please check your connection.";
    return "Login failed. Please try again.";
  }
  if (err instanceof Error) return err.message;
  return "Login failed. Please try again.";
}

export function OwnerLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const token = await loginOwner({ username, password });
      useOwnerAuthStore.getState().setToken(token);
      navigate("/owner", { replace: true });
    } catch (err) {
      setError(toSafeErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-lg border bg-card text-card-foreground p-6 sm:p-8 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">
          DT SaaS — Owner Login
        </h1>
        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
          noValidate
        >
          <div className="space-y-1.5">
            <label
              htmlFor="owner-username"
              className="text-sm font-medium text-foreground"
            >
              Username
            </label>
            <Input
              id="owner-username"
              type="text"
              autoComplete="username"
              placeholder="your-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={submitting}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="owner-password"
              className="text-sm font-medium text-foreground"
            >
              Password
            </label>
            <Input
              id="owner-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              required
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        {/* Demo credentials */}
        <div className="mt-5 rounded-md bg-muted p-3 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">Demo credentials</p>
          <p>
            SUPER_ADMIN:{" "}
            <code className="font-mono bg-background px-1 py-0.5 rounded border border-border">
              dev
            </code>{" "}
            /{" "}
            <code className="font-mono bg-background px-1 py-0.5 rounded border border-border">
              dev-password
            </code>
          </p>
          <p>
            OWNER:{" "}
            <code className="font-mono bg-background px-1 py-0.5 rounded border border-border">
              demo-owner
            </code>{" "}
            /{" "}
            <code className="font-mono bg-background px-1 py-0.5 rounded border border-border">
              demo-password
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
