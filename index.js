import { readFileSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerProtocolTools } from "./tools/protocols.js";
import { registerIdentifyTools } from "./tools/identify.js";
import { registerNameTools } from "./tools/names.js";

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf-8"),
);

const server = new McpServer({
  name: pkg.name,
  version: pkg.version,
});

registerProtocolTools(server);
registerIdentifyTools(server);
registerNameTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
