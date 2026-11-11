import { NextRequest } from "next/server";
import { isAdminAuthorized } from "@/lib/auth";
import { getAdminState, getAssignablePeople, isDrawn, storeAssignments } from "@/lib/db";
import { assignSecretSanta } from "@/lib/assignment";
import { getLocale, messages } from "@/lib/messages";

export async function POST(request: NextRequest): Promise<Response> {
  if (!isAdminAuthorized(request)) {
    return Response.json(
      { error: messages[getLocale(request)].errors.unauthorized },
      { status: 401 }
    );
  }

  const t = messages[getLocale(request)];

  if (isDrawn()) {
    return Response.json({ error: t.errors.alreadyDrawn }, { status: 409 });
  }

  const people = getAssignablePeople();
  if (people.length < 2) {
    return Response.json({ error: t.errors.needTwoParticipants }, { status: 422 });
  }

  const pairs = assignSecretSanta(people);
  if (!pairs) {
    return Response.json({ error: t.errors.noValidAssignment }, { status: 422 });
  }

  storeAssignments(pairs);
  return Response.json(getAdminState());
}
