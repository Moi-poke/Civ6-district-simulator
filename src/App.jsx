import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Lightbulb, Trophy, CheckCircle2, Info, ChevronRight, Waves, AlertTriangle, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SolverWorker from "./solver.worker.js?worker";


import { TERRAIN, FEATURES, EXTRAS, DISTRICTS, REMOVABLE_EXTRAS, REMOVABLE_FEATURES, isSpecialty, SIZE, key, coords, center, hexPoints, hexDist, EDGES, buildRivers, riverSides, citiesOf, cityOf, tileOf, withDistrict, checkDistrict, validateAll, allScores, optimize, templates, buildMap, riverList, WONDERS } from "./rules.js";


/* =========================================================
   描画
   ========================================================= */
function HexTile({ k: _k, q, r, tile, selected, invalid, ghost, onClick }) {
  const { x, y } = center(q, r);
  const base = TERRAIN[tile.t];
  const dist = dInfo(tile.d);
  return (
    <g onClick={onClick} className="cursor-pointer">
      <polygon points={hexPoints(x, y, SIZE)} fill={base.color} stroke="#ffffff" strokeWidth={1.5} />
      {dist && (
        <motion.polygon key={tile.d} initial={{ opacity: 0 }} animate={{ opacity: 1 }} points={hexPoints(x, y, SIZE * 0.72)} fill={dist.color} stroke="#0f172a" strokeOpacity={0.35} strokeWidth={1} />
      )}
      {ghost && <polygon points={hexPoints(x, y, SIZE * 0.72)} fill={(dInfo(ghost) || EXTRAS[ghost] || {}).color || "#94a3b8"} fillOpacity={0.55} stroke="#0f172a" strokeDasharray="4 3" strokeWidth={1.5} />}
      {invalid && <polygon points={hexPoints(x, y, SIZE - 3)} fill="none" stroke="#dc2626" strokeWidth={3} strokeDasharray="6 4" />}
      {selected && <polygon points={hexPoints(x, y, SIZE - 2)} fill="none" stroke="#0f172a" strokeWidth={3.5} />}
    </g>
  );
}

