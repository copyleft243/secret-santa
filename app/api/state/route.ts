import { isDrawn, listParticipants } from "@/lib/db";
import type { PublicState } from "@/lib/types";

export async function GET(): Promise<Response> {
  const state: PublicState = {
    drawn: isDrawn(),
    participants: listParticipants(),
  };
  return Response.json(state);
}
