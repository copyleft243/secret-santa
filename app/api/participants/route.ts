import { NextRequest } from "next/server";
import { DuplicateNameError, createParticipant, isDrawn, normalizeIdList } from "@/lib/db";
import { getLocale, messages } from "@/lib/messages";

export async function POST(request: NextRequest): Promise<Response> {
  const t = messages[getLocale(request)];

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: t.errors.invalidBody }, { status: 400 });
  }

  const raw = body as { name?: unknown; excludedIds?: unknown };
  const name = typeof raw.name === "string" ? raw.name.trim() : "";

  if (!name) {
    return Response.json({ error: t.errors.nameRequired }, { status: 400 });
  }
  if (name.length > 80) {
    return Response.json({ error: t.errors.nameTooLong }, { status: 400 });
  }

  const excludedIds = normalizeIdList(raw.excludedIds);

  if (isDrawn()) {
    return Response.json({ error: t.errors.registrationClosed }, { status: 409 });
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
      return Response.json({ error: t.errors.duplicateName }, { status: 409 });
    }
    throw err;
  }
}
