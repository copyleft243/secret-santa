"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { RevealState } from "@/lib/types";

export default function RevealPage() {
  const params = useParams();
  const token = (params?.token as string | undefined) ?? "";

  const [state, setState] = useState<RevealState | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [excluded, setExcluded] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/reveal/${token}`)
      .then(async (r) => {
        if (r.status === 404) {
          setNotFound(true);
          return;
        }
        const data: RevealState = await r.json();
        setState(data);
        setExcluded(new Set(data.excludedIds));
      })
      .catch(() => setError("Impossible de charger votre page. Veuillez rafraîchir."));
  }, [token]);

  const toggle = (id: number) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/reveal/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ excludedIds: [...excluded] }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Impossible d'enregistrer.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-14">
      <header className="mb-8 text-center">
        <div className="text-5xl">🎁</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">Secret Santa</h1>
      </header>

      {notFound ? (
        <section className="rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">Ce lien n&apos;est pas valide</h2>
          <p className="mt-2 text-sm text-stone-600">
            Vérifiez l&apos;adresse qui vous a été fournie, ou contactez l&apos;organisateur.
          </p>
        </section>
      ) : !state ? (
        <p className="text-center text-stone-500">Chargement…</p>
      ) : state.drawn ? (
        <section className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-stone-500">Bonjour {state.name},</p>
          <p className="mt-3 text-xl font-semibold text-stone-900">
            {state.matchName
              ? "Vous allez offrir un cadeau à…"
              : "Un problème est survenu — contactez l&apos;organisateur."}
          </p>
          {state.matchName && (
            <div className="mt-6 rounded-xl bg-emerald-50 px-6 py-8">
              <span className="text-4xl font-bold tracking-tight text-emerald-700">
                {state.matchName}
              </span>
            </div>
          )}
          <p className="mt-6 text-sm text-stone-500">🤫 Ne le dites à personne !</p>
        </section>
      ) : (
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">
            Bonjour {state.name} — votre inscription est bien enregistrée 🎉
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            Gardez ce lien précieusement. Une fois le tirage effectué par l&apos;organisateur,
            revenez ici pour découvrir à qui vous offrirez un cadeau.
          </p>

          {state.participants.length > 0 && (
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
                      onChange={() => toggle(p.id)}
                      className="h-4 w-4 accent-emerald-600"
                    />
                    <span className="text-sm text-stone-700">{p.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          {state.participants.length > 0 && (
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="mt-6 w-full rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:opacity-50"
            >
              {saving ? "Enregistrement…" : saved ? "Enregistré ✓" : "Enregistrer mes préférences"}
            </button>
          )}
        </section>
      )}
    </main>
  );
}
