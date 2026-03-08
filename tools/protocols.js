import { z } from "zod";
import { toolResult, toolError } from "../lib/errors.js";
import {
  getProtocols,
  findProtocol,
  protocolContracts,
  protocolAssets,
} from "../lib/registry.js";

export function registerProtocolTools(server) {
  server.tool(
    "get_protocols",
    "List all known Voi ecosystem protocols with type and description",
    {
      type: z
        .string()
        .optional()
        .describe("Filter by protocol type (dex, bridge, naming-service, nft-marketplace, etc.)"),
    },
    async ({ type }) => {
      let list = getProtocols();
      if (type) {
        list = list.filter((p) => p.type === type);
      }
      return toolResult(
        list.map((p) => ({
          id: p.id,
          name: p.name,
          type: p.type,
          description: p.description,
          website: p.website,
          tags: p.tags,
        })),
      );
    },
  );

  server.tool(
    "get_protocol",
    "Get detailed information about a specific Voi ecosystem protocol by ID",
    {
      protocolId: z
        .string()
        .describe("Protocol identifier (e.g. humble-swap, envoi, aramid-bridge)"),
    },
    async ({ protocolId }) => {
      const protocol = findProtocol(protocolId);
      if (!protocol) {
        return toolError(`Unknown protocol: ${protocolId}`);
      }
      return toolResult(protocol);
    },
  );

  server.tool(
    "get_protocol_contracts",
    "List all known application contracts for a Voi protocol",
    {
      protocolId: z
        .string()
        .describe("Protocol identifier (e.g. humble-swap, envoi, aramid-bridge)"),
    },
    async ({ protocolId }) => {
      const protocol = findProtocol(protocolId);
      if (!protocol) {
        return toolError(`Unknown protocol: ${protocolId}`);
      }
      const contracts = protocolContracts(protocolId);
      const assets = protocolAssets(protocolId);
      return toolResult({
        protocol: protocolId,
        name: protocol.name,
        contracts,
        assets,
      });
    },
  );

  server.tool(
    "get_protocol_summary",
    "Get a human-readable summary of a Voi protocol including its purpose, contracts, and assets",
    {
      protocolId: z
        .string()
        .describe("Protocol identifier (e.g. humble-swap, envoi, aramid-bridge)"),
    },
    async ({ protocolId }) => {
      const protocol = findProtocol(protocolId);
      if (!protocol) {
        return toolError(`Unknown protocol: ${protocolId}`);
      }
      const contracts = protocolContracts(protocolId);
      const assets = protocolAssets(protocolId);

      const lines = [
        `# ${protocol.name}`,
        ``,
        `**Type:** ${protocol.type}`,
        `**Website:** ${protocol.website || "N/A"}`,
        ``,
        protocol.description,
        ``,
        `## Contracts (${contracts.length})`,
      ];

      const byType = {};
      for (const c of contracts) {
        const t = c.type || "other";
        if (!byType[t]) byType[t] = [];
        byType[t].push(c);
      }
      for (const [type, items] of Object.entries(byType)) {
        lines.push(`- **${type}**: ${items.length} contract(s)`);
        for (const item of items.slice(0, 5)) {
          lines.push(`  - ${item.appId}: ${item.name}`);
        }
        if (items.length > 5) {
          lines.push(`  - ... and ${items.length - 5} more`);
        }
      }

      if (assets.length > 0) {
        lines.push(``, `## Assets (${assets.length})`);
        for (const a of assets) {
          lines.push(`- ${a.symbol} (${a.assetId}): ${a.name} — ${a.category}`);
        }
      }

      lines.push(``, `**Tags:** ${(protocol.tags || []).join(", ")}`);

      return { content: [{ type: "text", text: lines.join("\n") }] };
    },
  );
}
