import { z } from "zod";
import { toolResult, wrapHandler } from "../lib/errors.js";
import {
  findApplication,
  findAsset,
  findProtocol,
  getAssets,
} from "../lib/registry.js";

function resolveApp(appId) {
  const app = findApplication(appId);
  if (!app) {
    return {
      appId,
      known: false,
      message: `Application ${appId} is not in the Voi ecosystem registry`,
    };
  }
  const protocol = app.protocol ? findProtocol(app.protocol) : null;
  return {
    appId,
    known: true,
    name: app.name,
    protocol: app.protocol,
    protocolName: protocol?.name || null,
    type: app.type,
    role: app.role,
    description: app.description,
    tokens: app.tokens || null,
  };
}

export function registerIdentifyTools(server) {
  server.tool(
    "identify_application",
    "Identify a Voi application by ID — returns protocol, role, type, and description if known",
    {
      appId: z
        .number()
        .int()
        .describe("Application ID on Voi"),
    },
    wrapHandler(async ({ appId }) => {
      return toolResult(resolveApp(appId));
    }),
  );

  server.tool(
    "identify_asset",
    "Identify a Voi asset by ID — returns name, symbol, type, protocol, and category if known",
    {
      assetId: z
        .number()
        .int()
        .describe("Asset or ARC-200 contract ID on Voi"),
    },
    wrapHandler(async ({ assetId }) => {
      const asset = findAsset(assetId);
      if (!asset) {
        return toolResult({
          assetId,
          known: false,
          message: `Asset ${assetId} is not in the Voi ecosystem registry`,
        });
      }
      const protocol = asset.protocol ? findProtocol(asset.protocol) : null;
      return toolResult({
        assetId,
        known: true,
        name: asset.name,
        symbol: asset.symbol,
        decimals: asset.decimals,
        type: asset.type,
        protocol: asset.protocol,
        protocolName: protocol?.name || null,
        category: asset.category,
        description: asset.description,
        verified: asset.verified,
      });
    }),
  );

  server.tool(
    "get_contract_role",
    "Get the role and purpose of a specific contract on Voi (e.g. liquidity-pool, bridge, registry)",
    {
      appId: z
        .number()
        .int()
        .describe("Application ID on Voi"),
    },
    wrapHandler(async ({ appId }) => {
      const resolved = resolveApp(appId);
      if (!resolved.known) {
        resolved.role = null;
      }
      return toolResult(resolved);
    }),
  );

  server.tool(
    "search_assets",
    "Search known Voi assets by symbol, category, or protocol",
    {
      symbol: z
        .string()
        .optional()
        .describe("Filter by token symbol (e.g. VOI, USDC, SHELLY)"),
      category: z
        .string()
        .optional()
        .describe("Filter by category (e.g. native, bridged-token, community-token, stablecoin, liquid-staking)"),
      protocol: z
        .string()
        .optional()
        .describe("Filter by protocol ID (e.g. aramid-bridge, dorkfi)"),
      verified: z
        .boolean()
        .optional()
        .describe("Filter by verification status"),
    },
    wrapHandler(async ({ symbol, category, protocol, verified }) => {
      const all = getAssets();
      const results = [];
      for (const [assetId, info] of Object.entries(all)) {
        if (symbol && info.symbol?.toLowerCase() !== symbol.toLowerCase()) continue;
        if (category && info.category !== category) continue;
        if (protocol && info.protocol !== protocol) continue;
        if (verified !== undefined && info.verified !== verified) continue;
        results.push({
          assetId: Number(assetId),
          name: info.name,
          symbol: info.symbol,
          decimals: info.decimals,
          type: info.type,
          protocol: info.protocol,
          category: info.category,
          verified: info.verified,
        });
      }
      return toolResult({ results, totalCount: results.length });
    }),
  );
}
