# Civ6 区域パズル・ラボ

Civilization 6 (Gathering Storm) の**区域 (district) 隣接ボーナス**を学習・探索するためのインタラクティブ・ラボです。
React + Vite で構築し、GitHub Pages で静的配信できます。

- **自由配置モード**: 地形・地物・資源・川・区域を自由に編集し、隣接合計を確認
- **問題モード**: 5 つの定石テンプレートで最適配置を当てるパズル
- **最適化探索**: 最大 3 区域の総当たりで最適配置を提案

> 文明固有能力・指導者固有能力・政策カード・建造物による倍加は**未実装**（標準ルールのみ）。
> 最終的な正確性はゲーム内プレビューで確認してください。

## 起動

```bash
npm install
npm run dev      # 開発サーバー
npm run build    # 本番ビルド (dist/)
npm run preview  # ビルド結果の確認
```

## GitHub Pages デプロイ

`.github/workflows/deploy.yml` が `main`/`master` への push で自動ビルド・デプロイします。
リポジトリの Settings → Pages → Source を **GitHub Actions** に設定してください。
`vite.config.js` の `base: './'` により任意のリポジトリ名で動作します。

## 仕様

### 盤面

- ヘクスグリッド（ axial 座標 `q, r`、半径 3、`|q + r| <= 3`）= **37 タイル**
- 中央 `(0,0)` が都心タイル（地形のみ変更可）
- 1 タイル = 地形 + 地物(任意) + 資源/改善(任意) + 区域(任意)

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

### 地物 (`FEATURES`)

森 / 熱帯雨林 / 湿原 / オアシス / 地熱孔 / 礁

### 資源・改善 (`EXTRAS`)

鉱山 / 採石場 / 戦略資源（未改善） / 戦略資源＋鉱山 / 高級資源 / 海洋資源

### 区域 (`DISTRICTS`)

都心 / キャンパス / 商業ハブ / 港 / 工業地帯 / 劇場広場 / 政府複合施設 / 用水路 / ダム / 娯楽複合施設 / 遺産

### 川

- ヘクスの**辺**の集合として表現（`EDGES`）
- 連結成分（頂点共有）で「同じ川」を判定（`buildRivers`）
- 編集モードで辺クリックで追加/削除

### 配置制限 (`checkDistrict`)

- 都心は中央固定（手動配置不可）
- `(0,0)` には区域を置けない
- 山岳 / 地熱孔 / 高級・戦略資源タイルには区域・遺産を置けない
- **港**: 沿岸または湖タイル、礁の上不可、陸地隣接が必須
- その他区域: 水域不可
- **用水路**: 都心隣接 + (川/湖/オアシス/山岳) に隣接
- **ダム**: 氾濫原 + 川が連続する 2 辺以上 + 1 本の川に 1 つまで
- 専門区域・用水路・娯楽は 1 都市 1 つ
- 政府複合施設は 1 文明 1 つ
- 区域設置時、撤去可能な改善・地物 (mine/quarry/sea, woods/rainforest/marsh) は自動撤去

### 隣接ボーナス (`scoreAt`, Civilopedia GS 準拠)

対象区域: キャンパス / 商業ハブ / 港 / 工業地帯 / 劇場広場

| 区域 | ボーナス |
|---|---|
| キャンパス | 山岳 +1、礁 +2、地熱孔 +2、熱帯雨林 (2 つごとに +1) |
| 商業ハブ | 川に接 +2（1 回）、港隣接 +2 |
| 港 | 都心隣接 +2、海洋資源 +1 |
| 工業地帯 | 用水路 +2、ダム +2、採石場 +1、戦略資源 +1、鉱山 (2 つごとに +1) |
| 劇場広場 | 遺産 +2、娯楽複合施設 +2 |

共通:
- 政府複合施設隣接 +1
- 隣接区域 (都心・用水路・ダム含む 10 種) (2 つごとに +1)

### 最適化 (`optimize`)

- 入力: ベースマップ + 配置する区域リスト
- 空きタイルに総当たりで配置、`checkDistrict` を逐次適用
- 合計隣接ボーナス (SCORED 区域のみ) を最大化
- UI では最大 3 区域まで選択可能

### 問題テンプレート (5 種)

| id | 名前 | 配置区域 |
|---|---|---|
| river-hub | 川沿い商業ハブ三角形 | commercial, campus, government |
| iz-dam | 工業地帯ダイヤ | industrial, aqueduct, dam |
| campus-pass | 山間キャンパス | campus, government |
| culture | 遺産と劇場広場 | theater, entertainment, government |
| harbor-hub | 港と商業ハブ | harbor, commercial |

各テンプレートは地形・川・固定区域のみ定義し、正解 (最適配置) は `optimize` で算出します。

### 未反映・簡略化

- 盤面外周の辺の川、運河
- 地区 (encampment/spaceport 等)、野営地、宇宙基地
- 遺産ごとの固有設置条件、自然遺産
- 文明・指導者固有能力、政策カード・建造物による倍加
- 「同じ川」は辺の連結で判定（実ゲームは川の名前）

### 根拠

- 隣接値: Civilopedia (Gathering Storm) 各区域ページ、Civ6 Planner 隣接表
- ダム・用水路設置条件: Civilopedia / Civilization Wiki
- 地熱孔上の区域不可: Civilization Wiki

## ディレクトリ構成

```
.
├── src/
│   ├── App.jsx                 # 全ロジック・UI
│   ├── main.jsx
│   ├── index.css
│   └── components/ui/          # Button, Card (shadcn 風の最小実装)
├── .github/workflows/deploy.yml
├── vite.config.js
├── package.json
└── README.md
```

## ライセンス

個人学習用プロジェクト。Civilization VI は Firaxis Games / 2K の商標です。
EOF
echo done