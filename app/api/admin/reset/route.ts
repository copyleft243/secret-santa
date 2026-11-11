import { NextRequest } from "next/server";
import { isAdminAuthorized } from "@/lib/auth";
import { clearAssignments, getAdminState } from "@/lib/db";
import { getLocale, messages } from "@/lib/messages";

export async function POST(request: NextRequest): Promise<Response> {
  if (!isAdminAuthorized(request)) {
    return Response.json(
      { error: messages[getLocale(request)].errors.unauthorized },
      { status: 401 }
    );
  }
  clearAssignments();
  return Response.json(getAdminState());
}
