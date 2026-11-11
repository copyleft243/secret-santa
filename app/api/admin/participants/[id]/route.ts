import { NextRequest } from "next/server";
import { isAdminAuthorized } from "@/lib/auth";
import { deleteParticipant, getAdminState, isDrawn } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, { params }: Ctx): Promise<Response> {
  if (!isAdminAuthorized(request)) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;
  const participantId = Number(id);
  if (!Number.isInteger(participantId) || participantId <= 0) {
    return Response.json({ error: "Identifiant invalide." }, { status: 400 });
  }

  if (isDrawn()) {
    return Response.json(
      { error: "Réinitialisez le tirage avant de retirer des participants." },
      { status: 409 }
    );
  }

  deleteParticipant(participantId);
  return Response.json(getAdminState());
}
