import { NextRequest } from "next/server";
import {
  getExcludedIds,
  getMatch,
  getParticipantByToken,
  isDrawn,
  listParticipants,
  normalizeIdList,
  setExclusions,
} from "@/lib/db";
import type { RevealState } from "@/lib/types";

type Ctx = { params: Promise<{ token: string }> };

export async function GET(_request: NextRequest, { params }: Ctx): Promise<Response> {
  const { token } = await params;
  const participant = getParticipantByToken(token);
  if (!participant) {
    return Response.json({ error: "This link is not valid." }, { status: 404 });
  }

  const drawn = isDrawn();
  const state: RevealState = {
    name: participant.name,
    drawn,
    matchName: drawn ? (getMatch(participant.id)?.name ?? null) : null,
    participants: listParticipants().filter((p) => p.id !== participant.id),
    excludedIds: getExcludedIds(participant.id),
  };
  return Response.json(state);
}

export async function PATCH(request: NextRequest, { params }: Ctx): Promise<Response> {
  const { token } = await params;
  const participant = getParticipantByToken(token);
  if (!participant) {
    return Response.json({ error: "This link is not valid." }, { status: 404 });
  }
  if (isDrawn()) {
    return Response.json(
      { error: "The draw has already happened, so exclusions can no longer be changed." },
      { status: 409 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const excludedIds = normalizeIdList((body as { excludedIds?: unknown }).excludedIds);
  setExclusions(participant.id, excludedIds);

  return Response.json({ ok: true, excludedIds: getExcludedIds(participant.id) });
}
