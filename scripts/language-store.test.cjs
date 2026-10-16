const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

const source = ts.transpileModule(fs.readFileSync("app/lib/use-language.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;

function createStore(values = {}, blocked = false) {
  const storage = new Map(Object.entries(values));
  const window = new EventTarget();
  const testModule = { exports: {} };
  const context = {
    module: testModule, exports: testModule.exports, window, CustomEvent,
    localStorage: {
      getItem: key => { if (blocked) throw new Error("Storage blocked"); return storage.get(key) ?? null; },
      setItem: (key, value) => { if (blocked) throw new Error("Storage blocked"); storage.set(key, value); },
    },
    require: name => {
      if (name === "./localized-path") return {};
      if (name === "next/navigation") return { usePathname: () => "/" };
      assert.equal(name, "react");
      return { useSyncExternalStore: (subscribe, read, server) => ({ subscribe, read, server }) };
    },
  };
  vm.runInNewContext(source, context);
  return { ...testModule.exports, ...testModule.exports.useLanguage(), window, storage };
}

test("server snapshot stays Vietnamese while saved English is loaded on client", () => {
  const store = createStore({ "huyen-language": "en" });
  assert.equal(store.server(), "vi");
  assert.equal(store.read(), "en");
});

test("language setter persists both keys and notifies all consumers", () => {
  const store = createStore();
  let notifications = 0;
  const stop = store.subscribe(() => notifications++);
  store.setLanguage("en");
  assert.equal(store.read(), "en");
  assert.equal(store.storage.get("huyen-language"), "en");
  assert.equal(store.storage.get("language"), "en");
  assert.equal(notifications, 1);
  stop();
  store.setLanguage("vi");
  assert.equal(notifications, 1);
});

test("legacy events and cross-tab storage updates synchronize the snapshot", () => {
  const store = createStore({ language: "en" });
  assert.equal(store.read(), "en");
  const stop = store.subscribe(() => {});
  store.window.dispatchEvent(new CustomEvent("language-change", { detail: "vi" }));
  assert.equal(store.read(), "vi");
  store.storage.set("huyen-language", "en");
  const event = new Event("storage");
  Object.defineProperty(event, "key", { value: "huyen-language" });
  store.window.dispatchEvent(event);
  assert.equal(store.read(), "en");
  stop();
});

test("switching still works when browser storage is blocked", () => {
  const store = createStore({}, true);
  assert.equal(store.read(), "vi");
  const stop = store.subscribe(() => {});
  assert.doesNotThrow(() => store.setLanguage("en"));
  assert.equal(store.read(), "en");
  stop();
});

test("storage changes between page subscriptions do not reuse a stale language", () => {
  const store = createStore();
  const stop = store.subscribe(() => {});
  store.setLanguage("vi");
  stop();
  store.storage.set("huyen-language", "en");
  assert.equal(store.read(), "en");
});
