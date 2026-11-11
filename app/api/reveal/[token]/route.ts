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
import { getLocale, messages } from "@/lib/messages";
import type { RevealState } from "@/lib/types";

type Ctx = { params: Promise<{ token: string }> };

export async function GET(request: NextRequest, { params }: Ctx): Promise<Response> {
  const { token } = await params;
  const t = messages[getLocale(request)];
  const participant = getParticipantByToken(token);
  if (!participant) {
    return Response.json({ error: t.errors.invalidLink }, { status: 404 });
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
  const t = messages[getLocale(request)];
  const participant = getParticipantByToken(token);
  if (!participant) {
    return Response.json({ error: t.errors.invalidLink }, { status: 404 });
  }
  if (isDrawn()) {
    return Response.json({ error: t.errors.drawAlreadyHappened }, { status: 409 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: t.errors.invalidBody }, { status: 400 });
  }

  const excludedIds = normalizeIdList((body as { excludedIds?: unknown }).excludedIds);
  setExclusions(participant.id, excludedIds);

  return Response.json({ ok: true, excludedIds: getExcludedIds(participant.id) });
}
