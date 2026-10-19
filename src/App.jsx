import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Lightbulb, Trophy, CheckCircle2, Info, ChevronRight, Waves, AlertTriangle, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/* =========================================================
   データ定義（Gathering Storm 標準ルール / 文明固有能力なし）
   ========================================================= */
const TERRAIN = {
  grass: { label: "草原", short: "草", color: "#a3d977", land: true },
  plains: { label: "平原", short: "平", color: "#d9d28a", land: true },
  desert: { label: "砂漠", short: "砂", color: "#f3e3a2", land: true },
  hills: { label: "丘陵", short: "丘", color: "#b9935a", land: true },
  flood: { label: "氾濫原", short: "氾", color: "#c9e6a0", land: true },
  mountain: { label: "山岳", short: "山", color: "#78716c", land: true },
  coast: { label: "沿岸", short: "海", color: "#38bdf8", land: false },
  lake: { label: "湖", short: "湖", color: "#60a5fa", land: false },
};
const FEATURES = {
  woods: { label: "森", short: "森" },
  rainforest: { label: "熱帯雨林", short: "雨" },
  marsh: { label: "湿原", short: "湿" },
  oasis: { label: "オアシス", short: "オ" },
  geothermal: { label: "地熱孔", short: "熱" },
  reef: { label: "礁", short: "礁" },
  natural_wonder: { label: "自然遺産", short: "自" },
};
const EXTRAS = {
  mine: { label: "鉱山", short: "鉱" },
  quarry: { label: "採石場", short: "石" },
  strategic: { label: "戦略資源（未改善）", short: "戦" },
  strategic_mine: { label: "戦略資源＋鉱山", short: "戦鉱" },
  luxury: { label: "高級資源", short: "高" },
  sea: { label: "海洋資源", short: "魚" },
  lumber_mill: { label: "製材所", short: "材" },
};
const DISTRICTS = {
  city: { label: "都心", short: "都", color: "#fde68a" },
  campus: { label: "キャンパス", short: "科", color: "#60a5fa" },
  holy_site: { label: "聖地", short: "聖", color: "#c4b5fd" },
  commercial: { label: "商業ハブ", short: "商", color: "#fbbf24" },
  harbor: { label: "港", short: "港", color: "#0ea5e9" },
  industrial: { label: "工業地帯", short: "工", color: "#f97316" },
  theater: { label: "劇場広場", short: "劇", color: "#f472b6" },
  government: { label: "政府複合施設", short: "政", color: "#c084fc" },
  aqueduct: { label: "用水路", short: "水", color: "#a5f3fc" },
  dam: { label: "ダム", short: "堰", color: "#67e8f9" },
  entertainment: { label: "娯楽複合施設", short: "娯", color: "#fb7185" },
  water_park: { label: "ウォーターパーク", short: "水楽", color: "#38bdf8" },
  canal: { label: "運河", short: "運", color: "#22d3ee" },
  wonder: { label: "遺産", short: "遺", color: "#facc15" },
};
const SCORED = new Set(["campus", "holy_site", "commercial", "harbor", "industrial", "theater"]);
const COUNTS_AS_DISTRICT = new Set(["city", "campus", "holy_site", "commercial", "harbor", "industrial", "theater", "government", "aqueduct", "dam", "entertainment", "water_park", "canal", "encampment"]);
const ONE_PER_CITY = new Set(["campus", "holy_site", "commercial", "harbor", "industrial", "theater", "aqueduct", "entertainment", "water_park"]);
const REMOVABLE_EXTRAS = new Set(["mine", "quarry", "sea", "lumber_mill"]);
const REMOVABLE_FEATURES = new Set(["woods", "rainforest", "marsh"]);
const NON_SPECIALTY = new Set(["aqueduct", "dam", "canal", "spaceport", "neighborhood"]);
const isSpecialty = (d) => !!d && d !== "city" && d !== "wonder" && !NON_SPECIALTY.has(d);

/* =========================================================
   ヘクス幾何
   ========================================================= */
const SIZE = 37;
const DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
const key = (q, r) => `${q},${r}`;
const parse = (k) => k.split(",").map(Number);
const coords = [];
for (let q = -3; q <= 3; q++) for (let r = -3; r <= 3; r++) if (Math.abs(q + r) <= 3) coords.push({ q, r });
const IN_GRID = new Set(coords.map(({ q, r }) => key(q, r)));
const neighbors = (q, r) => DIRS.map(([dq, dr]) => key(q + dq, r + dr));
const center = (q, r) => ({ x: 330 + SIZE * Math.sqrt(3) * (q + r / 2), y: 250 + SIZE * 1.5 * r });
const hexPoints = (x, y, s) => Array.from({ length: 6 }, (_, i) => {
  const a = (Math.PI / 180) * (60 * i - 30);
  return `${x + s * Math.cos(a)},${y + s * Math.sin(a)}`;
}).join(" ");
const ekey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
const hexDist = (a, b) => {
  const [q1, r1] = parse(a); const [q2, r2] = parse(b);
  const dq = q1 - q2, dr = r1 - r2;
  return (Math.abs(dq) + Math.abs(dq + dr) + Math.abs(dr)) / 2;
};

const EDGES = (() => {
  const out = [];
  const seen = new Set();
  coords.forEach(({ q, r }) => {
    const a = key(q, r);
    const c = center(q, r);
    DIRS.forEach(([dq, dr]) => {
      const b = key(q + dq, r + dr);
      if (!IN_GRID.has(b)) return;
      const k = ekey(a, b);
      if (seen.has(k)) return;
      seen.add(k);
      const n = center(q + dq, r + dr);
      const th = Math.atan2(n.y - c.y, n.x - c.x);
      const p1 = { x: c.x + SIZE * Math.cos(th - Math.PI / 6), y: c.y + SIZE * Math.sin(th - Math.PI / 6) };
      const p2 = { x: c.x + SIZE * Math.cos(th + Math.PI / 6), y: c.y + SIZE * Math.sin(th + Math.PI / 6) };
      out.push({ k, p1, p2 });
    });
  });
  return out;
})();
const EDGE_BY_KEY = Object.fromEntries(EDGES.map((e) => [e.k, e]));

