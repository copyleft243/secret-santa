"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { AdminState } from "@/lib/types";

const SECRET_KEY = "secret-santa-admin-secret";

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [state, setState] = useState<AdminState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const headers = useCallback(
    () => ({ "x-admin-secret": secret }),
    [secret]
  );

  const load = useCallback(
    async (s: string) => {
      try {
        const res = await fetch("/api/admin/state", { headers: { "x-admin-secret": s } });
        if (res.status === 401) {
          setAuthed(false);
          return;
        }
        const data: AdminState = await res.json();
        setState(data);
        setAuthed(true);
        setError(null);
      } catch {
        setError("Network error.");
      }
    },
    []
  );

  useEffect(() => {
    const stored = localStorage.getItem(SECRET_KEY);
    if (stored) {
      setSecret(stored);
      void load(stored);
    }
  }, [load]);

  const login = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/state", { headers: { "x-admin-secret": secret } });
      if (res.status === 401) {
        setAuthed(false);
        setError("Incorrect admin secret.");
        return;
      }
      const data: AdminState = await res.json();
      localStorage.setItem(SECRET_KEY, secret);
      setState(data);
      setAuthed(true);
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(SECRET_KEY);
    setSecret("");
    setAuthed(false);
    setState(null);
  };

  const runDraw = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/assign", { method: "POST", headers: headers() });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not run the draw.");
        return;
      }
      setState(data);
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setBusy(true);
    setError(null);
    setConfirmReset(false);
    try {
      const res = await fetch("/api/admin/reset", { method: "POST", headers: headers() });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not reset.");
        return;
      }
      setState(data);
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  };

  const removeParticipant = async (id: number) => {
    if (!window.confirm("Remove this participant? This cannot be undone.")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/participants/${id}`, {
        method: "DELETE",
        headers: headers(),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not remove.");
        return;
      }
      setState(data);
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  };

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const copyAll = () => {
    if (!state) return;
    const text = state.assignments.map((a) => `${a.giverName} → ${a.receiverName}`).join("\n");
    void copy(text, "all");
  };

  if (!authed) {
    return (
      <main className="mx-auto w-full max-w-sm px-4 py-20">
        <header className="mb-6 text-center">
          <div className="text-4xl">🔐</div>
          <h1 className="mt-2 text-2xl font-semibold text-stone-900">Admin</h1>
          <p className="mt-1 text-sm text-stone-500">Enter the admin secret to continue.</p>
        </header>
        <form onSubmit={login} className="space-y-3">
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Admin secret"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy || !secret}
            className="w-full rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-700 disabled:opacity-50"
          >
            {busy ? "Checking…" : "Sign in"}
          </button>
        </form>
      </main>
    );
  }

  const participantCount = state?.participants.length ?? 0;
  const canDraw = !state?.drawn && participantCount >= 2;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Admin</h1>
          <p className="text-sm text-stone-500">
            {participantCount} participant{participantCount === 1 ? "" : "s"}
            {state?.drawn ? " · draw complete" : " · not drawn yet"}
          </p>
        </div>
        <button
          onClick={logout}
          className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100"
        >
          Sign out
        </button>
      </header>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!state?.drawn && (
        <section className="mb-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-stone-900">Run the draw</h2>
              <p className="text-sm text-stone-500">
                Randomly assign everyone a giftee. Nobody gets themselves (or anyone they excluded).
              </p>
            </div>
            <button
              onClick={runDraw}
              disabled={busy || !canDraw}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Drawing…" : "Run draw"}
            </button>
          </div>
          {participantCount < 2 && (
            <p className="mt-2 text-sm text-amber-600">
              Need at least two participants to draw. Share the site so people can register!
            </p>
          )}
        </section>
      )}

      {state?.drawn && (
        <section className="mb-6 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-stone-900">The draw is complete 🎉</h2>
              <p className="text-sm text-stone-500">
                {state.assignments.length} match{state.assignments.length === 1 ? "" : "es"}.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyAll}
                className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700 hover:bg-stone-100"
              >
                {copied === "all" ? "Copied!" : "Copy results"}
              </button>
              {confirmReset ? (
                <button
                  onClick={reset}
                  disabled={busy}
                  className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500"
                >
                  Confirm reset
                </button>
              ) : (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Reset &amp; redraw
                </button>
              )}
            </div>
          </div>

          <ul className="mt-4 divide-y divide-stone-100 border-t border-stone-100">
            {state.assignments.map((a) => (
              <li key={a.giverId} className="flex items-center justify-between py-2 text-sm">
                <span className="font-medium text-stone-800">{a.giverName}</span>
                <span className="text-stone-400">→</span>
                <span className="font-medium text-emerald-700">{a.receiverName}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-100 px-5 py-4">
          <h2 className="font-semibold text-stone-900">Participants</h2>
          <p className="text-sm text-stone-500">Their personal links are listed so you can resend them.</p>
        </div>

        {state && state.participants.length === 0 ? (
          <p className="px-5 py-6 text-sm text-stone-500">No one has registered yet.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {state?.participants.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-stone-800">{p.name}</span>
                    {p.matchName && (
                      <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                        → {p.matchName}
                      </span>
                    )}
                  </div>
                  {p.exclusions.length > 0 && (
                    <p className="truncate text-xs text-stone-500">
                      won&apos;t give to: {p.exclusions.map((e) => e.name).join(", ")}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => copy(`${window.location.origin}/reveal/${p.token}`, `link-${p.id}`)}
                    className="rounded-md border border-stone-200 px-2 py-1 text-xs text-stone-600 hover:bg-stone-50"
                  >
                    {copied === `link-${p.id}` ? "Copied" : "Copy link"}
                  </button>
                  {!state?.drawn && (
                    <button
                      onClick={() => removeParticipant(p.id)}
                      disabled={busy}
                      className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
