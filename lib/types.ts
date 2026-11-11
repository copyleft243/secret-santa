// Shared API types used by both the server (route handlers) and the client (pages).
// Keep this file free of runtime imports so client components can `import type` from it.

export interface ParticipantInfo {
  id: number;
  name: string;
}

export interface PublicState {
  drawn: boolean;
  participants: ParticipantInfo[];
}

export interface RevealState {
  name: string;
  drawn: boolean;
  matchName: string | null;
  /** Everyone except the viewer, shown as checkboxes for exclusions. */
  participants: ParticipantInfo[];
  /** Ids the viewer currently excludes. */
  excludedIds: number[];
}

export interface AdminParticipant {
  id: number;
  name: string;
  exclusions: ParticipantInfo[];
  matchName: string | null;
}

export interface AdminAssignment {
  giverId: number;
  receiverId: number;
  giverName: string;
  receiverName: string;
}

export interface AdminState {
  drawn: boolean;
  participants: AdminParticipant[];
  assignments: AdminAssignment[];
}
