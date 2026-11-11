import { timingSafeEqual } from "node:crypto";

/**
 * The admin endpoints are protected by a shared secret (the ADMIN_SECRET env
 * variable), sent by the admin UI in the `x-admin-secret` header. We compare
 * with a constant-time function to avoid leaking the secret length/timing.
 */
export function isAdminAuthorized(request: Request): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;

  const header = request.headers.get("x-admin-secret");
  if (!header) return false;

  const a = Buffer.from(header);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}