function buildRivers(list) {
  const set = new Set(list);
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
  return { set, comp };
}
const riverSides = (rv, k) => {
  const [q, r] = parse(k);
  return DIRS.map(([dq, dr]) => rv.set.has(ekey(k, key(q + dq, r + dr))));
};
const riverIdsOf = (rv, k) => {
  const [q, r] = parse(k);
  return DIRS.map(([dq, dr]) => ekey(k, key(q + dq, r + dr))).filter((e) => rv.set.has(e)).map((e) => rv.comp[e]);
};
const citiesOf = (map) => Object.keys(map).filter((k) => map[k] && map[k].d === "city");
const cityOf = (k, map) => {
  const cities = citiesOf(map);
  let best = null, bestD = Infinity;
  for (const c of cities) {
    const d = hexDist(k, c);
    if (d <= 3 && d < bestD) { bestD = d; best = c; }
  }
  return best;
};
const cityPop = (map, cityKey) => (cityKey ? (tileOf(map, cityKey).pop || 7) : 7);

/* =========================================================
   タイル・配置判定
   ========================================================= */
const BLANK = { t: "grass", f: null, x: null, d: null };
const tileOf = (map, k) => ({ ...BLANK, ...(map[k] || {}) });

function withDistrict(map, k, d) {
  const t = tileOf(map, k);
  return {
    ...map,
    [k]: {
      ...t,
      d,
      x: REMOVABLE_EXTRAS.has(t.x) ? null : t.x,
      f: REMOVABLE_FEATURES.has(t.f) ? null : t.f,
      pop: d === "city" ? (t.pop || 7) : t.pop,
    },
  };
}

function checkDistrict(map, rv, k, d) {
  const tile = tileOf(map, k);
  const [q, r] = parse(k);
  const nks = neighbors(q, r).filter((n) => IN_GRID.has(n));
  const others = Object.entries(map).filter(([kk, v]) => kk !== k && v && v.d === d).map(([kk]) => kk);
  const L = DISTRICTS[d].label;

  // 都心の設置
  if (d === "city") {
    if (!TERRAIN[tile.t].land) return "都心は陸地にのみ建設できます";
    if (tile.t === "mountain") return "山岳に都心は建設できません";
    if (tile.f === "natural_wonder") return "自然遺産の上に都心は建設できません";
    const otherCities = citiesOf(map).filter((c) => c !== k);
    for (const c of otherCities) if (hexDist(k, c) < 4) return "都心同士は4タイル以上離す必要があります";
    return null;
  }

  // ユニバーサル制限
  if (tile.t === "mountain") return "山岳には区域・遺産を置けません";
  if (tile.f === "geothermal") return "地熱孔の上には区域・遺産を置けません";
  if (tile.f === "natural_wonder") return "自然遺産の上には区域・遺産を置けません";
  if (["luxury", "strategic", "strategic_mine"].includes(tile.x)) return "高級資源・戦略資源の上には区域を置けません";

  // 都心からの距離 3 タイル
  if (!cityOf(k, map)) return `${L}は都心から3タイル以内に置く必要があります`;

  if (d === "harbor" || d === "water_park") {
    if (!["coast", "lake"].includes(tile.t)) return `${L}は沿岸または湖タイルにのみ置けます`;
    if (tile.f === "reef") return "礁の上には置けません";
    if (!nks.some((n) => TERRAIN[tileOf(map, n).t].land)) return `${L}は陸地に隣接する水域タイルが必要です`;
  } else if (d === "canal") {
    if (!TERRAIN[tile.t].land) return "運河は陸地にのみ置けます";
    if (!nks.some((n) => !TERRAIN[tileOf(map, n).t].land)) return "運河は水域に隣接している必要があります";
  } else if (!TERRAIN[tile.t].land) {
    return `${L}は水域に置けません（水域に置けるのは港・ウォーターパークのみ）`;
  }

  if (d === "aqueduct") {
    const cityKey = cityOf(k, map);
    if (!nks.includes(cityKey)) return "用水路は都心に隣接している必要があります";
    const fresh = riverSides(rv, k).some(Boolean) || nks.some((n) => {
      const t = tileOf(map, n);
      return t.t === "lake" || t.t === "mountain" || t.f === "oasis";
    });
    if (!fresh) return "用水路は川・湖・オアシス・山岳のいずれかに隣接している必要があります";
  }
  if (d === "dam") {
    if (tile.t !== "flood") return "ダムは氾濫原タイルにのみ置けます";
    const s = riverSides(rv, k);
    if (!s.some((v, i) => v && s[(i + 1) % 6])) return "ダムは川が連続する2辺以上に接している必要があります";
    const mine = new Set(riverIdsOf(rv, k));
    if (others.some((o) => riverIdsOf(rv, o).some((id) => mine.has(id)))) return "1本の川に置けるダムは1つまでです";
  }
  if (d === "entertainment" && tile.t !== undefined) {
    // no special
  }

  // 1都市1つ
  const ck = cityOf(k, map);
  if (ONE_PER_CITY.has(d)) {
    const sameCity = others.filter((o) => cityOf(o, map) === ck);
    if (sameCity.length) return `${L}は1都市に1つまでです`;
  }
  if (d === "government") {
    if (others.length) return "政府複合施設は1文明に1つまでです";
  }

  // 人口スロット（専門区域のみ）
  if (isSpecialty(d)) {
    const pop = cityPop(map, ck);
    const max = 1 + Math.floor((pop - 1) / 3);
    const used = Object.entries(map).filter(([kk, v]) => {
      if (kk === k || !v || !v.d) return false;
      if (!isSpecialty(v.d)) return false;
      return cityOf(kk, map) === ck;
    }).length;
    if (used >= max) return `人口に対して区域スロットが不足しています（${used}/${max}）`;
  }

  return null;
}

