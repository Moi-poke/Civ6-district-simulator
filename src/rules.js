/* =========================================================
   データ定義（Gathering Storm 標準ルール / 文明固有能力なし）
   ========================================================= */
const TERRAIN = {
  grass: { label: "草原", short: "草", color: "#a3d977", land: true },
  plains: { label: "平原", short: "平", color: "#d9d28a", land: true },
  desert: { label: "砂漠", short: "砂", color: "#f3e3a2", land: true },
  tundra: { label: "ツンドラ", short: "ツ", color: "#d6cfae", land: true },
  snow: { label: "雪原", short: "雪", color: "#f1f5f9", land: true },
  flood: { label: "氾濫原", short: "氾", color: "#c9e6a0", land: true },
  mountain: { label: "山岳", short: "山", color: "#78716c", land: true },
  coast: { label: "沿岸", short: "海", color: "#38bdf8", land: false },
  lake: { label: "湖", short: "湖", color: "#60a5fa", land: false },
  blocked: { label: "使用不可", short: "禁", color: "#4b5563", land: true },
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
  stone: { label: "石材", short: "石材" },
  camp: { label: "野営地", short: "営" },
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
  encampment: { label: "軍事基地", short: "軍", color: "#ef4444" },
  aerodrome: { label: "飛行場", short: "飛", color: "#94a3b8" },
  spaceport: { label: "宇宙基地", short: "宇", color: "#818cf8" },
  neighborhood: { label: "近郊住宅地", short: "住", color: "#86efac" },
  preserve: { label: "保護区", short: "保", color: "#4ade80" },
  diplomatic: { label: "外交街", short: "外交", color: "#f0abfc" },
  wonder: { label: "遺産（汎用）", short: "遺", color: "#facc15" },
};
// 遺産（固有設置条件つき）。d フィールドに wonder:<id> として格納
const WONDERS = {
  pyramids: { label: "ピラミッド", short: "金", terrain: ["desert", "flood"], noHills: true, req: "丘陵でない砂漠または氾濫原" },
  petra: { label: "ペトラ", short: "ペ", terrain: ["desert", "flood"], noHills: true, req: "丘陵でない砂漠または氾濫原" },
  hanging_gardens: { label: "空中庭園", short: "空", river: true, req: "川に接する" },
  oracle: { label: "神託", short: "託", hills: true, req: "丘陵" },
  stonehenge: { label: "ストーンヘンジ", short: "石遺", flat: true, adjExtra: ["stone"], req: "平地・石材に隣接" },
  great_library: { label: "大図書館", short: "図", flat: true, adjDistrict: ["campus"], req: "平地・キャンパスに隣接" },
  colosseum: { label: "コロッセオ", short: "闘", flat: true, adjDistrict: ["entertainment"], req: "平地・娯楽複合施設に隣接" },
  statue_zeus: { label: "ゼウス像", short: "宙", flat: true, adjDistrict: ["encampment"], req: "平地・軍事基地に隣接" },
  temple_artemis: { label: "アルテミス神殿", short: "狩", adjExtra: ["camp"], req: "野営地に隣接" },
  terracotta: { label: "兵馬俑", short: "兵", terrain: ["grass", "plains"], adjDistrict: ["encampment"], req: "草原/平原・軍事基地に隣接" },
  mausoleum: { label: "ハリカルナッソス霊廟", short: "霊", adjDistrict: ["harbor"], req: "港に隣接" },
  great_lighthouse: { label: "大灯台", short: "灯", water: "coast", adjDistrict: ["harbor"], req: "沿岸（陸隣接）・港に隣接" },
  colossus: { label: "コロッサス", short: "巨", water: "coast", adjDistrict: ["harbor"], req: "沿岸（陸隣接）・港に隣接" },
  machu_picchu: { label: "マチュピチュ", short: "遺山", req: "山岳上（※簡略：山岳タイル選択で可）" },
  chichen_itza: { label: "チチェン・イツァ", short: "遺雨", feature: ["rainforest"], req: "熱帯雨林上" },
  mahabodhi: { label: "マハーボーディー寺院", short: "菩", feature: ["woods"], adjDistrict: ["holy_site"], req: "森上・聖地に隣接" },
  mont_st_michel: { label: "モン・サン＝ミシェル", short: "修", terrain: ["flood"], feature: ["marsh"], req: "氾濫原または湿原" },
  etemenanki: { label: "エテメナンキ", short: "塔", terrain: ["flood"], feature: ["marsh"], req: "氾濫原または湿原" },
  angkor_wat: { label: "アンコールワット", short: "寺", adjDistrict: ["aqueduct"], req: "用水路に隣接" },
  alhambra: { label: "アルハンブラ", short: "城", hills: true, adjDistrict: ["encampment"], req: "丘陵・軍事基地に隣接" },
  forbidden_city: { label: "紫禁城", short: "禁城", flat: true, adjCity: true, req: "平地・都心に隣接" },
  potala: { label: "ポタラ宮", short: "宮", hills: true, adjTerrain: ["mountain"], req: "丘陵・山岳に隣接" },
  bolshoi: { label: "ボリショイ劇場", short: "舞", flat: true, adjDistrict: ["theater"], req: "平地・劇場広場に隣接" },
  big_ben: { label: "ビッグベン", short: "時", river: true, adjDistrict: ["commercial"], req: "川・商業ハブに隣接" },
  hermitage: { label: "エルミタージュ", short: "美", river: true, req: "川に接する" },
  oxford: { label: "オックスフォード大学", short: "大", terrain: ["grass", "plains"], adjDistrict: ["campus"], req: "草原/平原・キャンパスに隣接" },
  ruhr: { label: "ルール渓谷", short: "炭", river: true, adjDistrict: ["industrial"], req: "川・工業地帯に隣接" },
  broadway: { label: "ブロードウェイ", short: "劇遺", flat: true, adjDistrict: ["theater"], req: "平地・劇場広場に隣接" },
  eiffel: { label: "エッフェル塔", short: "塔鉄", flat: true, adjCity: true, req: "平地・都心に隣接" },
  cristo: { label: "キリスト像", short: "像", hills: true, req: "丘陵" },
  statue_liberty: { label: "自由の女神像", short: "由", water: "coast", adjDistrict: ["harbor"], req: "沿岸（陸隣接）・港に隣接" },
  golden_gate: { label: "ゴールデンゲート", short: "橋", water: "coast", req: "沿岸（陸隣接）※直線条件は簡略" },
  sydney_opera: { label: "シドニーオペラハウス", short: "帆", water: "coast", adjDistrict: ["harbor"], req: "沿岸（陸隣接）・港に隣接" },
  maracana: { label: "マラカナンスタジアム", short: "球", flat: true, adjDistrict: ["entertainment"], req: "平地・娯楽複合施設に隣接" },
  venetian: { label: "ヴェネツィア造船所", short: "船", water: "coast", adjDistrict: ["industrial"], req: "沿岸（陸隣接）・工業地帯に隣接" },
  torre_belem: { label: "ベレンの塔", short: "塔海", water: "coast", adjDistrict: ["harbor"], req: "沿岸（陸隣接）・港に隣接" },
  huey: { label: "ウエイ・テオカリ", short: "湖遺", water: "lake", req: "湖（陸隣接）" },
  jebel_barkal: { label: "ジェベル・バルカル", short: "岩", terrain: ["desert"], hills: true, req: "砂漠の丘陵" },
  kotokuin: { label: "鎌倉大仏", short: "仏", adjDistrict: ["holy_site"], req: "聖地に隣接" },
  sankore: { label: "サンゴレ大学", short: "学", terrain: ["desert"], adjDistrict: ["campus"], req: "砂漠（丘陵可）・キャンパスに隣接" },
};
const SCORED = new Set(["campus", "holy_site", "commercial", "harbor", "industrial", "theater"]);
const COUNTS_AS_DISTRICT = new Set(["city", "campus", "holy_site", "commercial", "harbor", "industrial", "theater", "government", "aqueduct", "dam", "entertainment", "water_park", "canal", "encampment", "aerodrome", "spaceport", "neighborhood", "preserve", "diplomatic"]);
const ONE_PER_CITY = new Set(["campus", "holy_site", "commercial", "harbor", "industrial", "theater", "entertainment", "water_park", "encampment", "aerodrome", "preserve", "aqueduct"]);
const ONE_PER_CIV = new Set(["government", "diplomatic"]);
const REMOVABLE_EXTRAS = new Set(["mine", "quarry", "sea", "lumber_mill"]);
const REMOVABLE_FEATURES = new Set(["woods", "rainforest", "marsh"]);
const NON_SPECIALTY = new Set(["aqueduct", "dam", "canal", "spaceport", "neighborhood"]);
const isSpecialty = (d) => !!d && d !== "city" && d !== "wonder" && !(typeof d === "string" && d.startsWith("wonder:")) && !NON_SPECIALTY.has(d);

