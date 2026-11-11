"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { PublicState } from "@/lib/types";

export default function Home() {
  const [state, setState] = useState<PublicState | null>(null);
  const [name, setName] = useState("");
  const [excluded, setExcluded] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ name: string; revealUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/state")
      .then((r) => r.json())
      .then((s: PublicState) => setState(s))
      .catch(() => setError("Could not load the page. Please refresh."));
  }, []);

  const toggleExclude = (id: number) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, excludedIds: [...excluded] }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setCreated({ name: data.name, revealUrl: data.revealUrl });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async () => {
    if (!created) return;
    const url = `${window.location.origin}${created.revealUrl}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-14">
      <header className="mb-8 text-center">
        <div className="text-5xl">🎁</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">Secret Santa</h1>
        <p className="mt-2 text-stone-600">Register your name and we&apos;ll secretly match everyone up.</p>
      </header>

      {created ? (
        <section className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-emerald-700">You&apos;re in, {created.name}! 🎉</h2>
          <p className="mt-2 text-sm text-stone-600">
            This is your <strong>personal link</strong>. Save it — it&apos;s the only way to see who
            you&apos;re giving to, and it&apos;s shown only once.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-800">
              {window.location.origin}
              {created.revealUrl}
            </code>
            <button
              type="button"
              onClick={copyLink}
              className="shrink-0 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <a
            href={created.revealUrl}
            className="mt-4 inline-block text-sm font-medium text-emerald-700 underline underline-offset-2"
          >
            Open my link →
          </a>
        </section>
      ) : state?.drawn ? (
        <section className="rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">Registration is closed</h2>
          <p className="mt-2 text-sm text-stone-600">
            The draw has already happened. If you registered, open your personal link to see your
            match.
          </p>
        </section>
      ) : (
        <form
          onSubmit={submit}
          className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
        >
          <label htmlFor="name" className="block text-sm font-medium text-stone-800">
            Your name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alice"
            maxLength={80}
            autoComplete="off"
            className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />

          {state && state.participants.length > 0 && (
            <fieldset className="mt-6">
              <legend className="text-sm font-medium text-stone-800">
                Anyone you&apos;d rather <em>not</em> give to? <span className="text-stone-400">(optional)</span>
              </legend>
              <div className="mt-3 max-h-56 space-y-1 overflow-y-auto rounded-lg border border-stone-200 p-2">
                {state.participants.map((p) => (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-stone-50"
                  >
                    <input
                      type="checkbox"
                      checked={excluded.has(p.id)}
                      onChange={() => toggleExclude(p.id)}
                      className="h-4 w-4 accent-emerald-600"
                    />
                    <span className="text-sm text-stone-700">{p.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={busy || !name.trim()}
            className="mt-6 w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Registering…" : "Register"}
          </button>
        </form>
      )}

      {state && !state.drawn && (
        <p className="mt-6 text-center text-sm text-stone-500">
          {state.participants.length === 0
            ? "Be the first to sign up!"
            : `${state.participants.length} ${state.participants.length === 1 ? "person has" : "people have"} signed up so far.`}
        </p>
      )}
    </main>
  );
}
