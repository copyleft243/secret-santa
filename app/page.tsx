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
      .catch(() => setError("Impossible de charger la page. Veuillez rafraîchir."));
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
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }
      setCreated({ name: data.name, revealUrl: data.revealUrl });
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
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
      /* presse-papiers indisponible */
    }
  };

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-14">
      <header className="mb-8 text-center">
        <div className="text-5xl">🎁</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">Secret Santa</h1>
        <p className="mt-2 text-stone-600">
          Inscrivez votre nom : nous vous assignerons secrètement quelqu&apos;un à qui offrir un cadeau.
        </p>
      </header>

      {created ? (
        <section className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-emerald-700">
            Votre inscription est confirmée, {created.name} ! 🎉
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            Voici votre <strong>lien personnel</strong>. Gardez-le précieusement : c&apos;est le seul
            moyen de découvrir à qui vous offrirez un cadeau, et il ne s&apos;affiche qu&apos;une seule fois.
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
              {copied ? "Copié !" : "Copier"}
            </button>
          </div>
          <a
            href={created.revealUrl}
            className="mt-4 inline-block text-sm font-medium text-emerald-700 underline underline-offset-2"
          >
            Ouvrir mon lien →
          </a>
        </section>
      ) : state?.drawn ? (
        <section className="rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">Les inscriptions sont closes</h2>
          <p className="mt-2 text-sm text-stone-600">
            Le tirage au sort a déjà eu lieu. Ouvrez votre lien personnel pour découvrir votre
            destinataire.
          </p>
        </section>
      ) : (
        <form onSubmit={submit} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <label htmlFor="name" className="block text-sm font-medium text-stone-800">
            Votre nom
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex. Alice"
            maxLength={80}
            autoComplete="off"
            className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />

          {state && state.participants.length > 0 && (
            <fieldset className="mt-6">
              <legend className="text-sm font-medium text-stone-800">
                À qui préférez-vous ne <em>pas</em> offrir de cadeau ?{" "}
                <span className="text-stone-400">(facultatif)</span>
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
            {busy ? "Inscription…" : "S&apos;inscrire"}
          </button>
        </form>
      )}

      {state && !state.drawn && (
        <p className="mt-6 text-center text-sm text-stone-500">
          {state.participants.length === 0
            ? "Soyez la première personne à vous inscrire !"
            : `${state.participants.length} ${
                state.participants.length === 1
                  ? "personne s&apos;est inscrite"
                  : "personnes se sont inscrites"
              } jusqu&apos;à présent.`}
        </p>
      )}
    </main>
  );
}
