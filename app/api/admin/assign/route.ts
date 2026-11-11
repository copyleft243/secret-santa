import { NextRequest } from "next/server";
import { isAdminAuthorized } from "@/lib/auth";
import { getAdminState, getAssignablePeople, isDrawn, storeAssignments } from "@/lib/db";
import { assignSecretSanta } from "@/lib/assignment";

export async function POST(request: NextRequest): Promise<Response> {
  if (!isAdminAuthorized(request)) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }
  if (isDrawn()) {
    return Response.json(
      { error: "Le tirage a déjà été effectué. Réinitialisez-le avant de relancer." },
      { status: 409 }
    );
  }

  const people = getAssignablePeople();
  if (people.length < 2) {
    return Response.json(
      { error: "Il faut au moins deux participants pour lancer le tirage." },
      { status: 422 }
    );
  }

  const pairs = assignSecretSanta(people);
  if (!pairs) {
    return Response.json(
      { error: "Aucune assignation valide n'est possible avec les exclusions actuelles." },
      { status: 422 }
    );
  }

  storeAssignments(pairs);
  return Response.json(getAdminState());
}