function validateAll(map, rv) {
  const out = {};
  Object.entries(map).forEach(([k, v]) => {
    if (!v || !v.d || v.d === "city") return;
    const reason = checkDistrict(map, rv, k, v.d);
    if (reason) out[k] = reason;
  });
  citiesOf(map).forEach((c) => {
    const reason = checkDistrict(map, rv, c, "city");
    if (reason) out[c] = reason;
  });
  if (!citiesOf(map).length) out["0,0"] = "都心がありません";
  return out;
}

/* =========================================================
   隣接ボーナス計算
   ========================================================= */
function scoreAt(map, rv, k) {
  const tile = tileOf(map, k);
  const d = tile.d;
  if (!SCORED.has(d)) return null;
  const [q, r] = parse(k);
  const ns = neighbors(q, r).map((n) => tileOf(map, n));
  const c = (fn) => ns.filter(fn).length;
  let value = 0;
  const reasons = [];
  const add = (n, per, label) => {
    if (n > 0) { value += n * per; reasons.push(`${label} ×${n} → +${n * per}`); }
  };
  const minor = (n, label) => {
    if (n > 0) { const b = Math.floor(n / 2); value += b; reasons.push(`${label} ×${n} → +${b}（2つごとに+1）`); }
  };

  if (d === "campus") {
    add(c((t) => t.t === "mountain"), 1, "山岳");
    add(c((t) => t.f === "reef"), 2, "礁");
    add(c((t) => t.f === "geothermal"), 2, "地熱孔");
    minor(c((t) => t.f === "rainforest"), "熱帯雨林");
  }
  if (d === "holy_site") {
    add(c((t) => t.t === "mountain"), 1, "山岳");
    add(c((t) => t.f === "natural_wonder"), 2, "自然遺産");
    minor(c((t) => t.f === "woods"), "森");
  }
  if (d === "commercial") {
    if (riverSides(rv, k).some(Boolean)) { value += 2; reasons.push("川に接している → +2（辺の数に関係なく1回）"); }
    add(c((t) => t.d === "harbor"), 2, "港");
  }
  if (d === "harbor") {
    add(c((t) => t.d === "city"), 2, "都心");
    add(c((t) => t.x === "sea"), 1, "海洋資源");
  }
  if (d === "industrial") {
    add(c((t) => t.d === "aqueduct"), 2, "用水路");
    add(c((t) => t.d === "dam"), 2, "ダム");
    add(c((t) => t.d === "canal"), 2, "運河");
    add(c((t) => t.x === "quarry"), 1, "採石場");
    add(c((t) => t.x === "strategic" || t.x === "strategic_mine"), 1, "戦略資源");
    minor(c((t) => t.x === "mine" || t.x === "strategic_mine"), "鉱山");
    minor(c((t) => t.x === "lumber_mill"), "製材所");
  }
  if (d === "theater") {
    add(c((t) => t.d === "wonder"), 2, "遺産");
    add(c((t) => t.d === "entertainment" || t.d === "water_park"), 2, "娯楽複合施設");
  }
  add(c((t) => t.d === "government"), 1, "政府複合施設");
  minor(c((t) => COUNTS_AS_DISTRICT.has(t.d)), "隣接区域（都心・用水路・ダム含む）");
  return { value, reasons };
}

function allScores(map, rv) {
  const out = {};
  coords.forEach(({ q, r }) => {
    const k = key(q, r);
    const s = scoreAt(map, rv, k);
    if (s) out[k] = s;
  });
  return out;
}
const totalOf = (scores) => Object.values(scores).reduce((a, s) => a + s.value, 0);

/* =========================================================
   最適配置ソルバー
   ========================================================= */
function optimize(baseMap, rv, list) {
  const free = coords.map(({ q, r }) => key(q, r)).filter((k) => !tileOf(baseMap, k).d);
  let best = null;
  const rec = (map, i, placed) => {
    if (i === list.length) {
      let total = 0;
      for (const k in map) if (map[k] && SCORED.has(map[k].d)) total += scoreAt(map, rv, k).value;
      if (!best || total > best.total) best = { total, placed: { ...placed }, map };
      return;
    }
    const d = list[i];
    for (const k of free) {
      if (placed[k]) continue;
      if (checkDistrict(map, rv, k, d)) continue;
      placed[k] = d;
      rec(withDistrict(map, k, d), i + 1, placed);
      delete placed[k];
    }
  };
  rec(baseMap, 0, {});
  return best;
}

/* =========================================================
   問題テンプレート
   ========================================================= */
