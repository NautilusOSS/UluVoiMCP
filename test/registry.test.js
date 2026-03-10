import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getProtocols,
  getApplications,
  getAssets,
  getNames,
  getReverseNames,
  findProtocol,
  findApplication,
  findAsset,
  protocolContracts,
  protocolAssets,
} from "../lib/registry.js";

describe("data loading", () => {
  it("loads protocols as a non-empty array", () => {
    const p = getProtocols();
    assert.ok(Array.isArray(p));
    assert.ok(p.length > 0);
  });

  it("loads applications as a non-empty object", () => {
    const a = getApplications();
    assert.ok(typeof a === "object" && a !== null);
    assert.ok(Object.keys(a).length > 0);
  });

  it("loads assets as a non-empty object", () => {
    const a = getAssets();
    assert.ok(typeof a === "object" && a !== null);
    assert.ok(Object.keys(a).length > 0);
  });

  it("loads names with meta and names fields", () => {
    const n = getNames();
    assert.ok(n.meta);
    assert.ok(n.names);
    assert.ok(typeof n.names === "object");
  });
});

describe("protocol lookups", () => {
  it("every protocol has required fields", () => {
    for (const p of getProtocols()) {
      assert.ok(p.id, `protocol missing id`);
      assert.ok(p.name, `${p.id} missing name`);
      assert.ok(p.type, `${p.id} missing type`);
      assert.ok(p.description, `${p.id} missing description`);
    }
  });

  it("findProtocol returns known protocol", () => {
    const p = findProtocol("humble-swap");
    assert.ok(p);
    assert.equal(p.name, "HumbleSwap");
  });

  it("findProtocol returns null for unknown", () => {
    assert.equal(findProtocol("nonexistent"), null);
  });
});

describe("application lookups", () => {
  it("every application has protocol, type, and role", () => {
    const apps = getApplications();
    for (const [id, app] of Object.entries(apps)) {
      assert.ok(app.name, `app ${id} missing name`);
      assert.ok(app.type, `app ${id} missing type`);
      assert.ok(app.role, `app ${id} missing role`);
    }
  });

  it("findApplication returns known app", () => {
    const app = findApplication(797609);
    assert.ok(app);
    assert.equal(app.protocol, "envoi");
  });

  it("findApplication returns null for unknown", () => {
    assert.equal(findApplication(999999999), null);
  });

  it("every app.protocol references a valid protocol", () => {
    const apps = getApplications();
    for (const [id, app] of Object.entries(apps)) {
      if (app.protocol) {
        assert.ok(
          findProtocol(app.protocol),
          `app ${id} references unknown protocol '${app.protocol}'`,
        );
      }
    }
  });
});

describe("asset lookups", () => {
  it("every asset has required fields", () => {
    const assets = getAssets();
    for (const [id, a] of Object.entries(assets)) {
      assert.ok(a.name, `asset ${id} missing name`);
      assert.ok(a.symbol, `asset ${id} missing symbol`);
      assert.ok(typeof a.decimals === "number", `asset ${id} missing decimals`);
      assert.ok(a.type, `asset ${id} missing type`);
      assert.ok(a.category, `asset ${id} missing category`);
    }
  });

  it("findAsset returns known asset", () => {
    const a = findAsset(0);
    assert.ok(a);
    assert.equal(a.symbol, "VOI");
  });

  it("findAsset returns null for unknown", () => {
    assert.equal(findAsset(999999999), null);
  });

  it("every asset.protocol references a valid protocol", () => {
    const assets = getAssets();
    for (const [id, a] of Object.entries(assets)) {
      if (a.protocol) {
        assert.ok(
          findProtocol(a.protocol),
          `asset ${id} references unknown protocol '${a.protocol}'`,
        );
      }
    }
  });
});

describe("cross-registry queries", () => {
  it("protocolContracts returns results for humble-swap", () => {
    const contracts = protocolContracts("humble-swap");
    assert.ok(contracts.length > 0);
    for (const c of contracts) {
      assert.equal(c.protocol, "humble-swap");
      assert.ok(typeof c.appId === "number");
    }
  });

  it("protocolAssets returns results for aramid-bridge", () => {
    const assets = protocolAssets("aramid-bridge");
    assert.ok(assets.length > 0);
    for (const a of assets) {
      assert.equal(a.protocol, "aramid-bridge");
    }
  });

  it("protocolContracts returns empty for unknown protocol", () => {
    assert.deepEqual(protocolContracts("nonexistent"), []);
  });
});

describe("name lookups", () => {
  it("every name entry has an address", () => {
    const registry = getNames();
    for (const [name, entry] of Object.entries(registry.names)) {
      assert.ok(entry.address, `name '${name}' missing address`);
    }
  });

  it("reverse names index is consistent", () => {
    const reverse = getReverseNames();
    const registry = getNames();
    for (const [addr, entries] of Object.entries(reverse)) {
      for (const e of entries) {
        assert.ok(registry.names[e.name], `reverse index has '${e.name}' not in names`);
        assert.equal(registry.names[e.name].address, addr);
      }
    }
  });
});
