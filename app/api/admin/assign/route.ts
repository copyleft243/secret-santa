import { NextRequest } from "next/server";
import { isAdminAuthorized } from "@/lib/auth";
import { getAdminState, getAssignablePeople, isDrawn, storeAssignments } from "@/lib/db";
import { assignSecretSanta } from "@/lib/assignment";

export async function POST(request: NextRequest): Promise<Response> {
  if (!isAdminAuthorized(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (isDrawn()) {
    return Response.json(
      { error: "The draw has already been run. Reset it first to draw again." },
      { status: 409 }
    );
  }

  const people = getAssignablePeople();
  if (people.length < 2) {
    return Response.json(
      { error: "You need at least two participants to run the draw." },
      { status: 422 }
    );
  }

  const pairs = assignSecretSanta(people);
  if (!pairs) {
    return Response.json(
      { error: "No valid assignment is possible with the current exclusions." },
      { status: 422 }
    );
  }

  storeAssignments(pairs);
  return Response.json(getAdminState());
}
