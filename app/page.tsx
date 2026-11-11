"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useI18n } from "@/components/LocaleProvider";
import { format } from "@/lib/messages";
import type { PublicState } from "@/lib/types";

export default function Home() {
  const { msg, locale } = useI18n();
  const [state, setState] = useState<PublicState | null>(null);
  const [name, setName] = useState("");
  const [excluded, setExcluded] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ name: string; revealUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/state", { headers: { "x-locale": locale } })
      .then((r) => r.json())
      .then((s: PublicState) => setState(s))
      .catch(() => setError(msg.home.loadError));
  }, [locale, msg]);

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
        headers: { "Content-Type": "application/json", "x-locale": locale },
        body: JSON.stringify({ name, excludedIds: [...excluded] }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? msg.home.genericError);
        return;
      }
      setCreated({ name: data.name, revealUrl: data.revealUrl });
    } catch {
      setError(msg.home.networkError);
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
        <p className="mt-2 text-stone-600">{msg.home.subtitle}</p>
      </header>

      {created ? (
        <section className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-emerald-700">
            {format(msg.home.successTitle, { name: created.name })}
          </h2>
          <p className="mt-2 text-sm text-stone-600">{msg.home.successText}</p>
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
              {copied ? msg.home.copied : msg.home.copy}
            </button>
          </div>
          <a
            href={created.revealUrl}
            className="mt-4 inline-block text-sm font-medium text-emerald-700 underline underline-offset-2"
          >
            {msg.home.openLink}
          </a>
        </section>
      ) : state?.drawn ? (
        <section className="rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">{msg.home.closedTitle}</h2>
          <p className="mt-2 text-sm text-stone-600">{msg.home.closedText}</p>
        </section>
      ) : (
        <form onSubmit={submit} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <label htmlFor="name" className="block text-sm font-medium text-stone-800">
            {msg.home.nameLabel}
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={msg.home.namePlaceholder}
            maxLength={80}
            autoComplete="off"
            className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />

          {state && state.participants.length > 0 && (
            <fieldset className="mt-6">
              <legend className="text-sm font-medium text-stone-800">
                {msg.home.exclusionsLegend} <span className="text-stone-400">{msg.home.optional}</span>
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
            {busy ? msg.home.submitting : msg.home.submit}
          </button>
        </form>
      )}

      {state && !state.drawn && (
        <p className="mt-6 text-center text-sm text-stone-500">
          {state.participants.length === 0
            ? msg.home.footerNone
            : state.participants.length === 1
              ? msg.home.footerOne
              : format(msg.home.footerMany, { count: state.participants.length })}
        </p>
      )}
    </main>
  );
}
