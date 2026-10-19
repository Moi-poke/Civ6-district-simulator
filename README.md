# Civ6 区域パズル・ラボ

Civilization 6 (Gathering Storm) の**区域 (district) 隣接ボーナス**を学習・探索するためのインタラクティブ・ラボです。
React + Vite で構築し、GitHub Pages で静的配信できます。

- **自由配置モード**: 地形・地物・資源・川・区域を自由に編集し、隣接合計を確認
- **問題モード**: 6 つの定石テンプレートで最適配置を当てるパズル
- **最適化探索**: 区域＋資源/改善を最大 4 項目まで総当たりで最適配置を提案

> 文明固有能力・指導者固有能力・政策カード・建造物による倍加は**未実装**（標準ルールのみ）。
> 最終的な正確性はゲーム内プレビューで確認してください。

## 起動

```bash
npm install
npm run dev      # 開発サーバー
npm run build    # 本番ビルド (dist/)
npm run preview  # ビルド結果の確認
npm run lint     # oxlint
```

## GitHub Pages デプロイ

`.github/workflows/deploy.yml` が `main`/`master` への push で自動ビルド・デプロイします。
リポジトリの Settings → Pages → Source を **GitHub Actions** に設定してください。
`vite.config.js` の `base: './'` により任意のリポジトリ名で動作します。

## 仕様

### 盤面

- ヘクスグリッド（axial 座標 `q, r`、半径 3、`|q + r| <= 3`）= **37 タイル**
- 複数都市対応: 都心は陸地にのみ配置、山岳・自然遺産・使用不可タイルには不可（高級・戦略資源・地熱孔の上は可で例外）。都心同士は 4 タイル以上離す。区域はいずれかの都心から 3 タイル以内。
- 1 タイル = 地形 + 地物(任意) + 資源/改善(任意) + 区域(任意)。使用不可タイル（`blocked`）で他文明の影響などを表現可能。

### 地形 (`TERRAIN`)

| id | 日本語 | 陸/水 |
|---|---|---|
| grass | 草原 | 陸 |
| plains | 平原 | 陸 |
| desert | 砂漠 | 陸 |
| hills | 丘陵 | 陸 |
| flood | 氾濫原 | 陸 |
| mountain | 山岳 | 陸 |
| coast | 沿岸 | 水 |
| lake | 湖 | 水 |
| blocked | 使用不可 | 陸扱い（配置不可） |

### 地物 (`FEATURES`)

森 / 熱帯雨林 / 湿原 / オアシス / 地熱孔 / 礁 / 自然遺産

### 資源・改善 (`EXTRAS`)

鉱山 / 採石場 / 戦略資源（未改善） / 戦略資源＋鉱山 / 高級資源 / 海洋資源 / 製材所

### 区域 (`DISTRICTS`)

都心 / キャンパス / 聖地 / 商業ハブ / 港 / 工業地帯 / 劇場広場 / 政府複合施設 / 用水路 / ダム / 娯楽複合施設 / ウォーターパーク / 運河 / 遺産

### 川

- ヘクスの**辺**の集合として表現（`EDGES`）
- 連結成分（頂点共有）で「同じ川」を判定（`buildRivers`）
- 編集モードで辺クリックで追加/削除

### 配置制限 (`checkDistrict`)

- 都心: 陸地のみ、山岳/自然遺産/使用不可不可（高級・戦略・地熱孔は可）、他都心と 4 タイル以上
- 山岳 / 地熱孔 / 自然遺産 / 高級・戦略資源 / 使用不可タイルには区域・遺産を置けない
- **港 / ウォーターパーク**: 沿岸または湖タイル、礁の上不可、陸地隣接が必須
- **運河**: 陸地、水域隣接、かつ都心隣接または 2 水域に接する
- その他区域: 水域不可
- **用水路**: 都心隣接 + 都心側以外の川/湖/オアシス/山岳に隣接
- **ダム**: 氾濫原 + 川が 2 辺以上に接 + 1 本の川に 1 つまで
- 区域はいずれかの都心から 3 タイル以内
- 専門区域は人口スロット制: `1 + floor((pop-1)/3)`（専門区域 = キャンパス/聖地/商業/港/工業/劇場/娯楽/WP/政府複合施設。非専門 = 用水路/ダム/運河）
- 専門区域・娯楽・ウォーターパークは 1 都市 1 つ、政府複合施設は 1 文明 1 つ
- 区域設置時、撤去可能な改善・地物 (mine/quarry/sea/lumber_mill, woods/rainforest/marsh) は自動撤去