const T = (t, extra = {}) => ({ t, ...extra });
const templates = [
  {
    id: "river-hub",
    name: "川沿い商業ハブ三角形",
    goal: "商業ハブ・キャンパス・政府複合施設を置き、隣接ボーナス合計を最大化",
    allowed: ["commercial", "campus", "government"],
    tiles: { "0,0": T("grass", { d: "city", pop: 7 }), "-1,2": T("mountain"), "0,2": T("mountain"), "2,1": T("hills", { x: "mine" }), "-2,0": T("plains", { f: "woods" }) },
    rivers: [["1,0", "2,0"], ["1,0", "2,-1"], ["2,0", "2,-1"], ["2,0", "3,-1"]],
    note: "商業ハブは川の辺に接するタイルで+2。政府複合施設は隣接する専門区域すべてに+1。",
  },
  {
    id: "iz-dam",
    name: "工業地帯ダイヤ",
    goal: "工業地帯・用水路・ダムで工業地帯の生産力を最大化",
    allowed: ["industrial", "aqueduct", "dam"],
    tiles: {
      "0,0": T("grass", { d: "city", pop: 7 }), "2,-1": T("flood"), "2,-2": T("flood"), "3,-1": T("flood"),
      "0,1": T("hills", { x: "mine" }), "1,1": T("hills", { x: "mine" }), "2,0": T("plains", { x: "luxury" }),
    },
    rivers: [["2,-1", "3,-2"], ["2,-1", "2,-2"], ["2,-1", "1,-1"], ["1,-1", "1,-2"]],
    note: "ダムは氾濫原＋川が連続2辺以上。用水路は都心隣接＋淡水源。両方に接する位置に工業地帯を置く。",
  },
  {
    id: "campus-pass",
    name: "山間キャンパス",
    goal: "キャンパスと政府複合施設で科学力の隣接を最大化",
    allowed: ["campus", "government"],
    tiles: {
      "0,0": T("plains", { d: "city", pop: 7 }), "1,-1": T("mountain"), "1,-2": T("mountain"), "0,-2": T("mountain"),
      "-1,-1": T("plains", { f: "geothermal" }), "-1,1": T("grass", { x: "luxury" }), "-2,1": T("grass", { f: "rainforest" }), "-2,2": T("grass", { f: "rainforest" }),
    },
    rivers: [],
    note: "地熱孔は+2だが、その上には区域を置けない。山岳3枚＋地熱孔に囲まれるタイルを探す。",
  },
  {
    id: "culture",
    name: "遺産と劇場広場",
    goal: "劇場広場・娯楽複合施設・政府複合施設で文化力を最大化",
    allowed: ["theater", "entertainment", "government"],
    tiles: { "0,0": T("grass", { d: "city", pop: 7 }), "1,0": T("grass", { d: "wonder" }), "2,-2": T("plains", { d: "wonder" }), "-1,0": T("hills", { x: "mine" }) },
    rivers: [],
    note: "劇場広場は遺産1つにつき+2、娯楽複合施設にも+2。遺産は区域ではないので「隣接区域」には数えない。",
  },
  {
    id: "harbor-hub",
    name: "港と商業ハブ",
    goal: "港と商業ハブの隣接ボーナス合計を最大化",
    allowed: ["harbor", "commercial"],
    tiles: {
      "0,0": T("grass", { d: "city", pop: 7 }),
      "-1,0": T("coast"), "-1,1": T("coast"), "-2,1": T("coast", { x: "sea" }), "-2,2": T("coast", { x: "sea" }),
      "-1,2": T("coast"), "-2,0": T("coast", { f: "reef" }), "-3,1": T("coast"), "-3,2": T("coast"), "-3,3": T("coast"), "-2,3": T("coast"),
      "-1,-1": T("coast", { x: "sea" }), "-2,-1": T("coast"), "-3,0": T("coast"),
    },
    rivers: [["0,1", "1,1"], ["0,1", "1,0"]],
    note: "港は都心隣接で+2、海洋資源1つにつき+1。商業ハブは隣接する港で+2、川で+2。礁の上には港を置けない。",
  },
  {
    id: "twin-cities",
    name: "双子都市",
    goal: "2都市でキャンパス・聖地・劇場広場を配置し合計を最大化",
    allowed: ["campus", "holy_site", "theater", "government"],
    tiles: {
      "0,0": T("grass", { d: "city", pop: 7 }),
      "-4,0": T("grass", { d: "city", pop: 7 }),
      "1,-1": T("mountain"), "-2,1": T("mountain"), "-4,1": T("mountain"),
      "-1,-1": T("plains", { f: "geothermal" }), "-4,-1": T("grass", { f: "natural_wonder" }),
    },
    rivers: [],
    note: "2都市それぞれ人口7（区域3枠）。聖地は自然遺産隣接で+2、森隣接で+0.5。都市間は4タイル以上離す。",
  },
];
const buildMap = (t) => JSON.parse(JSON.stringify(t.tiles));
const riverList = (t) => t.rivers.map(([a, b]) => ekey(a, b));

/* =========================================================
   描画
   ========================================================= */
function HexTile({ k: _k, q, r, tile, selected, invalid, ghost, onClick }) {
  const { x, y } = center(q, r);
  const base = TERRAIN[tile.t];
  const dist = tile.d ? DISTRICTS[tile.d] : null;
  return (
    <g onClick={onClick} className="cursor-pointer">
      <polygon points={hexPoints(x, y, SIZE)} fill={base.color} stroke="#ffffff" strokeWidth={1.5} />
      {dist && (
        <motion.polygon key={tile.d} initial={{ opacity: 0 }} animate={{ opacity: 1 }} points={hexPoints(x, y, SIZE * 0.72)} fill={dist.color} stroke="#0f172a" strokeOpacity={0.35} strokeWidth={1} />
      )}
      {ghost && <polygon points={hexPoints(x, y, SIZE * 0.72)} fill={DISTRICTS[ghost].color} fillOpacity={0.55} stroke="#0f172a" strokeDasharray="4 3" strokeWidth={1.5} />}
      {invalid && <polygon points={hexPoints(x, y, SIZE - 3)} fill="none" stroke="#dc2626" strokeWidth={3} strokeDasharray="6 4" />}
      {selected && <polygon points={hexPoints(x, y, SIZE - 2)} fill="none" stroke="#0f172a" strokeWidth={3.5} />}
    </g>
  );
}

function HexLabel({ q, r, tile, score, ghost }) {
  const { x, y } = center(q, r);
  const main = tile.d ? DISTRICTS[tile.d].short : ghost ? DISTRICTS[ghost].short : TERRAIN[tile.t].short;
  const sub = [tile.f && FEATURES[tile.f].short, tile.x && EXTRAS[tile.x].short].filter(Boolean).join("・");
  const label = score != null ? `+${score}` : null;
  const w = label ? 8 + label.length * 7 : 0;
  return (
    <g pointerEvents="none">
      {sub && <text x={x} y={y - 17} textAnchor="middle" fontSize="9" fontWeight="700" fill="#0f172a">{sub}</text>}
      <text x={x} y={y + 4} textAnchor="middle" fontSize={tile.d || ghost ? 15 : 12} fontWeight="800" fill={tile.d || ghost ? "#0f172a" : "#334155"} fillOpacity={tile.d || ghost ? 1 : 0.7}>{main}</text>
      {label && (
        <>
          <rect x={x - w / 2} y={y + 9} width={w} height={15} rx={7.5} fill="#0f172a" />
          <text x={x} y={y + 20} textAnchor="middle" fontSize="11" fontWeight="800" fill="#ffffff">{label}</text>
        </>
      )}
    </g>
  );
}

