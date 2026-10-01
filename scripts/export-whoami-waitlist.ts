import { db } from "../src/server/db";

const rows = await db.query("FROM whoami_waitlist");
const safe = rows.map((row) => ({
  email: row.email,
  role: row.role,
  sources: row.sources,
  firstSeenAt: row.firstSeenAt,
  updatedAt: row.updatedAt,
  status: row.status,
}));

process.stdout.write(JSON.stringify({
  exportedAt: new Date().toISOString(),
  count: safe.length,
  entries: safe,
}, null, 2) + "\n");