### 隣接ボーナス (`scoreAt`, Civilopedia GS 準拠)

対象区域: キャンパス / 聖地 / 商業ハブ / 港 / 工業地帯 / 劇場広場

| 区域 | ボーナス |
|---|---|
| キャンパス | 山岳 +1、礁 +2、地熱孔 +2、熱帯雨林 (2 つごとに +1)、区域 (2 つごとに +1) |
| 聖地 | 山岳 +1、自然遺産 +2、森 (2 つごとに +1)、区域 (2 つごとに +1) |
| 商業ハブ | 川に接 +2（1 回）、港隣接 +2、区域 (2 つごとに +1) |
| 港 | 都心隣接 +2、海洋資源 +1、区域 (2 つごとに +1) |
| 工業地帯 | 用水路 +2、ダム +2、運河 +2、採石場 +1、戦略資源 +1、鉱山 (2 つごとに +1)、製材所 (2 つごとに +1)、区域 (2 つごとに +1) |
| 劇場広場 | 遺産 +2、娯楽複合施設 +2、ウォーターパーク +2、区域 (2 つごとに +1) |

共通:
- 政府複合施設隣接 +1（区域 minor とは別に加算）
- 隣接区域 (都心・用水路・ダム等) (2 つごとに +1)、種別ごとに個別 floor

### 最適化 (`optimize`)

- 入力: ベースマップ + 配置する項目リスト（区域と資源/改善を混在可）
- 空きタイルに総当たりで配置、`checkItem` を逐次適用
- 合計隣接ボーナス (SCORED 区域のみ) を最大化
- UI では最大 4 項目まで選択可能

### 問題テンプレート (6 種)

| id | 名前 | 配置区域 |
|---|---|---|
| river-hub | 川沿い商業ハブ三角形 | commercial, campus, government |
| iz-dam | 工業地帯ダイヤ | industrial, aqueduct, dam |
| campus-pass | 山間キャンパス | campus, government |
| culture | 遺産と劇場広場 | theater, entertainment, government |
| harbor-hub | 港と商業ハブ | harbor, commercial |
| twin-cities | 双子都市 | campus, holy_site, theater, government |

各テンプレートは地形・川・固定区域のみ定義し、正解 (最適配置) は `optimize` で算出します。

### 未反映・簡略化

- 盤面外周の辺の川、運河の水域接続厳密判定
- 地区 (Encampment/Spaceport/Aerodrome/Preserve)、野営地、宇宙基地
- 遺産ごとの固有設置条件、自然遺産の固有効果
- 文明・指導者固有能力、政策カード・建造物による倍加、都市国ボーナス、人口自動成長
- 「同じ川」は辺のつながりで判定（実ゲームは川の名前）

### 根拠

- 隣接値：Civilopedia（Gathering Storm）各区域ページ、Civ6 Planner 隣接表、civ6lib SKILL.md
- ダム・用水路・人口スロット・距離制限：Civilopedia／Civ Wiki／civ6lib

## ディレクトリ構成

```
.
├── src/
│   ├── App.jsx                 # 全ロジック・UI
│   ├── main.jsx
│   ├── index.css
│   └── components/ui/          # Button, Card (shadcn 風の最小実装)
├── skills/
│   ├── civ6lib/                # Civ6 ルール skill (SKILL.md + scripts)
│   └── hex-grid-spatial/
├── public/                      # favicon.svg（静的配信）
├── index.html
├── .github/workflows/deploy.yml
├── vite.config.js
├── package.json
├── .oxlintrc.json
├── .gitignore
├── AGENTS.md
└── README.md
```

## ライセンス

個人学習用プロジェクト。Civilization VI は Firaxis Games / 2K の商標です。