/* =========================================================
   ヘクス幾何
   ========================================================= */
const RADIUS = 5;
const SIZE = 26;
const DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
const key = (q, r) => `${q},${r}`;
const parse = (k) => k.split(",").map(Number);
const coords = [];
for (let q = -RADIUS; q <= RADIUS; q++) for (let r = -RADIUS; r <= RADIUS; r++) if (Math.abs(q + r) <= RADIUS) coords.push({ q, r });
const IN_GRID = new Set(coords.map(({ q, r }) => key(q, r)));
const neighbors = (q, r) => DIRS.map(([dq, dr]) => key(q + dq, r + dr));
const BOARD_W = Math.ceil(SIZE * Math.sqrt(3) * (2 * RADIUS + 1) + SIZE * 2);
const BOARD_H = Math.ceil(SIZE * 1.5 * (2 * RADIUS) + SIZE * 3.2);
const center = (q, r) => ({ x: BOARD_W / 2 + SIZE * Math.sqrt(3) * (q + r / 2), y: BOARD_H / 2 + SIZE * 1.5 * r });
const VIEWBOX = `0 0 ${BOARD_W} ${BOARD_H}`;
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
const citiesWithin = (k, map) => {
  return citiesOf(map)
    .map((c) => ({ c, d: hexDist(k, c) }))
    .filter(({ d }) => d <= 3)
    .sort((a, b) => a.d - b.d)
    .map(({ c }) => c);
};
const cityOf = (k, map) => {
  const t = tileOf(map, k);
  // owner が有効（3タイル圏内）ならそれを正とする
  if (t.owner && citiesWithin(k, map).includes(t.owner)) return t.owner;
  return citiesWithin(k, map)[0] || null;
};
const cityPop = (map, cityKey) => (cityKey ? (tileOf(map, cityKey).pop || 7) : 7);

