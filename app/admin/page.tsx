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
  const [copied, setCopied] = useState(false);

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
        setError("Erreur réseau.");
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
        setError("Mot de passe administrateur incorrect.");
        return;
      }
      const data: AdminState = await res.json();
      localStorage.setItem(SECRET_KEY, secret);
      setState(data);
      setAuthed(true);
    } catch {
      setError("Erreur réseau.");
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
        setError(data.error ?? "Impossible de lancer le tirage.");
        return;
      }
      setState(data);
    } catch {
      setError("Erreur réseau.");
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
        setError(data.error ?? "Impossible de réinitialiser.");
        return;
      }
      setState(data);
    } catch {
      setError("Erreur réseau.");
    } finally {
      setBusy(false);
    }
  };

  const removeParticipant = async (id: number) => {
    if (!window.confirm("Retirer cette personne ? Cette action est irréversible.")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/participants/${id}`, {
        method: "DELETE",
        headers: headers(),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Impossible de retirer cette personne.");
        return;
      }
      setState(data);
    } catch {
      setError("Erreur réseau.");
    } finally {
      setBusy(false);
    }
  };

  const copyAll = async () => {
    if (!state) return;
    const text = state.assignments.map((a) => `${a.giverName} → ${a.receiverName}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* presse-papiers indisponible */
    }
  };

  if (!authed) {
    return (
      <main className="mx-auto w-full max-w-sm px-4 py-20">
        <header className="mb-6 text-center">
          <div className="text-4xl">🔐</div>
          <h1 className="mt-2 text-2xl font-semibold text-stone-900">Administration</h1>
          <p className="mt-1 text-sm text-stone-500">
            Saisissez le mot de passe administrateur pour continuer.
          </p>
        </header>
        <form onSubmit={login} className="space-y-3">
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Mot de passe administrateur"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy || !secret}
            className="w-full rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-700 disabled:opacity-50"
          >
            {busy ? "Vérification…" : "Se connecter"}
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
          <h1 className="text-2xl font-semibold text-stone-900">Administration</h1>
          <p className="text-sm text-stone-500">
            {participantCount} participant{participantCount === 1 ? "" : "s"}
            {state?.drawn ? " · tirage effectué" : " · pas encore tiré"}
          </p>
        </div>
        <button
          onClick={logout}
          className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100"
        >
          Se déconnecter
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
              <h2 className="font-semibold text-stone-900">Lancer le tirage au sort</h2>
              <p className="text-sm text-stone-500">
                Assigne aléatoirement un destinataire à chaque personne. Personne ne s&apos;offre à
                soi-même (ni à une personne exclue).
              </p>
            </div>
            <button
              onClick={runDraw}
              disabled={busy || !canDraw}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Tirage…" : "Lancer le tirage"}
            </button>
          </div>
          {participantCount < 2 && (
            <p className="mt-2 text-sm text-amber-600">
              Il faut au moins deux participants pour lancer le tirage. Partagez le site pour que les
              gens s&apos;inscrivent !
            </p>
          )}
        </section>
      )}

      {state?.drawn && (
        <section className="mb-6 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-stone-900">Le tirage est terminé 🎉</h2>
              <p className="text-sm text-stone-500">
                {state.assignments.length} attribution{state.assignments.length === 1 ? "" : "s"}.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyAll}
                className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700 hover:bg-stone-100"
              >
                {copied ? "Copié !" : "Copier les résultats"}
              </button>
              {confirmReset ? (
                <button
                  onClick={reset}
                  disabled={busy}
                  className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500"
                >
                  Confirmer
                </button>
              ) : (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Réinitialiser le tirage
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
        </div>

        {state && state.participants.length === 0 ? (
          <p className="px-5 py-6 text-sm text-stone-500">Aucune inscription pour le moment.</p>
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
                      ne fera pas de cadeau à : {p.exclusions.map((e) => e.name).join(", ")}
                    </p>
                  )}
                </div>
                {!state?.drawn && (
                  <button
                    onClick={() => removeParticipant(p.id)}
                    disabled={busy}
                    className="shrink-0 rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Retirer
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
