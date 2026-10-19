import { describe, expect, test } from "vitest";
import {
  COUNTS_AS_DISTRICT, ONE_PER_CITY, ONE_PER_CIV,
  isSpecialty, buildRivers, checkDistrict, checkExtra, validateAll, scoreAt, optimize,
  templates, hexDist, ekey,
} from "./rules.js";

const city = (pop = 7) => ({ t: "grass", d: "city", pop });
const R = (list = []) => buildRivers(list);

describe("civ6lib parity: uniqueness + slots", () => {
  test("aqueduct/dam/canal/spaceport/neighborhood are non-specialty", () => {
    for (const d of ["aqueduct", "dam", "canal", "spaceport", "neighborhood"]) {
      expect(isSpecialty(d)).toBe(false);
    }
    for (const d of ["campus", "holy_site", "government", "diplomatic", "encampment", "preserve", "aerodrome"]) {
      expect(isSpecialty(d)).toBe(true);
    }
  });
  test("encampment/aerodrome/preserve are one-per-city; neighborhood is not", () => {
    expect(ONE_PER_CITY.has("encampment")).toBe(true);
    expect(ONE_PER_CITY.has("aerodrome")).toBe(true);
    expect(ONE_PER_CITY.has("preserve")).toBe(true);
    expect(ONE_PER_CITY.has("neighborhood")).toBe(false);
    expect(ONE_PER_CITY.has("aqueduct")).toBe(false);
    expect(ONE_PER_CIV.has("government")).toBe(true);
    expect(ONE_PER_CIV.has("diplomatic")).toBe(true);
  });
  test("all placeable districts count for district minor; wonders do not", () => {
    for (const d of ["encampment", "aerodrome", "spaceport", "neighborhood", "preserve", "diplomatic"]) {
      expect(COUNTS_AS_DISTRICT.has(d)).toBe(true);
    }
    expect(COUNTS_AS_DISTRICT.has("wonder")).toBe(false);
  });
});

describe("placement: new districts", () => {
  test("encampment/preserve cannot be adjacent to city", () => {
    const map = { "0,0": city() };
    expect(checkDistrict(map, R(), "1,0", "encampment")).toMatch(/都心に隣接できません/);
    expect(checkDistrict(map, R(), "1,0", "preserve")).toMatch(/都心に隣接できません/);
    expect(checkDistrict(map, R(), "2,0", "encampment")).toBeNull();
    expect(checkDistrict(map, R(), "2,0", "preserve")).toBeNull();
  });
  test("aerodrome/spaceport require flat land", () => {
    const map = { "0,0": city(), "1,0": { t: "grass", h: true } };
    expect(checkDistrict(map, R(), "1,0", "aerodrome")).toMatch(/平地/);
    expect(checkDistrict(map, R(), "1,0", "spaceport")).toMatch(/平地/);
    expect(checkDistrict(map, R(), "-1,0", "aerodrome")).toBeNull();
  });
  test("diplomatic is one per civilization", () => {
    const map = { "0,0": city(), "1,0": { t: "grass", d: "diplomatic" } };
    expect(checkDistrict(map, R(), "2,0", "diplomatic")).toMatch(/1文明に1つ/);
  });
  test("neighborhood can repeat in one city", () => {
    const map = { "0,0": city(10), "1,0": { t: "grass", d: "neighborhood" } };
    expect(checkDistrict(map, R(), "2,0", "neighborhood")).toBeNull();
  });
  test("new districts consume pop slots (specialty) or not", () => {
    const map = { "0,0": city(1), "1,0": { t: "grass", d: "encampment" } };
    expect(checkDistrict(map, R(), "2,0", "campus")).toMatch(/スロット/);
    expect(checkDistrict(map, R(), "2,0", "neighborhood")).toBeNull();
  });
});

describe("placement: wonders", () => {
  test("pyramids needs desert/flood; oracle needs hills flag", () => {
    const map = { "0,0": city(), "1,0": { t: "desert" }, "2,0": { t: "plains", h: true } };
    expect(checkDistrict(map, R(), "1,0", "wonder:pyramids")).toBeNull();
    expect(checkDistrict(map, R(), "0,1", "wonder:pyramids")).toMatch(/砂漠または氾濫原/);
    expect(checkDistrict(map, R(), "2,0", "wonder:oracle")).toBeNull();
    expect(checkDistrict(map, R(), "0,1", "wonder:oracle")).toMatch(/丘陵/);
  });
  test("colosseum needs flat land adjacent to entertainment", () => {
    const map = { "0,0": city(), "-1,0": { t: "grass", d: "entertainment" } };
    expect(checkDistrict(map, R(), "-2,0", "wonder:colosseum")).toBeNull();
    expect(checkDistrict(map, R(), "1,0", "wonder:colosseum")).toMatch(/娯楽複合施設に隣接/);
  });
  test("water wonders need coast + land + harbor", () => {
    const map = { "0,0": city(), "-1,0": { t: "coast", d: "harbor" }, "-1,1": { t: "coast" } };
    expect(checkDistrict(map, R(), "-1,1", "wonder:colossus")).toBeNull();
    expect(checkDistrict(map, R(), "1,0", "wonder:colossus")).toMatch(/沿岸/);
  });
  test("machu picchu goes on mountains", () => {
    const map = { "0,0": city(), "1,0": { t: "mountain" } };
    expect(checkDistrict(map, R(), "1,0", "wonder:machu_picchu")).toBeNull();
    expect(checkDistrict(map, R(), "0,1", "wonder:machu_picchu")).toMatch(/山岳/);
  });
});

