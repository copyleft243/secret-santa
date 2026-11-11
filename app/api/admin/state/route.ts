import { NextRequest } from "next/server";
import { isAdminAuthorized } from "@/lib/auth";
import { getAdminState } from "@/lib/db";

export async function GET(request: NextRequest): Promise<Response> {
  if (!isAdminAuthorized(request)) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }
  return Response.json(getAdminState());
}
