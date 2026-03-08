import { z } from "zod";
import { toolResult, toolError } from "../lib/errors.js";
import { findApplication, findAsset, findProtocol } from "../lib/registry.js";

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
    async ({ appId }) => {
      const app = findApplication(appId);
      if (!app) {
        return toolResult({
          appId,
          known: false,
          message: `Application ${appId} is not in the Voi ecosystem registry`,
        });
      }
      const protocol = app.protocol ? findProtocol(app.protocol) : null;
      return toolResult({
        appId,
        known: true,
        name: app.name,
        protocol: app.protocol,
        protocolName: protocol?.name || null,
        type: app.type,
        role: app.role,
        description: app.description,
        tokens: app.tokens || null,
      });
    },
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
    async ({ assetId }) => {
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
    },
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
    async ({ appId }) => {
      const app = findApplication(appId);
      if (!app) {
        return toolResult({
          appId,
          known: false,
          role: null,
          message: `Contract ${appId} is not in the Voi ecosystem registry`,
        });
      }
      const protocol = app.protocol ? findProtocol(app.protocol) : null;
      return toolResult({
        appId,
        known: true,
        role: app.role,
        type: app.type,
        name: app.name,
        protocol: app.protocol,
        protocolName: protocol?.name || null,
        description: app.description,
      });
    },
  );
}
