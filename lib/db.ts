import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type {
  AdminAssignment,
  AdminState,
  ParticipantInfo,
} from "@/lib/types";

export class DuplicateNameError extends Error {}

export interface ParticipantRow {
  id: number;
  name: string;
  token: string;
}

// Reuse a single connection across hot reloads in development.
const globalForDb = globalThis as unknown as { __secretSantaDb?: DatabaseSync };

function dbPath(): string {
  return process.env.DB_PATH ?? path.join(process.cwd(), "data", "secret-santa.db");
}

function migrate(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS participant (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      name     TEXT NOT NULL,
      name_key TEXT NOT NULL UNIQUE,
      token    TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS exclusion (
      participant_id INTEGER NOT NULL REFERENCES participant(id) ON DELETE CASCADE,
      excluded_id    INTEGER NOT NULL REFERENCES participant(id) ON DELETE CASCADE,
      PRIMARY KEY (participant_id, excluded_id),
      CHECK (participant_id <> excluded_id)
    );

    CREATE TABLE IF NOT EXISTS assignment (
      giver_id    INTEGER PRIMARY KEY REFERENCES participant(id) ON DELETE CASCADE,
      receiver_id INTEGER NOT NULL UNIQUE REFERENCES participant(id) ON DELETE CASCADE,
      CHECK (giver_id <> receiver_id)
    );
  `);
}

function open(): DatabaseSync {
  const file = dbPath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec("PRAGMA busy_timeout = 5000;");
  migrate(db);
  return db;
}

export function getDb(): DatabaseSync {
  if (!globalForDb.__secretSantaDb) {
    globalForDb.__secretSantaDb = open();
  }
  return globalForDb.__secretSantaDb;
}

function generateToken(): string {
  // 18 random bytes -> 24 URL-safe characters, unguessable.
  return randomBytes(18).toString("base64url");
}

const nameKey = (name: string): string => name.trim().toLowerCase();

/** Coerce untrusted request input into a deduplicated list of positive integers. */
export function normalizeIdList(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<number>();
  const out: number[] = [];
  for (const v of value) {
    if (typeof v !== "number" || !Number.isInteger(v) || v <= 0) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

export function listParticipants(): ParticipantInfo[] {
  const rows = getDb()
    .prepare("SELECT id, name FROM participant ORDER BY id")
    .all() as unknown as { id: number; name: string }[];
  return rows.map((r) => ({ id: r.id, name: r.name }));
}

export function getParticipantByToken(token: string): ParticipantRow | null {
  const row = getDb()
    .prepare("SELECT id, name, token FROM participant WHERE token = ?")
    .get(token) as unknown as ParticipantRow | undefined;
  return row ? { id: row.id, name: row.name, token: row.token } : null;
}

export function isDrawn(): boolean {
  const row = getDb()
    .prepare("SELECT COUNT(*) AS c FROM assignment")
    .get() as unknown as { c: number };
  return row.c > 0;
}

export function getExcludedIds(participantId: number): number[] {
  const rows = getDb()
    .prepare(
      "SELECT excluded_id AS id FROM exclusion WHERE participant_id = ? ORDER BY excluded_id"
    )
    .all(participantId) as unknown as { id: number }[];
  return rows.map((r) => r.id);
}

function getExclusionsDetailed(participantId: number): ParticipantInfo[] {
  const rows = getDb()
    .prepare(
      `SELECT p.id AS id, p.name AS name
       FROM exclusion e
       JOIN participant p ON p.id = e.excluded_id
       WHERE e.participant_id = ?
       ORDER BY p.name COLLATE NOCASE`
    )
    .all(participantId) as unknown as { id: number; name: string }[];
  return rows.map((r) => ({ id: r.id, name: r.name }));
}

function validExcludedIds(db: DatabaseSync, participantId: number, ids: number[]): number[] {
  const exists = db.prepare("SELECT 1 AS ok FROM participant WHERE id = ?");
  return ids.filter((id) => id !== participantId && exists.get(id) !== undefined);
}

function addExclusions(db: DatabaseSync, participantId: number, ids: number[]): void {
  const ins = db.prepare(
    "INSERT OR IGNORE INTO exclusion (participant_id, excluded_id) VALUES (?, ?)"
  );
  for (const id of validExcludedIds(db, participantId, ids)) {
    ins.run(participantId, id);
  }
}

export function createParticipant(name: string, excludedIds: number[]): ParticipantRow {
  const db = getDb();
  const trimmed = name.trim();
  const key = nameKey(trimmed);

  if (db.prepare("SELECT 1 AS ok FROM participant WHERE name_key = ?").get(key) !== undefined) {
    throw new DuplicateNameError();
  }

  const token = generateToken();

  db.exec("BEGIN IMMEDIATE;");
  try {
    const info = db
      .prepare("INSERT INTO participant (name, name_key, token) VALUES (?, ?, ?)")
      .run(trimmed, key, token);
    const id = Number(info.lastInsertRowid);
    addExclusions(db, id, excludedIds);
    db.exec("COMMIT;");
    return { id, name: trimmed, token };
  } catch (err) {
    db.exec("ROLLBACK;");
    if (err instanceof Error && /participant\.name_key/.test(err.message)) {
      throw new DuplicateNameError();
    }
    throw err;
  }
}

export function setExclusions(participantId: number, excludedIds: number[]): void {
  const db = getDb();
  db.exec("BEGIN IMMEDIATE;");
  try {
    db.prepare("DELETE FROM exclusion WHERE participant_id = ?").run(participantId);
    addExclusions(db, participantId, excludedIds);
    db.exec("COMMIT;");
  } catch (err) {
    db.exec("ROLLBACK;");
    throw err;
  }
}

export function getMatch(participantId: number): { id: number; name: string } | null {
  const row = getDb()
    .prepare(
      `SELECT p.id AS id, p.name AS name
       FROM assignment a
       JOIN participant p ON p.id = a.receiver_id
       WHERE a.giver_id = ?`
    )
    .get(participantId) as unknown as { id: number; name: string } | undefined;
  return row ? { id: row.id, name: row.name } : null;
}

export function getAssignablePeople(): { id: number; excluded: Set<number> }[] {
  const db = getDb();
  const participants = listParticipants();
  const stmt = db.prepare("SELECT excluded_id AS id FROM exclusion WHERE participant_id = ?");
  return participants.map((p) => {
    const rows = stmt.all(p.id) as unknown as { id: number }[];
    return { id: p.id, excluded: new Set(rows.map((r) => r.id)) };
  });
}

export function storeAssignments(pairs: Map<number, number>): void {
  const db = getDb();
  db.exec("BEGIN IMMEDIATE;");
  try {
    const ins = db.prepare("INSERT INTO assignment (giver_id, receiver_id) VALUES (?, ?)");
    for (const [giver, receiver] of pairs) {
      ins.run(giver, receiver);
    }
    db.exec("COMMIT;");
  } catch (err) {
    db.exec("ROLLBACK;");
    throw err;
  }
}

export function clearAssignments(): void {
  getDb().exec("DELETE FROM assignment;");
}

export function deleteParticipant(id: number): void {
  const db = getDb();
  db.exec("BEGIN IMMEDIATE;");
  try {
    db.prepare("DELETE FROM assignment WHERE giver_id = ? OR receiver_id = ?").run(id, id);
    db.prepare("DELETE FROM exclusion WHERE participant_id = ? OR excluded_id = ?").run(id, id);
    db.prepare("DELETE FROM participant WHERE id = ?").run(id);
    db.exec("COMMIT;");
  } catch (err) {
    db.exec("ROLLBACK;");
    throw err;
  }
}

export function getAdminState(): AdminState {
  const db = getDb();
  const participants = db
    .prepare("SELECT id, name, token FROM participant ORDER BY id")
    .all() as unknown as ParticipantRow[];

  const assignments = db
    .prepare(
      `SELECT a.giver_id AS giverId, a.receiver_id AS receiverId,
              g.name AS giverName, r.name AS receiverName
       FROM assignment a
       JOIN participant g ON g.id = a.giver_id
       JOIN participant r ON r.id = a.receiver_id
       ORDER BY g.name COLLATE NOCASE`
    )
    .all() as unknown as AdminAssignment[];

  const matchById = new Map<number, string>();
  for (const a of assignments) matchById.set(a.giverId, a.receiverName);

  return {
    drawn: assignments.length > 0,
    participants: participants.map((p) => ({
      id: p.id,
      name: p.name,
      token: p.token,
      exclusions: getExclusionsDetailed(p.id),
      matchName: matchById.get(p.id) ?? null,
    })),
    assignments: assignments.map((a) => ({ ...a })),
  };
}
