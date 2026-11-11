import { NextRequest } from "next/server";
import { DuplicateNameError, createParticipant, isDrawn, normalizeIdList } from "@/lib/db";

export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const raw = body as { name?: unknown; excludedIds?: unknown };
  const name = typeof raw.name === "string" ? raw.name.trim() : "";

  if (!name) {
    return Response.json({ error: "Veuillez saisir votre nom." }, { status: 400 });
  }
  if (name.length > 80) {
    return Response.json({ error: "Ce nom est trop long (80 caractères maximum)." }, { status: 400 });
  }

  const excludedIds = normalizeIdList(raw.excludedIds);

  if (isDrawn()) {
    return Response.json(
      { error: "Les inscriptions sont closes — le tirage au sort a déjà eu lieu." },
      { status: 409 }
    );
  }

  try {
    const participant = createParticipant(name, excludedIds);
    return Response.json({
      name: participant.name,
      token: participant.token,
      revealUrl: `/reveal/${participant.token}`,
    });
  } catch (err) {
    if (err instanceof DuplicateNameError) {
      return Response.json(
        { error: "Une personne portant ce nom est déjà inscrite (sans distinction de casse)." },
        { status: 409 }
      );
    }
    throw err;
  }
}
