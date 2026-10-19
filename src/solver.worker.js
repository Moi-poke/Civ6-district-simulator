import { optimize } from "./rules.js";

// Vite worker (?worker import): runs optimize off the main thread.
self.onmessage = (e) => {
  const { baseMap, rivers, list, budget } = e.data;
  try {
    const sol = optimize(baseMap, { set: new Set(rivers), comp: buildComp(rivers) }, list, budget);
    self.postMessage({ ok: true, sol });
  } catch (err) {
    self.postMessage({ ok: false, error: String(err && err.message || err) });
  }
};

// Minimal comp map: solver only needs `set` for placement checks that run here;
// riverIdsOf (dam rule) uses comp — rebuild cheaply. Import lazily to avoid cycles.
import { EDGE_BY_KEY } from "./rules.js";
function buildComp(list) {
  const parent = {};
  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  list.forEach((k) => (parent[k] = k));
  const byVertex = {};
  list.forEach((k) => {
    const e = EDGE_BY_KEY[k];
    if (!e) return;
    [e.p1, e.p2].forEach((p) => {
      const vk = `${Math.round(p.x)},${Math.round(p.y)}`;
      (byVertex[vk] ||= []).push(k);
    });
  });
  Object.values(byVertex).forEach((ks) => ks.slice(1).forEach((k) => (parent[find(k)] = find(ks[0]))));
  const comp = {};
  list.forEach((k) => (comp[k] = find(k)));
  return comp;
}