function HexLabel({ q, r, tile, score, ghost }) {
  const { x, y } = center(q, r);
  const gIsExtra = ghost && !!EXTRAS[ghost];
  const main = tile.d ? (dInfo(tile.d) || {}).short : ghost ? ((dInfo(ghost) || {}).short || TERRAIN[tile.t].short) : TERRAIN[tile.t].short;
  const sub = [tile.f && FEATURES[tile.f].short, tile.x && EXTRAS[tile.x].short, (!tile.x && gIsExtra) && `(${EXTRAS[ghost].short})`].filter(Boolean).join("・");
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
const dInfo = (id) => {
  if (!id) return null;
  if (DISTRICTS[id]) return DISTRICTS[id];
  if (typeof id === "string" && id.startsWith("wonder:")) {
    const w = WONDERS[id.slice(7)];
    if (w) return { label: w.label, short: w.short, color: DISTRICTS.wonder.color };
  }
  return null;
};

const TOOL_TABS = [
  { id: "d", label: "区域" },
  { id: "t", label: "地形" },
  { id: "f", label: "地物" },
  { id: "x", label: "資源・改善" },
  { id: "river", label: "川" },
];
const PLACEABLE = ["city", "campus", "holy_site", "commercial", "harbor", "industrial", "theater", "government", "diplomatic", "aqueduct", "dam", "entertainment", "water_park", "canal", "encampment", "aerodrome", "spaceport", "neighborhood", "preserve", "wonder"];
const WONDER_IDS = ["wonder", ...Object.keys(WONDERS).map((w) => "wonder:" + w)];
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
  const [optExtraPick, setOptExtraPick] = useState([]);
  const [solving, setSolving] = useState(false);
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
  const ghostScores = useMemo(() => (ghost ? allScores(ghost.map, rv) : null), [ghost, rv]);
  const best = useMemo(() => (puzzle ? optimize(puzzleBase, puzzleRivers, template.allowed) : null), [puzzle, puzzleBase, puzzleRivers, template]);

  const sel = selected ? tileOf(activeMap, selected) : null;
  const selScore = selected ? scores[selected] : null;

  function paint(k) {
    setSelected(k);
    setMsg(null);
    setGhost(null);
    if (tab === "river") return;
    const tile = tileOf(activeMap, k);

    if (puzzle) {
      if (puzzleBase[k] && puzzleBase[k].d === "city") return setMsg("この都心は問題の固定配置です");
      if (puzzleBase[k] && puzzleBase[k].d && puzzleBase[k].d !== "city") return setMsg("この区域・遺産は問題の固定配置です");
      if (brush === "erase") { setChecked(false); return setAnswer((a) => { const n = { ...a }; delete n[k]; return n; }); }
      if (brush === "city") return setMsg("問題モードでは都心は固定です");
      if (!template.allowed.includes(brush)) return setMsg("この問題では使えない区域です");
      const without = { ...answer };
      delete without[k];
      Object.keys(without).forEach((kk) => { if (without[kk] === brush) delete without[kk]; });
      let m = puzzleBase;
      Object.entries(without).forEach(([kk, d]) => (m = withDistrict(m, kk, d)));
      const reason = checkDistrict(m, rv, k, brush);
      if (reason) return setMsg(`置けません：${reason}`);
      setChecked(false);
      return setAnswer({ ...without, [k]: brush });
    }

    if (tab === "d") {
      if (brush === "erase") {
        if (tile.d === "city") {
          if (citiesOf(activeMap).length <= 1) return setMsg("最後の都心は消せません");
          return setMap((m) => { const n = { ...m }; delete n[k]; return n; });
        }
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
      if (tile.d === "city" && brush === "blocked") return setMsg("使用不可タイルに都心は建設できません");
      const land = TERRAIN[brush].land;
      const next = { ...tile, t: brush };
      if (brush === "mountain") { next.f = null; next.x = null; if (next.d !== "city") next.d = null; }
      if (land && next.f === "reef") next.f = null;
      if (!land && next.f && next.f !== "reef") next.f = null;
      if (land && next.x === "sea") next.x = null;
      if (!land && next.x && next.x !== "sea") next.x = null;
      if (next.f === "oasis" && brush !== "desert") next.f = null;
      if (next.x === "mine" && brush !== "hills") next.x = null;
      if (next.x === "lumber_mill" && next.f !== "woods") next.x = null; // 製材所は森前提
      if (brush === "flood" && !riverSides(rv, k).some(Boolean)) setMsg("注意：氾濫原は通常、川に接するタイルに生成されます");
      return setMap((m) => ({ ...m, [k]: next }));
    }
    if (tab === "f") {
      if (brush === "none") return setMap((m) => ({ ...m, [k]: { ...tile, f: null } }));
      const land = TERRAIN[tile.t].land;
      if (tile.t === "mountain") return setMsg("山岳には地物を置けません");
      if (tile.t === "blocked") return setMsg("使用不可タイルには地物を置けません");
      if (tile.d && tile.d !== "city") return setMsg("区域のあるタイルに地物は置けません");
      if (brush === "reef" && tile.t !== "coast") return setMsg("礁は沿岸タイル専用です");
      if (brush !== "reef" && brush !== "natural_wonder" && !land) return setMsg(`${FEATURES[brush].label}は陸地専用です`);
      if (brush === "oasis" && tile.t !== "desert") return setMsg("オアシスは砂漠タイル専用です");
      if (tile.d && tile.d !== "city" && brush === "geothermal") return setMsg("区域のあるタイルに地熱孔は置けません");
      if (tile.d && tile.d !== "city" && brush === "natural_wonder") return setMsg("区域のあるタイルに自然遺産は置けません");
      const nextF = { ...tile, f: brush };
      if (brush !== "woods" && nextF.x === "lumber_mill") nextF.x = null;
      return setMap((m) => ({ ...m, [k]: nextF }));
    }
    if (tab === "x") {
      if (brush === "none") return setMap((m) => ({ ...m, [k]: { ...tile, x: null } }));
      const land = TERRAIN[tile.t].land;
      if (tile.t === "mountain") return setMsg("山岳には資源・改善を置けません");
      if (tile.t === "blocked") return setMsg("使用不可タイルには資源・改善を置けません");
      if (brush === "sea" && land) return setMsg("海洋資源は水域専用です");
      if (brush !== "sea" && !land) return setMsg(`${EXTRAS[brush].label}は陸地専用です`);
      if (brush === "mine" && tile.t !== "hills") return setMsg("鉱山は丘陵にのみ建設できます");
      if (brush === "lumber_mill" && tile.f !== "woods") return setMsg("製材所は森タイルにのみ建設できます");
      if (tile.d && tile.d !== "city") return setMsg("区域のあるタイルに資源・改善は置けません");
      if (tile.x && tile.x !== brush && tile.d !== "city") return setMsg("既存の資源・改善があります（先に消去してください）");
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
      const sol = (puzzle && t.id === template.id && best) ? best : optimize(base, r, t.allowed);
      setMode("sandbox");
      setRivers(riverList(t));
      setMap(sol ? sol.map : base);
      setMsg(sol ? `最適配置：隣接ボーナス合計 +${sol.total}${sol.timedOut ? "（暫定解）" : ""}` : "有効な配置が見つかりません");
    }
  }

  function runOptimize() {
    const picks = [...optPick, ...optExtraPick];
    if (!picks.length) return setMsg("探索する区域・資源/改善を選んでください");
    if (solving) return;
    setSolving(true);
    setMsg("探索中…（盤面は操作可能です）");
    const worker = new SolverWorker();
    worker.onmessage = (e) => {
      setSolving(false);
      worker.terminate();
      const sol = e.data && e.data.ok ? e.data.sol : null;
      if (!sol) { setGhost(null); return setMsg("条件を満たす配置がありません（設置制限・人口スロット・1都市1つ制限を確認）"); }
      setGhost(sol);
      setMsg(`探索完了：盤面全体の隣接合計 +${sol.total}（点線が提案位置）${sol.timedOut ? " ※時間切れのため暫定解です" : ""}`);
    };
    worker.onerror = () => { setSolving(false); worker.terminate(); setMsg("探索中にエラーが発生しました"); };
    worker.postMessage({ baseMap: map, rivers: [...rv.set], list: picks, budget: { nodes: 1500000, ms: 20000 } });
  }

  const brushList = (() => {
    if (puzzle) return [...template.allowed.map((id) => ({ id, ...dInfo(id) })), { id: "erase", label: "区域を消す", short: "×", color: "#e2e8f0" }];
    if (tab === "d") return [...PLACEABLE.map((id) => ({ id, ...dInfo(id) })), { id: "erase", label: "区域を消す", short: "×", color: "#e2e8f0" }];
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
    setGhost(null);
    setMap((m) => ({ ...m, [k]: { ...tileOf(m, k), pop: clamped } }));
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-5">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-cyan-300 text-sm font-bold tracking-widest">GATHERING STORM / 標準ルール学習用</div>
            <h1 className="text-3xl md:text-5xl font-black mt-1">Civ6 区域配置シミュレーター</h1>
            <p className="text-slate-400 mt-2">川はヘクスの「辺」、設置条件は区域ごとに判定。置けない場所は理由を表示します。複数都市対応（間隔4以上）。</p>
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
                <>
                <div className="grid grid-cols-2 gap-2">
                  {brushList.map((b) => (
                    <button key={b.id} onClick={() => setBrush(b.id)}
                      className={`rounded-xl p-2 text-left text-xs font-bold border ${brush === b.id ? "border-white ring-2 ring-cyan-400" : "border-slate-700"}`}
                      style={{ background: b.color, color: "#0f172a" }}>{b.short} {b.label}</button>
                  ))}
                </div>
                {tab === "d" && !puzzle && (
                  <div className="mt-2">
                    <div className="text-xs text-slate-400 mb-1">遺産（固有条件）</div>
                    <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
                      {WONDER_IDS.filter((id) => id !== "wonder").map((id) => {
                        const w = dInfo(id);
                        return (
                          <button key={id} onClick={() => setBrush(id)}
                            className={`px-2 py-1 rounded-lg text-xs font-bold border ${brush === id ? "border-white ring-2 ring-cyan-400" : "border-slate-700"}`}
                            style={{ background: w.color, color: "#0f172a" }} title={WONDERS[id.slice(7)].req}>{w.short} {w.label}</button>
                        );
                      })}
                    </div>
                    {(brush === "wonder" || (typeof brush === "string" && brush.startsWith("wonder:"))) && (
                      <div className="text-xs text-slate-400 mt-1">{brush === "wonder" ? "汎用遺産（条件なし）" : WONDERS[brush.slice(7)].req}</div>
                    )}
                  </div>
                )}
                </>
              )}
              <Button className="w-full bg-slate-700" onClick={() => { setChecked(false); setGhost(null); setMsg(null); if (puzzle) setAnswer({}); else { setMap({ "0,0": { t: "grass", d: "city", pop: 7 } }); setRivers([]); } }}>
                <RotateCcw className="w-4 h-4 mr-2" />{puzzle ? "解答をリセット" : "盤面を白紙に"}
              </Button>

              {!puzzle && (
                <div className="border-t border-slate-700 pt-3">
                  <div className="font-bold text-sm flex items-center gap-2"><Search className="w-4 h-4 text-emerald-300" />最適配置を探索（区域＋資源/改善、最大6）</div>
                  <div className="text-xs text-slate-400 mt-1">区域</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {OPTIMIZABLE.map((d) => {
                      const on = optPick.includes(d);
                      const total = optPick.length + optExtraPick.length;
                      return (
                        <button key={d} onClick={() => { if (on) setOptPick((p) => p.filter((x) => x !== d)); else if (total < 6) setOptPick((p) => [...p, d]); else setMsg("探索は最大6項目までです"); }}
                          className={`px-2 py-1 rounded-lg text-xs font-bold border ${on ? "border-emerald-300 bg-emerald-500 text-slate-950" : "border-slate-600 text-slate-300"}`}>{DISTRICTS[d].label}</button>
                      );
                    })}
                  </div>
                  <div className="text-xs text-slate-400 mt-2">資源・改善</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.keys(EXTRAS).map((x) => {
                      const on = optExtraPick.includes(x);
                      const total = optPick.length + optExtraPick.length;
                      return (
                        <button key={x} onClick={() => { if (on) setOptExtraPick((p) => p.filter((v) => v !== x)); else if (total < 6) setOptExtraPick((p) => [...p, x]); else setMsg("探索は最大6項目までです"); }}
                          className={`px-2 py-1 rounded-lg text-xs font-bold border ${on ? "border-amber-300 bg-amber-500 text-slate-950" : "border-slate-600 text-slate-300"}`}>{EXTRAS[x].short} {EXTRAS[x].label}</button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" className="bg-emerald-600 flex-1" onClick={runOptimize} disabled={solving}>{solving ? "探索中…" : "探索"}</Button>
                    {ghost && <Button size="sm" className="bg-cyan-600 flex-1" onClick={() => { setMap(ghost.map); setGhost(null); setMsg(`適用しました：合計 +${ghost.total}`); }}>適用</Button>}
                    {ghost && <Button size="sm" className="bg-slate-600 flex-1" onClick={() => { setGhost(null); setMsg("提案を破棄しました"); }}>破棄</Button>}
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
                  <div className="text-xs mt-1 text-slate-400">使う区域：{template.allowed.map((d) => (dInfo(d) || {}).label).join("・")}</div>
                </div>
              )}
              <div className="absolute top-3 right-3 z-10 rounded-xl bg-slate-950/90 px-3 py-2 border border-slate-600 text-right">
                <div className="text-xs text-slate-400">盤面の隣接合計</div>
                <div className="text-2xl font-black text-cyan-300">+{total}{puzzle && best ? <span className="text-sm text-slate-400"> / 最適 {checked ? `+${best.total}` : "???"}</span> : null}</div>
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
                  const s = ghost ? (ghostScores ? ghostScores[k] : null) : scores[k];
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
                      <div>区域：{sel.d ? (dInfo(sel.d) || {}).label : "なし"}</div>
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

            <Card className="bg-slate-900 border-slate-700 text-slate-100">
              <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-cyan-300" />都市一覧</CardTitle></CardHeader>
              <CardContent>
                {citiesOf(activeMap).length ? (
                  <ul className="text-sm space-y-1">
                    {citiesOf(activeMap).map((c, i) => {
                      const pop = cityPop(activeMap, c);
                      const max = 1 + Math.floor((pop - 1) / 3);
                      const used = Object.keys(activeMap).filter((kk) => activeMap[kk] && activeMap[kk].d && isSpecialty(activeMap[kk].d) && cityOf(kk, activeMap) === c).length;
                      return <li key={c}>都市{i + 1} ({c}) 人口 {pop} ／ 区域枠 {used}/{max}</li>;
                    })}
                  </ul>
                ) : <p className="text-slate-400 text-sm">都心がありません</p>}
              </CardContent>
            </Card>

            {puzzle && (
              <Card className="bg-slate-900 border-amber-500/50 text-slate-100">
                <CardContent className="pt-6 space-y-3">
                  <ul className="text-sm space-y-1">
                    {template.allowed.map((d) => (
                      <li key={d} className={Object.values(answer).includes(d) ? "text-emerald-300" : "text-slate-400"}>{Object.values(answer).includes(d) ? "✓" : "○"} {(dInfo(d) || {}).label}</li>
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
                    {!puzzle && <Button size="sm" onClick={() => loadTemplate(t, false)} className="bg-cyan-600">最適配置を見る</Button>}
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
              <p className="text-slate-400 mt-1">山岳・自然遺産・高級/戦略資源には不可（都心は例外で陸地のみ）。港/ウォーターパークは陸地隣接の沿岸/湖。用水路は都心隣接＋川/湖/オアシス/山岳。ダムは氾濫原＋川が2辺以上、1本の川に1つ。運河は水域隣接の陸地（都心隣接または2水域に接する）。都心同士は4タイル以上。区域は都心から3タイル以内。専門区域は人口スロット制（1+floor((pop-1)/3)）。専門区域・娯楽・ウォーターパークは1都市1つ、政府複合施設は1文明1つ。用水路・ダムは複数可。</p>
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

