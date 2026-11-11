import { NextRequest } from "next/server";
import { isAdminAuthorized } from "@/lib/auth";
import { deleteParticipant, getAdminState, isDrawn } from "@/lib/db";
import { getLocale, messages } from "@/lib/messages";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, { params }: Ctx): Promise<Response> {
  if (!isAdminAuthorized(request)) {
    return Response.json(
      { error: messages[getLocale(request)].errors.unauthorized },
      { status: 401 }
    );
  }

  const t = messages[getLocale(request)];

  const { id } = await params;
  const participantId = Number(id);
  if (!Number.isInteger(participantId) || participantId <= 0) {
    return Response.json({ error: t.errors.invalidId }, { status: 400 });
  }

  if (isDrawn()) {
    return Response.json({ error: t.errors.resetBeforeRemoving }, { status: 409 });
  }

  deleteParticipant(participantId);
  return Response.json(getAdminState());
}
