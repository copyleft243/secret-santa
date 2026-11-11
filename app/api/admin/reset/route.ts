import { NextRequest } from "next/server";
import { isAdminAuthorized } from "@/lib/auth";
import { clearAssignments, getAdminState } from "@/lib/db";

export async function POST(request: NextRequest): Promise<Response> {
  if (!isAdminAuthorized(request)) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }
  clearAssignments();
  return Response.json(getAdminState());
}