describe("adjacency", () => {
  test("per-type flooring: 1 rainforest + 1 district = +0", () => {
    // campus at 2,0: neighbors are 0,0(city) excluded below... use off-center campus
    const map = {
      "0,0": city(10),
      "-2,0": { t: "grass", d: "campus" },
      "-3,0": { t: "grass", f: "rainforest" },
      "-2,-1": { t: "grass", d: "commercial" },
    };
    const s = scoreAt(map, R(), "-2,0");
    expect(s.value).toBe(0);
  });
  test("holy site: mountain +1, natural wonder +2, woods minor", () => {
    const map = {
      "0,0": city(10),
      "1,0": { t: "grass", d: "holy_site" },
      "2,0": { t: "mountain" },
      "1,-1": { t: "grass", f: "natural_wonder" },
      "0,1": { t: "grass", f: "woods" },
      "1,1": { t: "grass", f: "woods" },
    };
    const s = scoreAt(map, R(), "1,0");
    expect(s.value).toBe(1 + 2 + 1);
  });
  test("government +1 is additive with district minor", () => {
    const map = {
      "0,0": city(10),
      "1,0": { t: "grass", d: "campus" },
      "2,0": { t: "grass", d: "government" },
      "1,-1": { t: "grass", d: "commercial" },
    };
    // gov +1 (adjacent) + district minor floor(2/2)=1
    const s = scoreAt(map, R(), "1,0");
    expect(s.value).toBe(2);
  });
  test("diplomatic counts for district minor but gives no +1", () => {
    const map = {
      "0,0": city(10),
      "1,0": { t: "grass", d: "campus" },
      "2,0": { t: "grass", d: "diplomatic" },
      "1,-1": { t: "grass", d: "commercial" },
    };
    const s = scoreAt(map, R(), "1,0");
    expect(s.value).toBe(1); // minor floor(2/2) only
    expect(s.reasons.join("")).not.toMatch(/外交街/);
  });
  test("theater counts wonder:<id> adjacency", () => {
    const map = {
      "0,0": city(10),
      "1,0": { t: "grass", d: "theater" },
      "2,0": { t: "desert", d: "wonder:pyramids" },
    };
    expect(scoreAt(map, R(), "1,0").value).toBe(2);
  });
});

describe("hills flag + tundra/snow", () => {
  test("jebel barkal needs desert hills", () => {
    const map = { "0,0": city(), "1,0": { t: "desert", h: true }, "2,0": { t: "desert" }, "0,1": { t: "plains", h: true } };
    expect(checkDistrict(map, R(), "1,0", "wonder:jebel_barkal")).toBeNull();
    expect(checkDistrict(map, R(), "2,0", "wonder:jebel_barkal")).toMatch(/砂漠の丘陵/);
    expect(checkDistrict(map, R(), "0,1", "wonder:jebel_barkal")).toMatch(/砂漠の丘陵/);
  });
  test("mine needs hills flag on any base terrain", () => {
    const map = { "0,0": city(), "1,0": { t: "desert", h: true } };
    expect(checkExtra(map, R(), "1,0", "mine")).toBeNull();
    expect(checkExtra(map, R(), "0,1", "mine")).toMatch(/丘陵/);
  });
  test("tundra/snow are placeable land", () => {
    const map = { "0,0": city(), "1,0": { t: "tundra" }, "2,0": { t: "snow" } };
    expect(checkDistrict(map, R(), "1,0", "campus")).toBeNull();
    expect(checkDistrict(map, R(), "2,0", "holy_site")).toBeNull();
  });
});

describe("validateAll + extras", () => {
  test("invalid items are flagged; valid maps pass", () => {
    const bad = { "0,0": city(), "1,0": { t: "mountain", d: "campus" } };
    expect(Object.keys(validateAll(bad, R()))).toContain("1,0");
    const good = { "0,0": city(), "1,0": { t: "grass", d: "campus" } };
    expect(validateAll(good, R())).toEqual({});
  });
  test("checkExtra blocks city-district tiles and incompatible terrain", () => {
    const map = { "0,0": city(), "1,0": { t: "grass", d: "campus" } };
    expect(checkExtra(map, R(), "1,0", "mine")).toMatch(/区域のあるタイル/);
    const map2 = { "0,0": city(), "1,0": { t: "grass" } };
    expect(checkExtra(map2, R(), "1,0", "mine")).toMatch(/丘陵/);
  });
});

describe("templates + solver", () => {
  test("all templates have valid city spacing", () => {
    for (const t of templates) {
      const cities = Object.entries(t.tiles).filter(([, v]) => v.d === "city").map(([k]) => k);
      expect(cities.length).toBeGreaterThan(0);
      for (let i = 0; i < cities.length; i++)
        for (let j = i + 1; j < cities.length; j++)
          expect(hexDist(cities[i], cities[j])).toBeGreaterThanOrEqual(4);
    }
  });
  test("iz-dam optimum finds industrial adjacent to aqueduct+dam", () => {
    const t = templates.find((x) => x.id === "iz-dam");
    const base = JSON.parse(JSON.stringify(t.tiles));
    const rv = buildRivers(t.rivers.map(([a, b]) => ekey(a, b)));
    const sol = optimize(base, rv, t.allowed, { nodes: 200000, ms: 8000 });
    expect(sol).not.toBeNull();
    expect(sol.total).toBeGreaterThanOrEqual(6);
  });
  test("twin-cities finds a solution within budget", () => {
    const t = templates.find((x) => x.id === "twin-cities");
    const base = JSON.parse(JSON.stringify(t.tiles));
    const rv = buildRivers(t.rivers.map(([a, b]) => ekey(a, b)));
    const sol = optimize(base, rv, t.allowed, { nodes: 800000, ms: 15000 });
    expect(sol).not.toBeNull();
  });
});