/* =========================================================
   アプリ本体
   ========================================================= */
const TOOL_TABS = [
  { id: "d", label: "区域" },
  { id: "t", label: "地形" },
  { id: "f", label: "地物" },
  { id: "x", label: "資源・改善" },
  { id: "river", label: "川" },
];
const PLACEABLE = ["city", "campus", "holy_site", "commercial", "harbor", "industrial", "theater", "government", "aqueduct", "dam", "entertainment", "water_park", "canal", "wonder"];
const OPTIMIZABLE = PLACEABLE.filter((d) => d !== "wonder" && d !== "city");

export default function App() {
  const [mode, setMode] = useState("sandbox");
  const [template, setTemplate] = useState(templates[0]);
  const [map, setMap] = useState(() => buildMap(templates[0]));
  const [rivers, setRivers] = useState(() => riverList(templates[0]));
  const [answer, setAnswer] = useState({});
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("d");
  const [brush, setBrush] = useState("campus");
  const [msg, setMsg] = useState(null);
  const [checked, setChecked] = useState(false);
  const [optPick, setOptPick] = useState(["campus", "holy_site", "theater"]);
  const [ghost, setGhost] = useState(null);
  const [hoverEdge, setHoverEdge] = useState(null);

  const puzzle = mode === "puzzle";
  const puzzleBase = useMemo(() => buildMap(template), [template]);
  const puzzleRivers = useMemo(() => buildRivers(riverList(template)), [template]);
  const rv = useMemo(() => (puzzle ? puzzleRivers : buildRivers(rivers)), [puzzle, puzzleRivers, rivers]);

  const activeMap = useMemo(() => {
    if (!puzzle) return map;
    let m = puzzleBase;
    Object.entries(answer).forEach(([k, d]) => (m = withDistrict(m, k, d)));
    return m;
  }, [puzzle, map, puzzleBase, answer]);

  const scores = useMemo(() => allScores(activeMap, rv), [activeMap, rv]);
  const invalid = useMemo(() => validateAll(activeMap, rv), [activeMap, rv]);
  const total = totalOf(scores);
  const best = useMemo(() => (puzzle ? optimize(puzzleBase, puzzleRivers, template.allowed) : null), [puzzle, puzzleBase, puzzleRivers, template]);

  const sel = selected ? tileOf(activeMap, selected) : null;
  const selScore = selected ? scores[selected] : null;

  function paint(k) {
    setSelected(k);
    setChecked(false);
    setMsg(null);
    setGhost(null);
    if (tab === "river") return;
    const tile = tileOf(activeMap, k);

    if (puzzle) {
      if (puzzleBase[k] && puzzleBase[k].d === "city") return setMsg("この都心は問題の固定配置です");
      if (puzzleBase[k] && puzzleBase[k].d && puzzleBase[k].d !== "city") return setMsg("この区域・遺産は問題の固定配置です");
      if (brush === "erase") return setAnswer((a) => { const n = { ...a }; delete n[k]; return n; });
      if (brush === "city") return setMsg("問題モードでは都心は固定です");
      if (!template.allowed.includes(brush)) return setMsg("この問題では使えない区域です");
      const without = { ...answer };
      delete without[k];
      let m = puzzleBase;
      Object.entries(without).forEach(([kk, d]) => (m = withDistrict(m, kk, d)));
      const reason = checkDistrict(m, rv, k, brush);
      if (reason) return setMsg(`置けません：${reason}`);
      Object.keys(without).forEach((kk) => { if (without[kk] === brush) delete without[kk]; });
      return setAnswer({ ...without, [k]: brush });
    }

    if (tab === "d") {
      if (brush === "erase") {
        if (tile.d === "city") return setMsg("都心は消せません（白紙リセットを使用）");
        return setMap((m) => ({ ...m, [k]: { ...tile, d: null } }));
      }
      const base = { ...activeMap, [k]: { ...tile, d: null } };
      const reason = checkDistrict(base, rv, k, brush);
      if (reason) return setMsg(`置けません：${reason}`);
      if (REMOVABLE_EXTRAS.has(tile.x) || REMOVABLE_FEATURES.has(tile.f)) setMsg("区域の設置により、このタイルの改善・地物は撤去されました");
      const placed = withDistrict(base, k, brush);
      if (brush === "city") placed[k] = { ...placed[k], pop: tile.pop || 7 };
      return setMap(placed);
    }
    if (tab === "t") {
      if (tile.d === "city" && !TERRAIN[brush].land) return setMsg("都心は陸地である必要があります");
      if (tile.d === "city" && brush === "mountain") return setMsg("山岳に都心は建設できません");
      const land = TERRAIN[brush].land;
      const next = { ...tile, t: brush };
      if (brush === "mountain") { next.f = null; next.x = null; if (next.d !== "city") next.d = null; }
      if (land && next.f === "reef") next.f = null;
      if (!land && next.f && next.f !== "reef") next.f = null;
      if (land && next.x === "sea") next.x = null;
      if (!land && next.x && next.x !== "sea") next.x = null;
      if (next.f === "oasis" && brush !== "desert") next.f = null;
      if (next.x === "mine" && brush !== "hills") next.x = null;
      if (next.x === "lumber_mill" && brush !== "woods") next.x = null; // 製材所は森前提（簡略）
      if (brush === "flood" && !riverSides(rv, k).some(Boolean)) setMsg("注意：氾濫原は通常、川に接するタイルに生成されます");
      return setMap((m) => ({ ...m, [k]: next }));
    }
    if (tab === "f") {
      if (brush === "none") return setMap((m) => ({ ...m, [k]: { ...tile, f: null } }));
      const land = TERRAIN[tile.t].land;
      if (tile.t === "mountain") return setMsg("山岳には地物を置けません");
      if (brush === "reef" && land) return setMsg("礁は沿岸タイル専用です");
      if (brush !== "reef" && brush !== "natural_wonder" && !land) return setMsg(`${FEATURES[brush].label}は陸地専用です`);
      if (brush === "oasis" && tile.t !== "desert") return setMsg("オアシスは砂漠タイル専用です");
      if (tile.d && tile.d !== "city" && brush === "geothermal") return setMsg("区域のあるタイルに地熱孔は置けません");
      if (tile.d && tile.d !== "city" && brush === "natural_wonder") return setMsg("区域のあるタイルに自然遺産は置けません");
      return setMap((m) => ({ ...m, [k]: { ...tile, f: brush } }));
    }
    if (tab === "x") {
      if (brush === "none") return setMap((m) => ({ ...m, [k]: { ...tile, x: null } }));
      const land = TERRAIN[tile.t].land;
      if (tile.t === "mountain") return setMsg("山岳には資源・改善を置けません");
      if (brush === "sea" && land) return setMsg("海洋資源は水域専用です");
      if (brush !== "sea" && !land) return setMsg(`${EXTRAS[brush].label}は陸地専用です`);
      if (brush === "mine" && tile.t !== "hills") return setMsg("資源のない鉱山は丘陵にのみ建設できます");
      if (tile.d && tile.d !== "city") return setMsg("区域のあるタイルに資源・改善は置けません");
      return setMap((m) => ({ ...m, [k]: { ...tile, x: brush } }));
    }
  }

  function toggleRiver(ek) {
    if (puzzle) return setMsg("問題モードでは川は固定です");
    setRivers((rs) => (rs.includes(ek) ? rs.filter((x) => x !== ek) : [...rs, ek]));
    setGhost(null);
  }

  function loadTemplate(t, asPuzzle) {
    setTemplate(t);
    setAnswer({});
    setChecked(false);
    setMsg(null);
    setGhost(null);
    setSelected(null);
    if (asPuzzle) {
      setMode("puzzle");
      setTab("d");
      setBrush(t.allowed[0]);
    } else {
      const base = buildMap(t);
      const r = buildRivers(riverList(t));
      const sol = optimize(base, r, t.allowed);
      setMode("sandbox");
      setRivers(riverList(t));
      setMap(sol ? sol.map : base);
      setMsg(sol ? `最適配置：隣接ボーナス合計 +${sol.total}` : "有効な配置が見つかりません");
    }
  }

  function runOptimize() {
    if (!optPick.length) return setMsg("探索する区域を選んでください");
    const sol = optimize(map, rv, optPick);
    if (!sol) { setGhost(null); return setMsg("条件を満たす配置がありません（設置制限・人口スロット・1都市1つ制限を確認）"); }
    setGhost(sol);
    setMsg(`探索完了：盤面全体の隣接合計 +${sol.total}（点線が提案位置）`);
  }

  const brushList = (() => {
    if (puzzle) return [...template.allowed.map((id) => ({ id, ...DISTRICTS[id] })), { id: "erase", label: "区域を消す", short: "×", color: "#e2e8f0" }];
    if (tab === "d") return [...PLACEABLE.map((id) => ({ id, ...DISTRICTS[id] })), { id: "erase", label: "区域を消す", short: "×", color: "#e2e8f0" }];
    if (tab === "t") return Object.entries(TERRAIN).map(([id, v]) => ({ id, ...v }));
    if (tab === "f") return [...Object.entries(FEATURES).map(([id, v]) => ({ id, ...v, color: "#bbf7d0" })), { id: "none", label: "地物なし", short: "×", color: "#e2e8f0" }];
    if (tab === "x") return [...Object.entries(EXTRAS).map(([id, v]) => ({ id, ...v, color: "#e7e5e4" })), { id: "none", label: "資源・改善なし", short: "×", color: "#e2e8f0" }];
    return [];
  })();

  const placedAll = puzzle && template.allowed.every((d) => Object.values(answer).includes(d));
  const solved = puzzle && best && placedAll && Object.keys(invalid).length === 0 && total >= best.total;

  const selCity = sel && sel.d === "city" ? selected : null;
  const selPop = selCity ? (tileOf(activeMap, selected).pop || 7) : null;

  function setCityPop(k, pop) {
    const clamped = Math.max(1, Math.min(20, pop));
    setMap((m) => ({ ...m, [k]: { ...tileOf(m, k), pop: clamped } }));
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-5">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-cyan-300 text-sm font-bold tracking-widest">GATHERING STORM / 標準ルール学習用</div>
            <h1 className="text-3xl md:text-5xl font-black mt-1">Civ6 区域パズル・ラボ</h1>
            <p className="text-slate-400 mt-2">川はヘクスの「辺」、設置条件は区域ごとに判定。置けない場所は理由を表示します。2都市まで対応。</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => { setMode("sandbox"); setMsg(null); }} className={mode === "sandbox" ? "bg-cyan-500 text-slate-950" : "bg-slate-800"}>自由配置</Button>
            <Button onClick={() => loadTemplate(template, true)} className={puzzle ? "bg-amber-400 text-slate-950" : "bg-slate-800"}>問題モード</Button>
          </div>
        </header>

        <div className="grid lg:grid-cols-[290px_1fr_310px] gap-4">
          <Card className="bg-slate-900 border-slate-700 text-slate-100">
            <CardHeader><CardTitle>配置ツール</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {!puzzle && (
                <div className="flex flex-wrap gap-1">
                  {TOOL_TABS.map((t) => (
                    <button key={t.id} onClick={() => { setTab(t.id); setBrush(t.id === "d" ? "campus" : t.id === "t" ? "grass" : t.id === "f" ? "woods" : t.id === "x" ? "mine" : null); }}
                      className={`px-2 py-1 rounded-lg text-xs font-bold border ${tab === t.id ? "bg-cyan-500 text-slate-950 border-cyan-300" : "border-slate-600 text-slate-300"}`}>{t.label}</button>
                  ))}
                </div>
              )}
              {tab === "river" && !puzzle ? (
                <div className="text-sm text-slate-300 rounded-xl border border-blue-500/50 p-3 flex gap-2"><Waves className="w-5 h-5 text-blue-400 shrink-0" />盤面のヘクスの「辺」をクリックすると川を追加・削除します。</div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {brushList.map((b) => (
                    <button key={b.id} onClick={() => setBrush(b.id)}
                      className={`rounded-xl p-2 text-left text-xs font-bold border ${brush === b.id ? "border-white ring-2 ring-cyan-400" : "border-slate-700"}`}
                      style={{ background: b.color, color: "#0f172a" }}>{b.short} {b.label}</button>
                  ))}
                </div>
              )}
              <Button className="w-full bg-slate-700" onClick={() => { setChecked(false); setGhost(null); setMsg(null); if (puzzle) setAnswer({}); else { setMap({ "0,0": { t: "grass", d: "city", pop: 7 } }); setRivers([]); } }}>
                <RotateCcw className="w-4 h-4 mr-2" />{puzzle ? "解答をリセット" : "盤面を白紙に"}
              </Button>

              {!puzzle && (
                <div className="border-t border-slate-700 pt-3">
                  <div className="font-bold text-sm flex items-center gap-2"><Search className="w-4 h-4 text-emerald-300" />最適配置を探索（最大3区域）</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {OPTIMIZABLE.map((d) => {
                      const on = optPick.includes(d);
                      return (
                        <button key={d} onClick={() => setOptPick((p) => (on ? p.filter((x) => x !== d) : p.length >= 3 ? p : [...p, d]))}
                          className={`px-2 py-1 rounded-lg text-xs font-bold border ${on ? "border-emerald-300 bg-emerald-500 text-slate-950" : "border-slate-600 text-slate-300"}`}>{DISTRICTS[d].label}</button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" className="bg-emerald-600 flex-1" onClick={runOptimize}>探索</Button>
                    {ghost && <Button size="sm" className="bg-cyan-600 flex-1" onClick={() => { setMap(ghost.map); setGhost(null); setMsg(`適用しました：合計 +${ghost.total}`); }}>適用</Button>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700 overflow-hidden">
            <CardContent className="p-0 relative">
              {puzzle && (
                <div className="absolute top-3 left-3 z-10 max-w-sm rounded-xl bg-slate-950/90 p-3 border border-amber-400">
                  <div className="text-amber-300 font-black">問題：{template.name}</div>
                  <div className="text-sm mt-1">{template.goal}</div>
                  <div className="text-xs mt-1 text-slate-400">使う区域：{template.allowed.map((d) => DISTRICTS[d].label).join("・")}</div>
                </div>
              )}
              <div className="absolute top-3 right-3 z-10 rounded-xl bg-slate-950/90 px-3 py-2 border border-slate-600 text-right">
                <div className="text-xs text-slate-400">盤面の隣接合計</div>
                <div className="text-2xl font-black text-cyan-300">+{total}{puzzle && best ? <span className="text-sm text-slate-400"> / 最適 +{best.total}</span> : null}</div>
              </div>
              <svg viewBox="0 0 660 500" className="w-full bg-gradient-to-br from-emerald-950 to-slate-950">
                {coords.map(({ q, r }) => {
                  const k = key(q, r);
                  const g = ghost && ghost.placed[k];
                  return <HexTile key={k} k={k} q={q} r={r} tile={tileOf(activeMap, k)} selected={selected === k} invalid={!!invalid[k]} ghost={g} onClick={() => paint(k)} />;
                })}
                {EDGES.filter((e) => rv.set.has(e.k)).map((e) => (
                  <line key={e.k} x1={e.p1.x} y1={e.p1.y} x2={e.p2.x} y2={e.p2.y} stroke="#1d4ed8" strokeWidth={6} strokeLinecap="round" pointerEvents="none" />
                ))}
                {coords.map(({ q, r }) => {
                  const k = key(q, r);
                  const s = ghost ? allScores(ghost.map, rv)[k] : scores[k];
                  return <HexLabel key={k} q={q} r={r} tile={tileOf(activeMap, k)} score={s ? s.value : null} ghost={ghost && ghost.placed[k]} />;
                })}
                {tab === "river" && !puzzle && EDGES.map((e) => (
                  <line key={`h-${e.k}`} x1={e.p1.x} y1={e.p1.y} x2={e.p2.x} y2={e.p2.y}
                    stroke={hoverEdge === e.k ? "#93c5fd" : "transparent"} strokeWidth={11} strokeLinecap="round" className="cursor-pointer"
                    onMouseEnter={() => setHoverEdge(e.k)} onMouseLeave={() => setHoverEdge(null)} onClick={() => toggleRiver(e.k)} />
                ))}
              </svg>
              <div className="p-3 text-xs text-slate-400">
                青い太線＝川（ヘクスの辺）。赤い点線枠＝設置条件違反。下部の黒ラベル＝基本隣接ボーナス。上部の小文字＝地物・資源。
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {msg && <div className="rounded-xl border border-amber-500/60 bg-amber-950/60 p-3 text-sm text-amber-200 flex gap-2"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />{msg}</div>}
            <Card className="bg-slate-900 border-slate-700 text-slate-100">
              <CardHeader><CardTitle className="flex items-center gap-2"><Info className="w-5 h-5 text-cyan-300" />選択タイル</CardTitle></CardHeader>
              <CardContent>
                {sel ? (
                  <>
                    <div className="text-sm text-slate-300 space-y-1">
                      <div>地形：{TERRAIN[sel.t].label}{sel.f ? ` ／ ${FEATURES[sel.f].label}` : ""}{sel.x ? ` ／ ${EXTRAS[sel.x].label}` : ""}</div>
                      <div>川に接する辺：{riverSides(rv, selected).filter(Boolean).length} 辺</div>
                      <div>区域：{sel.d ? DISTRICTS[sel.d].label : "なし"}</div>
                      {sel.d === "city" && (
                        <div className="flex items-center gap-2 mt-2">
                          <Users className="w-4 h-4 text-cyan-300" />
                          <span>人口</span>
                          <button className="px-2 py-0.5 rounded bg-slate-700" onClick={() => setCityPop(selected, (selPop || 7) - 1)} disabled={puzzle}>-</button>
                          <span className="font-bold">{selPop}</span>
                          <button className="px-2 py-0.5 rounded bg-slate-700" onClick={() => setCityPop(selected, (selPop || 7) + 1)} disabled={puzzle}>+</button>
                          <span className="text-xs text-slate-400">（区域枠 {1 + Math.floor(((selPop || 7) - 1) / 3)}）</span>
                        </div>
                      )}
                      {sel.d && sel.d !== "city" && (
                        <div className="text-xs text-slate-400 mt-1">所属都心：{cityOf(selected, activeMap) || "なし"}（距離 {cityOf(selected, activeMap) ? hexDist(selected, cityOf(selected, activeMap)) : "-"})</div>
                      )}
                    </div>
                    {invalid[selected] && <div className="mt-3 rounded-lg bg-rose-950 text-rose-300 p-2 text-sm">設置条件違反：{invalid[selected]}</div>}
                    {selScore && (
                      <>
                        <div className="text-5xl font-black text-cyan-300 mt-3">+{selScore.value}</div>
                        <ul className="mt-2 space-y-1 text-sm">
                          {selScore.reasons.length ? selScore.reasons.map((x) => <li key={x}>• {x}</li>) : <li className="text-slate-400">隣接ボーナスなし</li>}
                        </ul>
                        {selScore.value > 0 && selScore.value === Math.max(...Object.values(scores).map((s) => s.value)) && (
                          <div className="mt-3 text-emerald-300 flex gap-2 items-center text-sm"><Trophy className="w-4 h-4" />現在の盤面内で最高</div>
                        )}
                      </>
                    )}
                  </>
                ) : <p className="text-slate-400">ヘクスをクリックしてください。</p>}
              </CardContent>
            </Card>

            {puzzle && (
              <Card className="bg-slate-900 border-amber-500/50 text-slate-100">
                <CardContent className="pt-6 space-y-3">
                  <ul className="text-sm space-y-1">
                    {template.allowed.map((d) => (
                      <li key={d} className={Object.values(answer).includes(d) ? "text-emerald-300" : "text-slate-400"}>{Object.values(answer).includes(d) ? "✓" : "○"} {DISTRICTS[d].label}</li>
                    ))}
                  </ul>
                  <Button onClick={() => setChecked(true)} className="w-full bg-amber-400 text-slate-950 font-black">答え合わせ</Button>
                  {checked && (
                    <div className={`rounded-xl p-3 ${solved ? "bg-emerald-950 text-emerald-300" : "bg-rose-950 text-rose-300"}`}>
                      {solved ? (
                        <span className="flex gap-2"><CheckCircle2 className="shrink-0" />正解。最適値 +{best.total} に到達しました。</span>
                      ) : (
                        <>
                          <b>未達成です。</b>
                          <div className="text-sm mt-1">
                            {!placedAll ? "まだ置いていない区域があります。" : Object.keys(invalid).length ? "設置条件違反があります。" : `現在 +${total}、最適は +${best ? best.total : "?"} です。`}
                          </div>
                          <div className="text-sm mt-1">ヒント：{template.note}</div>
                        </>
                      )}
                    </div>
                  )}
                  {checked && !solved && (
                    <Button size="sm" className="w-full bg-slate-700" onClick={() => loadTemplate(template, false)}>答えを見る（自由配置で表示）</Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <section>
          <div className="flex items-center gap-2 mb-3"><Lightbulb className="text-amber-300" /><h2 className="text-2xl font-black">定石テンプレート</h2></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {templates.map((t) => (
              <Card key={t.id} className="bg-slate-900 border-slate-700 text-slate-100">
                <CardContent className="pt-5">
                  <div className="font-black text-lg">{t.name}</div>
                  <p className="text-sm text-slate-400 mt-2 min-h-20">{t.note}</p>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" onClick={() => loadTemplate(t, false)} className="bg-cyan-600">最適配置を見る</Button>
                    <Button size="sm" onClick={() => loadTemplate(t, true)} className="bg-slate-700">問題<ChevronRight className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Card className="bg-slate-900 border-slate-700 text-slate-100">
          <CardContent className="pt-6 grid md:grid-cols-3 gap-5 text-sm">
            <div>
              <b className="text-cyan-300">実装した設置制限</b>
              <p className="text-slate-400 mt-1">山岳・自然遺産・高級/戦略資源には不可（都心は例外で陸地のみ）。港/ウォーターパークは陸地隣接の沿岸/湖。用水路は都心隣接＋川/湖/オアシス/山岳。ダムは氾濫原＋川が連続2辺以上、1本の川に1つ。運河は水域隣接の陸地。都心同士は4タイル以上。区域は都心から3タイル以内。専門区域は人口スロット制（1+floor((pop-1)/3)）。専門区域・用水路・娯楽・ウォーターパークは1都市1つ、政府複合施設は1文明1つ。</p>
            </div>
            <div>
              <b className="text-amber-300">未反映・簡略化</b>
              <p className="text-slate-400 mt-1">盤面外周の辺の川、運河の水域接続厳密判定、地区（Encampment/Spaceport/Aerodrome/Preserve）、野営地、宇宙基地、遺産ごとの固有設置条件、自然遺産の固有効果、文明・指導者固有能力、政策カード・建造物による倍加、都市国ボーナス、人口自動成長。「同じ川」は辺のつながりで判定。最終確認はゲーム内プレビューで。</p>
            </div>
            <div>
              <b className="text-emerald-300">根拠</b>
              <p className="text-slate-400 mt-1">隣接値：Civilopedia（Gathering Storm）各区域ページ、Civ6 Planner 隣接表、civ6lib SKILL.md。ダム・用水路・人口スロット・距離制限：Civilopedia／Civ Wiki／civ6lib。</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
