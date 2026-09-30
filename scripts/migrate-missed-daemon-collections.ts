import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { NedbClient } from "nedb-engine-client";
import { NedbCore } from "nedb-engine";

type JsonObject = Record<string, unknown>;

interface Args {
  dryRun: boolean;
  overwrite: boolean;
  sourceUrl: string;
  sourceDb: string;
  sourceToken?: string;
  destPath: string;
  pageSize: number;
}

const MISSED_COLLECTIONS = [
  "entitlements",
  "raffles",
  "raffle_entries",
  "payments",
  "purchases",
  "hireme_bookings",
] as const;

// Collections already copied by the first migration. This recovery tool must
// never touch them.
const ALREADY_MIGRATED = new Set([
  "accounts",
  "challenges",
  "events",
  "grants",
  "handles",
  "identities",
  "sessions",
]);

const ENGINE_FIELDS = new Set([
  "_id",
  "_hash",
  "_seq",
  "_tx_from",
  "_tx_to",
  "_valid_from",
  "_valid_to",
  "_caused_by",
  "_evidence",
  "_confidence",
]);

function parseArgs(argv: string[]): Args {
  const pick = (name: string): string | undefined => {
    const prefix = `--${name}=`;
    const inline = argv.find((arg) => arg.startsWith(prefix));
    if (inline) return inline.slice(prefix.length);
    const index = argv.indexOf(`--${name}`);
    return index >= 0 ? argv[index + 1] : undefined;
  };

  const sourceDb =
    pick("source-db") ||
    process.env.MIGRATE_SOURCE_DB ||
    process.env.NEDB_DB ||
    "links";

  const destPath = resolve(
    pick("dest") ||
      process.env.MIGRATE_NEDB_PATH ||
      process.env.NEDB_PATH ||
      resolve(process.cwd(), ".data", sourceDb),
  );

  const pageSize = Number(
    pick("page-size") || process.env.MIGRATE_PAGE_SIZE || 500,
  );

  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 10_000) {
    throw new Error("--page-size must be an integer between 1 and 10000");
  }

  return {
    dryRun: argv.includes("--dry-run"),
    overwrite: argv.includes("--overwrite"),
    sourceUrl:
      pick("source-url") ||
      process.env.MIGRATE_SOURCE_URL ||
      process.env.NEDB_URL ||
      "http://127.0.0.1:7070",
    sourceDb,
    sourceToken:
      pick("source-token") ||
      process.env.MIGRATE_SOURCE_TOKEN ||
      process.env.NEDB_TOKEN ||
      undefined,
    destPath,
    pageSize,
  };
}

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;

  if (value && typeof value === "object") {
    const obj = value as JsonObject;
    return `{${Object.keys(obj)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stable(obj[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function logicalDocument(row: JsonObject): JsonObject {
  const out: JsonObject = {};
  for (const [key, value] of Object.entries(row)) {
    if (!ENGINE_FIELDS.has(key)) out[key] = value;
  }
  return out;
}

function rowId(row: JsonObject): string {
  const id = row._id;
  if (typeof id !== "string" || !id) {
    throw new Error(
      `source row is missing a string _id: ${JSON.stringify(row)}`,
    );
  }
  return id;
}

function parseEmbedded(value: string | null): JsonObject | null {
  return value === null ? null : (JSON.parse(value) as JsonObject);
}

async function readCollection(
  client: NedbClient,
  collection: string,
  pageSize: number,
): Promise<JsonObject[]> {
  if (ALREADY_MIGRATED.has(collection)) {
    throw new Error(
      `refusing to touch already-migrated collection: ${collection}`,
    );
  }

  const rows: JsonObject[] = [];

  for (let offset = 0; ; offset += pageSize) {
    const page = await client.query(
      `FROM ${collection} LIMIT ${pageSize} OFFSET ${offset}`,
    );

    rows.push(...page);

    if (page.length < pageSize) break;
  }

  return rows;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  console.log("⬡ NEDB missed-collection recovery");
  console.log(`  source: ${args.sourceUrl} / ${args.sourceDb}`);
  console.log(`  dest:   ${args.destPath}`);
  console.log(
    `  mode:   ${
      args.dryRun
        ? "DRY RUN"
        : args.overwrite
          ? "write + overwrite conflicts"
          : "write + refuse conflicts"
    }`,
  );
  console.log(`  scope:  ${MISSED_COLLECTIONS.join(", ")}`);

  const client = new NedbClient({
    url: args.sourceUrl,
    db: args.sourceDb,
    token: args.sourceToken,
    autoCreate: false,
    readTimeoutMs: 30_000,
    writeTimeoutMs: 30_000,
  });

  if (!(await client.ping())) {
    throw new Error(
      `source daemon is not reachable at ${args.sourceUrl}`,
    );
  }

  const sourceRows = new Map<string, JsonObject[]>();

  for (const collection of MISSED_COLLECTIONS) {
    const rows = await readCollection(client, collection, args.pageSize);
    sourceRows.set(collection, rows);
    console.log(`  read ${collection}: ${rows.length}`);
  }

  const totalRead = [...sourceRows.values()].reduce(
    (sum, rows) => sum + rows.length,
    0,
  );

  if (args.dryRun) {
    console.log("");
    console.log(
      `✓ dry run complete: ${totalRead} missed rows readable; destination untouched`,
    );
    return;
  }

  mkdirSync(args.destPath, { recursive: true });
  const engine = NedbCore.open(args.destPath);

  let inserted = 0;
  let identical = 0;
  let overwritten = 0;

  try {
    for (const [collection, rows] of sourceRows) {
      for (const row of rows) {
        const id = rowId(row);
        const incoming = logicalDocument(row);
        const existingRaw = parseEmbedded(engine.get(collection, id));
        const existing = existingRaw
          ? logicalDocument(existingRaw)
          : null;

        if (existing && stable(existing) === stable(incoming)) {
          identical += 1;
          continue;
        }

        if (existing && !args.overwrite) {
          throw new Error(
            [
              `conflict at ${collection}/${id}`,
              "destination already contains a different document",
              "re-run with --overwrite only after reviewing the conflict",
            ].join(": "),
          );
        }

        engine.putEx(collection, id, JSON.stringify(incoming));

        if (existing) overwritten += 1;
        else inserted += 1;
      }
    }

    engine.flush();

    let verified = 0;

    for (const [collection, rows] of sourceRows) {
      for (const sourceRow of rows) {
        const id = rowId(sourceRow);
        const destRaw = parseEmbedded(engine.get(collection, id));

        if (!destRaw) {
          throw new Error(
            `verification failed: missing ${collection}/${id}`,
          );
        }

        if (
          stable(logicalDocument(sourceRow)) !==
          stable(logicalDocument(destRaw))
        ) {
          throw new Error(
            `verification failed: content mismatch at ${collection}/${id}`,
          );
        }

        verified += 1;
      }
    }

    if (!engine.verify()) {
      throw new Error("embedded engine verify() failed after recovery");
    }

    console.log("");
    console.log("✓ missed-collection recovery complete");
    console.log(`  verified:   ${verified}/${totalRead}`);
    console.log(`  inserted:   ${inserted}`);
    console.log(`  identical:  ${identical}`);
    console.log(`  overwritten:${overwritten}`);
    console.log(`  embedded seq:  ${engine.seq().toString()}`);
    console.log(`  embedded head: ${engine.head()}`);
  } finally {
    engine.flush();
  }
}

main().catch((error) => {
  console.error("");
  console.error("✗ missed-collection recovery failed");
  console.error(
    error instanceof Error ? error.stack ?? error.message : error,
  );
  process.exitCode = 1;
});
