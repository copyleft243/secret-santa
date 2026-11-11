import { NextRequest } from "next/server";
import { DuplicateNameError, createParticipant, isDrawn, normalizeIdList } from "@/lib/db";

export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const raw = body as { name?: unknown; excludedIds?: unknown };
  const name = typeof raw.name === "string" ? raw.name.trim() : "";

  if (!name) {
    return Response.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (name.length > 80) {
    return Response.json({ error: "That name is too long (max 80 characters)." }, { status: 400 });
  }

  const excludedIds = normalizeIdList(raw.excludedIds);

  if (isDrawn()) {
    return Response.json(
      { error: "Registration is closed — the draw has already happened." },
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
        { error: "Someone with this name is already registered (names are case-insensitive)." },
        { status: 409 }
      );
    }
    throw err;
  }
}
