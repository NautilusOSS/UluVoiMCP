import { z } from "zod";
import { toolResult, wrapHandler } from "../lib/errors.js";
import { getNames, getReverseNames } from "../lib/registry.js";

const DEFAULT_LIMIT = 50;

function normalize(name) {
  let n = name.toLowerCase().trim();
  if (!n.endsWith(".voi")) n += ".voi";
  return n;
}

export function registerNameTools(server) {
  server.tool(
    "resolve_name",
    "Resolve an enVoi name (e.g. 'shelly.voi') to its address and metadata from the static registry. For live resolution, use UluCoreMCP's envoi tools.",
    {
      name: z
        .string()
        .describe("enVoi name to resolve (e.g. 'shelly.voi')"),
    },
    wrapHandler(async ({ name }) => {
      const normalized = normalize(name);
      const registry = getNames();
      const entry = registry.names[normalized];
      if (!entry) {
        return toolResult({
          name: normalized,
          found: false,
          message: `Name '${normalized}' is not in the static registry. Use UluCoreMCP envoi_resolve_address for live resolution.`,
        });
      }
      return toolResult({
        name: normalized,
        found: true,
        address: entry.address || null,
        description: entry.description || null,
        metadata: entry.metadata || {},
        source: "static-registry",
      });
    }),
  );

  server.tool(
    "reverse_resolve_address",
    "Look up well-known enVoi names associated with a Voi address from the static registry. For live resolution, use UluCoreMCP's envoi tools.",
    {
      address: z
        .string()
        .describe("Voi wallet address to reverse-resolve"),
    },
    wrapHandler(async ({ address }) => {
      const reverse = getReverseNames();
      const entries = reverse[address];
      if (!entries || entries.length === 0) {
        return toolResult({
          address,
          found: false,
          results: [],
          message: `No static registry entries for ${address}. Use UluCoreMCP envoi_resolve_name for live resolution.`,
        });
      }
      return toolResult({
        address,
        found: true,
        results: entries.map((e) => ({
          name: e.name,
          description: e.description || null,
        })),
        source: "static-registry",
      });
    }),
  );

  server.tool(
    "search_names",
    "Search the static enVoi name registry by pattern. For live search, use UluCoreMCP's envoi tools.",
    {
      pattern: z
        .string()
        .describe("Search pattern (substring match against registered names)"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(200)
        .optional()
        .describe(`Maximum results to return (default ${DEFAULT_LIMIT}, max 200)`),
    },
    wrapHandler(async ({ pattern, limit }) => {
      const cap = limit ?? DEFAULT_LIMIT;
      const registry = getNames();
      const lower = pattern.toLowerCase();
      const results = [];
      for (const [name, entry] of Object.entries(registry.names)) {
        if (name.includes(lower)) {
          results.push({
            name,
            address: entry.address || null,
            description: entry.description || null,
          });
          if (results.length >= cap) break;
        }
      }
      return toolResult({
        pattern,
        results,
        totalCount: results.length,
        limited: results.length >= cap,
        source: "static-registry",
        note: results.length === 0
          ? "No matches in static registry. Use UluCoreMCP envoi_search for live search."
          : undefined,
      });
    }),
  );
}