/* =========================================================
   タイル・配置判定
   ========================================================= */
const BLANK = { t: "grass", h: false, f: null, x: null, d: null };
const tileOf = (map, k) => ({ ...BLANK, ...(map[k] || {}) });

function withDistrict(map, k, d) {
  const t = tileOf(map, k);
  const isCity = d === "city";
  // 都心は撤去可能な地物・改善を消し、地熱孔・高級/戦略資源は残す
  const keepExtra = isCity && ["luxury", "strategic", "strategic_mine"].includes(t.x);
  const keepFeature = isCity && t.f === "geothermal";
  return {
    ...map,
    [k]: {
      ...t,
      d,
      x: keepExtra || !REMOVABLE_EXTRAS.has(t.x) ? t.x : null,
      f: keepFeature || !REMOVABLE_FEATURES.has(t.f) ? t.f : null,
      pop: isCity ? (t.pop || 7) : t.pop,
    },
  };
}

const isWonderId = (d) => d === "wonder" || (typeof d === "string" && d.startsWith("wonder:"));
const wonderKeyOf = (d) => (typeof d === "string" && d.startsWith("wonder:") ? d.slice(7) : null);
const districtLabel = (d) => {
  if (DISTRICTS[d]) return DISTRICTS[d].label;
  const wk = d && d.startsWith("wonder:") ? d.slice(7) : null;
  if (wk && WONDERS[wk]) return WONDERS[wk].label;
  return d;
};
const isFlatLand = (tile) => TERRAIN[tile.t].land && !tile.h && tile.t !== "mountain" && tile.t !== "blocked";
const HILLS_SHORT = "丘";

function checkWonder(map, rv, k, wk, nks) {
  const tile = tileOf(map, k);
  const w = WONDERS[wk];
  if (!w) return "不明な遺産です";
  if (w.terrain && !(w.terrain.includes(tile.t) || (w.feature && w.feature.includes(tile.f)))) return `${w.label}は${w.req}に建設する必要があります`;
  if (!w.terrain && w.feature && !w.feature.includes(tile.f)) return `${w.label}は${w.req}に建設する必要があります`;
  if (w.flat && !isFlatLand(tile)) return `${w.label}は${w.req}に建設する必要があります`;
  if (w.hills && !tile.h) return `${w.label}は${w.req}に建設する必要があります`;
  if (w.noHills && tile.h) return `${w.label}は${w.req}に建設する必要があります`;
  if (w.water) {
    if (tile.t !== w.water) return `${w.label}は${w.req}に建設する必要があります`;
    if (!nks.some((n) => TERRAIN[tileOf(map, n).t].land)) return `${w.label}は陸地に隣接する水域タイルが必要です`;
  }
  if (w.river && !riverSides(rv, k).some(Boolean)) return `${w.label}は${w.req}に建設する必要があります`;
  if (w.desert && tile.t !== "desert") return `${w.label}は${w.req}に建設する必要があります`;
  if (w.adjCity && !nks.some((n) => tileOf(map, n).d === "city")) return `${w.label}は${w.req}に建設する必要があります`;
  if (w.adjDistrict && !nks.some((n) => w.adjDistrict.includes(tileOf(map, n).d))) return `${w.label}は${w.req}に建設する必要があります`;
  if (w.adjTerrain && !nks.some((n) => w.adjTerrain.includes(tileOf(map, n).t))) return `${w.label}は${w.req}に建設する必要があります`;
  if (w.adjExtra && !nks.some((n) => w.adjExtra.includes(tileOf(map, n).x))) return `${w.label}は${w.req}に建設する必要があります`;
  return null;
}

