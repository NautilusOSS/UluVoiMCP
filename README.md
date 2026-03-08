# ulu-voi-mcp

Voi ecosystem MCP server. Returns **meaning**, not raw chain data.

## Architecture

```
UluCoreMCP      → chain primitives (blocks, accounts, transactions)
UluVoiMCP       → Voi ecosystem meaning (protocols, identity, naming)
UluWalletMCP    → signing
UluBroadcastMCP → broadcasting
```

Core returns facts. Voi returns meaning.

## Tools

| Tool | Description |
|------|-------------|
| `get_protocols` | List all known Voi protocols, optionally filtered by type |
| `get_protocol` | Get detailed info about a specific protocol |
| `get_protocol_contracts` | List all contracts and assets for a protocol |
| `get_protocol_summary` | Human-readable protocol summary |
| `identify_application` | Identify what a Voi application ID is |
| `identify_asset` | Identify what a Voi asset ID is |
| `get_contract_role` | Get the role and purpose of a contract |
| `resolve_name` | Resolve an enVoi name from static registry |
| `reverse_resolve_address` | Reverse-resolve an address to known names |
| `search_names` | Search the name registry by pattern |

## Data Model

Curated registry files in `data/`:

- `protocols.json` — protocol definitions (HumbleSwap, Nomadex, enVoi, Aramid, etc.)
- `applications.json` — application ID → protocol, role, type mapping
- `assets.json` — asset ID → name, symbol, category, protocol mapping
- `names.json` — static well-known enVoi names

All registries are static JSON loaded at startup. For live data, use UluCoreMCP.

## Setup

```bash
npm install
```

## Usage

```bash
node index.js
```

## Client Configuration

```json
{
  "mcpServers": {
    "ulu-voi-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/ulu-voi-mcp/index.js"]
    }
  }
}
```

## Protocols Covered

- **HumbleSwap** — DEX (AMM pools)
- **Nomadex** — DEX
- **SnowballSwap** — DEX aggregator
- **enVoi** — naming service
- **Nautilus** — NFT marketplace
- **HighForge** — NFT minting
- **Aramid Bridge** — cross-chain bridge
- **Kibisis** — browser wallet
- **Voi Network** — L1 blockchain

## Naming Resolution

Static registry approach. The `names.json` file contains well-known enVoi names. For live resolution (on-chain lookups), use UluCoreMCP's `envoi_resolve_address`, `envoi_resolve_name`, and `envoi_search` tools.

## Limitations

- Registries are static and curated — not all applications or assets are covered
- Name resolution is from a static registry, not live on-chain lookups
- No write operations — this is a read-only meaning layer
- Pool list may become stale as new pools are created
- Community tokens marked unverified may change status