function checkDistrict(map, rv, k, d) {
  const tile = tileOf(map, k);
  const [q, r] = parse(k);
  const nks = neighbors(q, r).filter((n) => IN_GRID.has(n));
  const others = Object.entries(map).filter(([kk, v]) => kk !== k && v && v.d === d).map(([kk]) => kk);
  const L = districtLabel(d);

  // 都心の設置
  if (d === "city") {
    if (tile.d) return "既に区域・都心・遺産があります";
    if (tile.f === "oasis") return "オアシスの上に都心は建設できません";
    if (!TERRAIN[tile.t].land) return "都心は陸地にのみ建設できます";
    if (tile.t === "mountain") return "山岳に都心は建設できません";
    if (tile.t === "blocked") return "使用不可タイルに都心は建設できません";
    if (tile.f === "natural_wonder") return "自然遺産の上に都心は建設できません";
    const otherCities = citiesOf(map).filter((c) => c !== k);
    for (const c of otherCities) if (hexDist(k, c) < 4) return "都心同士は4タイル以上離す必要があります";
    return null;
  }

  if (tile.d) return "既に区域・都心・遺産があります";
  const wk = wonderKeyOf(d);
  const w = wk ? WONDERS[wk] : null;
  if (wk && others.length) return `${w.label}は既に建設されています（世界に1つ）`;
  // ユニバーサル制限（遺産の固有条件は後段で処理）
  if (tile.t === "mountain" && wk !== "machu_picchu") return "山岳には区域・遺産を置けません";
  if (wk === "machu_picchu" && tile.t !== "mountain") return "マチュピチュは山岳タイルに建設する必要があります";
  if (tile.t === "blocked") return "使用不可タイルには区域・遺産を置けません";
  if (tile.f === "oasis") return "オアシスの上には区域・遺産を置けません";
  if (tile.f === "geothermal") return "地熱孔の上には区域・遺産を置けません";
  if (tile.f === "natural_wonder") return "自然遺産の上には区域・遺産を置けません";
  if (tile.t === "flood" && !wk && d !== "dam") return "氾濫原には区域を置けません（ダムを除く）";
  if (w && w.feature && tile.f && !w.feature.includes(tile.f)) return `${w.label}は${w.req}に建設する必要があります`;
  if (!w && tile.f && ["woods", "rainforest", "marsh"].indexOf(tile.f) < 0 && !["oasis", "reef"].includes(tile.f)) { /* pass */ }
  if (["luxury", "strategic", "strategic_mine"].includes(tile.x)) return "高級資源・戦略資源の上には区域を置けません";

  // 都心からの距離 3 タイル
  if (!cityOf(k, map)) return `${L}は都心から3タイル以内に置く必要があります`;

  const wkWater = wk && w && w.water;
  if (d === "harbor" || d === "water_park") {
    if (!["coast", "lake"].includes(tile.t)) return `${L}は沿岸または湖タイルにのみ置けます`;
    if (tile.f === "reef") return "礁の上には置けません";
    if (!nks.some((n) => TERRAIN[tileOf(map, n).t].land && tileOf(map, n).t !== "blocked")) return `${L}は陸地に隣接する水域タイルが必要です`;
  } else if (wkWater) {
    // 水域遺産：checkWonder 側で検証
  } else if (d === "canal") {
    if (!TERRAIN[tile.t].land) return "運河は陸地にのみ置けます";
    if (!isFlatLand(tile)) return "運河は平地にのみ置けます";
    const waterN = nks.filter((n) => !TERRAIN[tileOf(map, n).t].land && tileOf(map, n).t !== "blocked");
    if (waterN.length < 1) return "運河は水域に隣接している必要があります";
    const cityKey = cityOf(k, map);
    const cityAdjacent = cityKey && nks.includes(cityKey);
    const separate = waterN.some((a, i) => waterN.slice(i + 1).some((b) => hexDist(a, b) > 1));
    if (!cityAdjacent && !separate) return "運河は都心隣接または2つの水域（互いに隣接しない）に接する必要があります";
  } else if (!TERRAIN[tile.t].land) {
    return `${L}は水域に置けません（水域に置けるのは港・ウォーターパークのみ）`;
  }

  if (d === "encampment" || d === "preserve") {
    const cityKey = cityOf(k, map);
    if (cityKey && nks.includes(cityKey)) return `${L}は都心に隣接できません`;
  }
  if (d === "aerodrome" || d === "spaceport") {
    if (!isFlatLand(tile)) return `${L}は平地（丘陵・水・山以外）にのみ置けます`;
  }
  if (d === "aqueduct" || d === "bath") { /* aqueduct handled below */ }

  if (wk) {
    if (!TERRAIN[tile.t].land && !w.water) return `${w.label}は水域に置けません`;
    if (w && !w.water && w.feature && tile.f && !w.feature.includes(tile.f)) { /* already checked */ }
    const werr = checkWonder(map, rv, k, wk, nks);
    if (werr) return werr;
  }

  if (d === "aqueduct") {
    const cityKey = cityOf(k, map);
    if (!nks.includes(cityKey)) return "用水路は都心に隣接している必要があります";
    // 都心側の川辺を除く淡水源
    const otherFresh = DIRS.some(([dq, dr]) => {
      const nk = key(q + dq, r + dr);
      if (nk === cityKey) return false;
      if (rv.set.has(ekey(k, nk))) return true;
      const t = tileOf(map, nk);
      return t.t === "lake" || t.t === "mountain" || t.f === "oasis";
    });
    if (!otherFresh) return "用水路は都心側以外の川・湖・オアシス・山岳に隣接している必要があります";
  }
  if (d === "dam") {
    if (tile.t !== "flood") return "ダムは氾濫原タイルにのみ置けます";
    const s = riverSides(rv, k);
    if (s.filter(Boolean).length < 2) return "ダムは川が2辺以上に接している必要があります";
    const mine = new Set(riverIdsOf(rv, k));
    if (others.some((o) => riverIdsOf(rv, o).some((id) => mine.has(id)))) return "1本の川に置けるダムは1つまでです";
  }
  // 娯楽複合施設とウォーターパークは同一都市で併存不可
  const ck = cityOf(k, map);
  if (d === "entertainment" || d === "water_park") {
    const other = d === "entertainment" ? "water_park" : "entertainment";
    const conflict = Object.entries(map).some(([kk, v]) => kk !== k && v && v.d === other && cityOf(kk, map) === ck);
    if (conflict) return `${L}は${DISTRICTS[other].label}と同じ都市に置けません`;
  }
  // 1都市1つ
  if (ONE_PER_CITY.has(d)) {
    const sameCity = others.filter((o) => cityOf(o, map) === ck);
    if (sameCity.length) return `${L}は1都市に1つまでです`;
  }
  if (ONE_PER_CIV.has(d)) {
    if (others.length) return `${L}は1文明に1つまでです`;
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

function isDistrictItem(id) { return !!DISTRICTS[id] || (typeof id === "string" && id.startsWith("wonder:")); }
function isExtraItem(id) { return !!EXTRAS[id]; }
function checkExtra(map, rv, k, x) {
  const tile = tileOf(map, k);
  if (tile.d && tile.d !== "city") return "区域のあるタイルに資源・改善は置けません";
  if (tile.x && tile.x !== x) return "既存の資源・改善があります";
  if (tile.t === "mountain" || tile.t === "blocked") return "山岳・使用不可タイルには資源・改善を置けません";
  if (tile.f === "oasis") return "オアシスの上には資源・改善を置けません";
  if (x === "stone" && (tile.t === "flood" || tile.f === "woods" || tile.f === "rainforest" || tile.f === "marsh")) return "石材は氾濫原・森・熱帯雨林・湿原に置けません";
  if (x === "camp" && !(tile.h || ["grass", "plains", "tundra"].includes(tile.t))) return "野営地は丘陵・草原・平原・ツンドラにのみ置けます";
  if (x === "sea" && !["coast", "lake"].includes(tile.t)) return "海洋資源は水域専用です";
  if (x !== "sea" && !TERRAIN[tile.t].land) return "陸地専用です";
  if (x === "mine" && !tile.h) return "鉱山は丘陵にのみ建設できます";
  if (x === "lumber_mill" && tile.f !== "woods") return "製材所は森タイルにのみ建設できます";
  if (["luxury", "strategic", "strategic_mine"].includes(x) && tile.d) return "区域のあるタイルに資源・改善は置けません";
  return null;
}
function checkItem(map, rv, k, item) {
  if (isDistrictItem(item)) return checkDistrict(map, rv, k, item);
  if (isExtraItem(item)) return checkExtra(map, rv, k, item);
  return "未知の項目です";
}
function applyItem(map, k, item) {
  if (isDistrictItem(item)) return withDistrict(map, k, item);
  const t = tileOf(map, k);
  return { ...map, [k]: { ...t, x: item } };
}

function validateAll(map, rv) {
  const out = {};
  Object.entries(map).forEach(([k, v]) => {
    if (!v || !v.d) return;
    const self = { ...map, [k]: { ...v, d: null } };
    const reason = checkDistrict(self, rv, k, v.d);
    if (reason) out[k] = reason;
    if (v.x) {
      const xerr = checkExtra(self, rv, k, v.x);
      if (xerr) out[k] = out[k] || xerr;
    }
  });
  if (!citiesOf(map).length) out["__nocity"] = "都心がありません";
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
    add(c((t) => isWonderId(t.d)), 2, "遺産");
    add(c((t) => t.d === "entertainment"), 2, "娯楽複合施設");
    add(c((t) => t.d === "water_park"), 2, "ウォーターパーク");
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
// 品目ごとの静的候補フィルタ（optimize の分岐削減用）
function candidatesFor(baseMap, k, item) {
  const t = tileOf(baseMap, k);
  const isWonder = typeof item === "string" && item.startsWith("wonder:");
  const isMachu = item === "wonder:machu_picchu";
  if (t.t === "mountain" && !isMachu) return false;
  if (t.t === "blocked") return false;
  if (t.f === "oasis") return false;
  if (t.t === "flood" && !isWonder && item !== "dam") return false;
  if (t.f === "geothermal" || t.f === "natural_wonder") return false;
  if (["luxury", "strategic", "strategic_mine"].includes(t.x) && isDistrictItem(item)) return false;
  if (isDistrictItem(item)) {
    if ((item === "harbor" || item === "water_park") && !["coast", "lake"].includes(t.t)) return false;
    if (item === "dam" && t.t !== "flood") return false;
    if (item === "canal" && (!TERRAIN[t.t].land || !isFlatLand(t))) return false;
    if ((item === "aerodrome" || item === "spaceport") && !isFlatLand(t)) return false;
    if (item !== "harbor" && item !== "water_park" && !TERRAIN[t.t].land && !(typeof item === "string" && item.startsWith("wonder:") && WONDERS[item.slice(7)] && WONDERS[item.slice(7)].water)) return false;
  } else {
    const err = checkExtra(baseMap, null, k, item);
    if (err) return false;
  }
  return true;
}
function itemConstrainedness(item) {
  if (item === "dam") return 0;
  if (item === "aqueduct") return 1;
  if (item === "harbor" || item === "water_park") return 2;
  if (item === "canal") return 3;
  if (isExtraItem(item)) return 4;
  return 5;
}
function greedySeed(baseMap, rv, ordered, candFor, scoreState) {
  let map = baseMap;
  const placed = {};
  let total0 = scoreState(map);
  for (const item of ordered) {
    let bestGain = 0, bestK = null, bestMap = null;
    for (const k of candFor(item)) {
      if (placed[k]) continue;
      if (checkItem(map, rv, k, item)) continue;
      const nm = applyItem(map, k, item);
      const g = scoreState(nm) - total0;
      if (g > bestGain) { bestGain = g; bestK = k; bestMap = nm; }
    }
    if (bestK) { placed[bestK] = item; map = bestMap; total0 = scoreState(map); }
  }
  return { total: total0, placed, map };
}
function optimize(baseMap, rv, list, budget = { nodes: 800000, ms: 12000 }) {
  const t0 = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
  const now = () => ((typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now());
  const free = coords.map(({ q, r }) => key(q, r)).filter((k) => !tileOf(baseMap, k).d);
  const ordered = [...list].sort((a, b) => itemConstrainedness(a) - itemConstrainedness(b));
  const candCache = new Map();
  const candFor = (item) => {
    if (!candCache.has(item)) candCache.set(item, free.filter((k) => candidatesFor(baseMap, k, item)));
    return candCache.get(item);
  };
  const scoreState = (map) => {
    let t = 0;
    for (const k in map) if (map[k] && SCORED.has(map[k].d)) t += scoreAt(map, rv, k).value;
    return t;
  };
  let best = null, nodes = 0, timedOut = false;
  const rec = (map, i, placed) => {
    if (timedOut) return;
    if (++nodes > budget.nodes || now() - t0 > budget.ms) { timedOut = true; return; }
    if (i === ordered.length) {
      const total = scoreState(map);
      if (!best || total > best.total) best = { total, placed: { ...placed }, map };
      return;
    }
    // branch-and-bound: optimistic upper bound per remaining item (+8 each)
    if (best) {
      const remain = ordered.length - i;
      if (scoreState(map) + remain * 20 <= best.total) return;
    }
    const item = ordered[i];
    for (const k of candFor(item)) {
      if (timedOut) return;
      if (placed[k]) continue;
      if (checkItem(map, rv, k, item)) continue;
      placed[k] = item;
      rec(applyItem(map, k, item), i + 1, placed);
      delete placed[k];
    }
  };
  // greedy seed gives the bound something to prune against
  const seed = greedySeed(baseMap, rv, ordered, candFor, scoreState);
  if (Object.keys(seed.placed).length === ordered.length) best = { ...seed };
  rec(baseMap, 0, {});
  if (best) best.timedOut = timedOut;
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
    tiles: { "0,0": T("grass", { d: "city", pop: 7 }), "-1,2": T("mountain"), "0,2": T("mountain"), "2,1": T("grass", { h: true, x: "mine" }), "-2,0": T("plains", { f: "woods" }) },
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
      "0,1": T("grass", { h: true, x: "mine" }), "1,1": T("plains", { h: true, x: "mine" }), "2,0": T("plains", { x: "luxury" }),
    },
    rivers: [["2,-1", "3,-2"], ["2,-1", "2,-2"], ["2,-1", "1,-1"], ["1,-1", "1,-2"]],
    note: "ダムは氾濫原＋川が2辺以上に接する。用水路は都心隣接＋淡水源。両方に接する位置に工業地帯を置く。",
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
    tiles: { "0,0": T("grass", { d: "city", pop: 7 }), "1,0": T("grass", { d: "wonder" }), "2,-2": T("plains", { d: "wonder" }), "-1,0": T("plains", { h: true, x: "mine" }) },
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
    id: "holy-mountain",
    name: "聖山の聖地",
    goal: "聖地・キャンパス・政府複合施設を置き、信仰と科学の合計を最大化",
    allowed: ["holy_site", "campus", "government"],
    tiles: {
      "0,0": T("grass", { d: "city", pop: 7 }),
      "1,-1": T("mountain"), "0,-1": T("mountain"), "-1,0": T("mountain"),
      "1,0": T("grass", { f: "woods" }), "0,1": T("plains", { f: "woods" }), "-1,1": T("grass", { f: "woods" }),
      "-2,1": T("grass", { f: "natural_wonder" }),
    },
    rivers: [],
    note: "聖地は山岳+1、自然遺産+2、森2つごとに+1。山と森に挟まれたタイルが理想。",
  },
  {
    id: "holy-forest",
    name: "深森の聖地",
    goal: "聖地と政府複合施設で信仰隣接を最大化",
    allowed: ["holy_site", "government"],
    tiles: {
      "0,0": T("plains", { d: "city", pop: 7 }),
      "1,0": T("grass", { f: "woods" }), "1,-1": T("grass", { f: "woods" }), "0,-1": T("plains", { f: "woods" }),
      "-1,0": T("grass", { f: "woods" }), "0,1": T("grass", { f: "woods" }),
      "2,-1": T("mountain"),
    },
    rivers: [],
    note: "山がなくても森4枚で+2。聖地区域自体が森を消すため、隣の森を残す位置取りが要点。",
  },
  {
    id: "reef-campus",
    name: "礁のキャンパス",
    goal: "キャンパス・港・政府複合施設で科学と金の合計を最大化",
    allowed: ["campus", "harbor", "government"],
    tiles: {
      "0,0": T("grass", { d: "city", pop: 7 }),
      "1,0": T("coast", { f: "reef" }), "2,0": T("coast", { f: "reef" }), "1,1": T("coast"),
      "2,-1": T("coast", { x: "sea" }), "3,-1": T("coast"),
      "0,1": T("grass", { f: "rainforest" }), "-1,1": T("grass", { f: "rainforest" }),
    },
    rivers: [],
    note: "礁はキャンパス+2（港は置けない）。沿岸都市の科学定石。",
  },
  {
    id: "geothermal-campus",
    name: "地熱キャンパス",
    goal: "キャンパス・工業地帯・政府複合施設で科学と生産の合計を最大化",
    allowed: ["campus", "industrial", "government"],
    tiles: {
      "0,0": T("grass", { d: "city", pop: 7 }),
      "1,-1": T("plains", { f: "geothermal" }), "0,-1": T("plains", { f: "geothermal" }),
      "1,0": T("grass", { h: true, x: "mine" }), "2,0": T("plains", { h: true, x: "mine" }),
      "-1,0": T("grass", { x: "quarry" }),
    },
    rivers: [],
    note: "地熱孔はキャンパス+2ずつ。隣の鉱山・採石場は工業地帯の餌に。",
  },
  {
    id: "rainforest-campus",
    name: "熱帯雨林キャンパス",
    goal: "キャンパスと政府複合施設で科学隣接を最大化",
    allowed: ["campus", "government"],
    tiles: {
      "0,0": T("plains", { d: "city", pop: 7 }),
      "1,0": T("grass", { f: "rainforest" }), "1,-1": T("grass", { f: "rainforest" }), "0,-1": T("grass", { f: "rainforest" }),
      "-1,0": T("plains", { f: "rainforest" }),
      "0,-2": T("mountain"),
    },
    rivers: [],
    note: "熱帯雨林4枚で+2、山岳を足して+3。キャンパス自体のタイルの雨林は消える点に注意。",
  },
  {
    id: "city-harbor-commercial",
    name: "都心・港・商業トライアングル",
    goal: "港・商業ハブ・政府複合施設で金の合計を最大化",
    allowed: ["harbor", "commercial", "government"],
    tiles: {
      "0,0": T("grass", { d: "city", pop: 7 }),
      "-1,0": T("coast"), "-1,1": T("coast", { x: "sea" }), "-2,1": T("coast", { x: "sea" }),
      "-2,0": T("coast"), "-1,-1": T("coast"),
    },
    rivers: [["0,1", "1,1"], ["0,1", "1,0"]],
    note: "港は都心隣接+2、商業ハブは港隣接+2と川+2。3区域が互いに接する三角形が理想形。",
  },
  {
    id: "iz-full",
    name: "工業フルコンボ",
    goal: "工業地帯・用水路・ダム・運河で生産隣接を最大化",
    allowed: ["industrial", "aqueduct", "dam", "canal"],
    tiles: {
      "0,0": T("grass", { d: "city", pop: 10 }),
      "1,0": T("grass"), "2,0": T("flood"), "0,1": T("grass"), "1,1": T("grass"),
      "2,-1": T("grass"), "1,-1": T("grass"),
      "-1,2": T("coast"),
      "2,1": T("grass", { h: true, x: "mine" }), "1,2": T("plains", { x: "quarry" }), "0,2": T("grass", { x: "strategic" }),
    },
    rivers: [["1,0", "1,-1"], ["1,0", "2,0"], ["2,0", "2,-1"]],
    note: "用水路（都心隣接）・ダム（氾濫原）・運河（平地）を工業地帯の周囲に配置。3つ揃えば+6。",
  },
  {
    id: "iz-mines",
    name: "鉱山工業地帯",
    goal: "工業地帯と政府複合施設で生産隣接を最大化",
    allowed: ["industrial", "government"],
    tiles: {
      "0,0": T("grass", { d: "city", pop: 7 }),
      "1,0": T("grass", { h: true, x: "mine" }), "1,-1": T("plains", { h: true, x: "mine" }),
      "0,-1": T("grass", { h: true, x: "mine" }), "-1,0": T("grass", { h: true, x: "mine" }),
      "0,1": T("plains", { f: "woods", x: "lumber_mill" }), "1,1": T("grass", { f: "woods", x: "lumber_mill" }),
    },
    rivers: [],
    note: "鉱山4枚で+2、製材所2枚で+1。用水路・ダムがない地形での代替定石。",
  },
  {
    id: "theater-park",
    name: "劇場とウォーターパーク",
    goal: "劇場広場・ウォーターパーク・政府複合施設で文化を最大化",
    allowed: ["theater", "water_park", "government"],
    tiles: {
      "0,0": T("grass", { d: "city", pop: 7 }),
      "1,0": T("coast"), "2,0": T("coast"), "1,1": T("coast"),
      "-1,0": T("grass", { d: "wonder" }),
    },
    rivers: [],
    note: "沿岸都市では娯楽の代わりにウォーターパークで劇場+2。遺産と合わせる。",
  },
  {
    id: "theater-double",
    name: "二重遺産劇場",
    goal: "劇場広場・娯楽複合施設・政府複合施設で文化を最大化",
    allowed: ["theater", "entertainment", "government"],
    tiles: {
      "0,0": T("grass", { d: "city", pop: 7 }),
      "1,-1": T("plains", { d: "wonder" }), "0,-1": T("grass", { d: "wonder" }),
      "2,-1": T("desert", { d: "wonder:pyramids" }),
    },
    rivers: [],
    note: "3遺産に接すれば+6。娯楽・政府を添えて劇場広場の最大値を狙う。",
  },
  {
    id: "gov-hub",
    name: "政府ハブ",
    goal: "政府複合施設を中心に3区域の合計を最大化",
    allowed: ["campus", "commercial", "industrial", "government"],
    tiles: {
      "0,0": T("grass", { d: "city", pop: 10 }),
      "1,-1": T("mountain"), "2,-1": T("mountain"),
      "1,1": T("grass", { h: true, x: "mine" }), "2,0": T("plains", { h: true, x: "mine" }),
    },
    rivers: [["1,0", "2,0"], ["1,0", "1,1"]],
    note: "政府は隣接する専門区域すべてに+1。3区域の中心に置くのが基本形。",
  },
  {
    id: "harbor-sea",
    name: "漁場の港",
    goal: "港と商業ハブで金の合計を最大化",
    allowed: ["harbor", "commercial"],
    tiles: {
      "0,0": T("grass", { d: "city", pop: 7 }),
      "1,0": T("coast", { x: "sea" }), "1,-1": T("coast", { x: "sea" }), "0,-1": T("coast", { x: "sea" }),
      "2,-1": T("coast"), "2,0": T("coast"),
    },
    rivers: [],
    note: "海洋資源3つで港+5（都心隣接込み）。内陸寄りの商業ハブと接続。",
  },
  {
    id: "desert-faith",
    name: "砂漠の聖地と遺産",
    goal: "聖地・劇場広場・政府複合施設で信仰と文化の合計を最大化",
    allowed: ["holy_site", "theater", "government"],
    tiles: {
      "0,0": T("plains", { d: "city", pop: 7 }),
      "1,0": T("desert"), "2,0": T("desert"), "1,-1": T("desert"),
      "0,-1": T("mountain"),
      "2,-1": T("desert", { d: "wonder:petra" }),
    },
    rivers: [],
    note: "ペトラと聖地・劇場の複合。砂漠都市の文化・信仰定石。",
  },
  {
    id: "canal-iz",
    name: "運河工業地帯",
    goal: "工業地帯・運河・ダムで生産隣接を最大化",
    allowed: ["industrial", "canal", "dam"],
    tiles: {
      "0,0": T("grass", { d: "city", pop: 7 }),
      "1,0": T("coast"), "2,0": T("coast"),
      "1,1": T("flood"), "2,1": T("flood"),
      "0,1": T("grass", { h: true, x: "mine" }),
    },
    rivers: [["1,1", "2,1"], ["1,1", "1,0"]],
    note: "運河とダムの両方に接する工業地帯+4。沿岸・氾濫原の複合地形。",
  },
  {
    id: "twin-cities",
    name: "双子都市",
    goal: "2都市でキャンパス・聖地・劇場広場・政府複合施設を配置し合計を最大化",
    allowed: ["campus", "holy_site", "theater", "government"],
    tiles: {
      "2,-1": T("grass", { d: "city", pop: 7 }),
      "-2,2": T("grass", { d: "city", pop: 7 }),
      "3,-2": T("mountain"), "-3,3": T("mountain"), "-1,1": T("mountain"),
      "1,0": T("plains", { f: "geothermal" }), "-3,2": T("grass", { f: "natural_wonder" }),
    },
    rivers: [],
    note: "2都市それぞれ人口7（区域3枠）。聖地は自然遺産隣接で+2、森隣接で+0.5。都市間は4タイル以上離す。",
  },
];
const buildMap = (t) => JSON.parse(JSON.stringify(t.tiles));
const riverList = (t) => t.rivers.map(([a, b]) => ekey(a, b));
// テンプレートのタイル・川が盤面内か検証
templates.forEach((t) => {
  Object.keys(t.tiles).forEach((k) => {
    if (!IN_GRID.has(k)) throw new Error(`${t.id}: off-board tile ${k}`);
  });
  (t.rivers || []).forEach(([a, b]) => {
    if (!IN_GRID.has(a) || !IN_GRID.has(b)) throw new Error(`${t.id}: off-board river ${a}-${b}`);
    if (!EDGE_BY_KEY[ekey(a, b)]) throw new Error(`${t.id}: non-adjacent river ${a}-${b}`);
  });
});

export { TERRAIN, FEATURES, EXTRAS, DISTRICTS, SCORED, COUNTS_AS_DISTRICT, ONE_PER_CITY, ONE_PER_CIV, REMOVABLE_EXTRAS, REMOVABLE_FEATURES, NON_SPECIALTY, isSpecialty, RADIUS, SIZE, BOARD_W, BOARD_H, VIEWBOX, DIRS, key, parse, coords, IN_GRID, neighbors, center, hexPoints, ekey, hexDist, EDGES, EDGE_BY_KEY, buildRivers, riverSides, riverIdsOf, citiesOf, cityOf, citiesWithin, cityPop, BLANK, tileOf, withDistrict, checkDistrict, isWonderId, districtLabel, isFlatLand, HILLS_SHORT, isDistrictItem, isExtraItem, checkExtra, checkItem, applyItem, validateAll, scoreAt, allScores, totalOf, candidatesFor, itemConstrainedness, optimize, T, templates, buildMap, riverList, WONDERS };
