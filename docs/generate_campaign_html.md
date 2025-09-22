# Thunder Storm Campaign HTML 生成プロンプト

以下の Markdown ファイルから読みやすい HTML ファイル群を生成してください：

- `docs/thunder_storm_campaign/narrative_replay.md`
- `docs/thunder_storm_campaign/playlog.md`
- `docs/thunder_storm_campaign/world_map.md`

## 要求仕様

### 生成するファイル構成

1. **index.html** - メインダッシュボード
2. **narrative.html** - ナラティブリプレイ（物語形式）
3. **playlog.html** - プレイログ（統計・データ形式）
4. **worldmap.html** - 世界マップ（地理・戦略情報）
5. **style.css** - 共通スタイルシート

### 必須機能

#### ターン間リンク機能

- ナラティブとプレイログの対応するターン間を相互リンク
- 各ターンに固有のアンカー ID（例：`#turn-1`, `#turn-2`）
- クリック一つで同じターンの別視点に移動可能

#### ナビゲーション

- 全ページ共通ヘッダーナビゲーション
- ターン選択ドロップダウンメニュー
- 前/次ターンへの移動ボタン
- トップページへの戻りリンク

#### レスポンシブデザイン

- PC・タブレット・スマートフォンで最適表示
- サイドバーナビゲーション（PC 時）
- ハンバーガーメニュー（モバイル時）

### デザイン指針

#### カラーテーマ例

- **⚔️ Ironbound**: 鉄色・赤色系（#8B0000, #4A4A4A）
- **🌙 Nightglass**: 紫・黒色系（#4B0082, #2F2F2F）
- **⚡ Stormveil**: 青・金色系（#1E90FF, #FFD700）
- **背景**: ダークテーマベース（#1A1A1A, #2D2D2D）

#### フォント

- 見出し：ゴシック系（游ゴシック、Noto Sans JP）
- 本文：明朝系（游明朝、Noto Serif JP）
- 統計データ：等幅フォント（Consolas, Monaco）

#### レイアウト

- 最大幅 1200px、中央配置
- 左サイドバー：ナビゲーション（250px）
- メインコンテンツ：残り領域
- 右サイドバー：クイックリンク（200px、オプション）

### 特殊要素

#### 勢力表示

```html
<span class="faction ironbound">⚔️ Ironbound</span>
<span class="faction nightglass">🌙 Nightglass</span>
<span class="faction stormveil">⚡ Stormveil</span>
```

#### ターンリンク

```html
<a href="narrative.html#turn-3" class="turn-link">ナラティブ：ターン3</a>
<a href="playlog.html#turn-3" class="turn-link">データ：ターン3</a>
```

#### 統計グラフ

- プレイログの士気変動グラフを SVG または Canvas で視覚化
- インタラクティブなツールチップ表示

#### 地図表示

- 世界マップを SVG 形式で再現
- 地域クリックで詳細表示
- 勢力圏の色分け表示

#### インタラクティブ要素

##### 地名・場所リンク
```html
<span class="location" data-region="shadowfen">Shadowfen Crossing</span>
<span class="location" data-region="emberfront">Emberfront Keep</span>
```
- 地名ホバーで地図上の位置をハイライト
- クリックで世界マップの該当地域にジャンプ
- ツールチップで地域の基本情報表示

##### キャラクター情報
```html
<span class="character" data-faction="ironbound" data-name="serah">Commander Serah Vance</span>
```
- キャラクター名ホバーで詳細情報表示
- 所属勢力、役職、特殊能力、口調の特徴
- 該当ターンでの行動履歴へのリンク

##### 戦術・魔法用語
```html
<span class="spell" data-type="time">時間魔法詠唱</span>
<span class="tactic" data-type="formation">盾壁</span>
```
- 専門用語にツールチップで解説追加
- 関連する戦闘システムの説明
- 同じ技術を使った他のターンへのリンク

##### リソース・アイテム
```html
<span class="resource" data-type="poison">毒</span>
<span class="resource" data-type="mana">マナクリスタル</span>
```
- リソースの現在値と変動履歴
- 市場価格の推移グラフ
- 同リソースを使用した他の行動へのリンク

### アクセシビリティ

- セマンティック HTML 使用
- aria-label 属性の適切な設定
- キーボードナビゲーション対応
- 色覚異常者対応（アイコン併用）

### 実装例

#### index.html 構造

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Thunder Storm Campaign</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <header class="main-header">
      <nav class="main-nav">
        <a href="index.html">🏠 Dashboard</a>
        <a href="narrative.html">📖 Narrative</a>
        <a href="playlog.html">📊 Playlog</a>
        <a href="worldmap.html">🗺️ World Map</a>
      </nav>
    </header>
    <main class="dashboard">
      <section class="campaign-overview">
        <h1>Thunder Storm Campaign</h1>
        <!-- ダッシュボード内容 -->
      </section>
    </main>
  </body>
</html>
```

#### ターンセクション例

```html
<section id="turn-1" class="turn-section">
  <header class="turn-header">
    <h2>ターン 1: Shadowfen Crossing への進軍</h2>
    <nav class="turn-nav">
      <a href="playlog.html#turn-1" class="cross-link">📊 データを見る</a>
      <a href="#turn-2" class="next-turn">次のターン →</a>
    </nav>
  </header>
  <div class="turn-content">
    <!-- ターン内容 -->
  </div>
</section>
```

#### 戦闘結果・イベント履歴
```html
<span class="battle-result" data-turn="3" data-participants="ironbound,nightglass">
  Ilyra & Vesper 捕獲
</span>
```
- 重要イベントの前後関係を視覚化
- 関連する他のターンへのクイックリンク
- 因果関係のフローチャート表示

#### 勢力関係図
```html
<div class="faction-relations" data-turn="5">
  <span class="relation hostile" data-from="ironbound" data-to="nightglass">敵対</span>
  <span class="relation neutral" data-from="stormveil" data-to="ironbound">中立協力</span>
</div>
```
- ターンごとの勢力関係変化をアニメーション表示
- 外交状況の推移グラフ
- 同盟・敵対関係の履歴追跡

#### 経済データ可視化
```html
<span class="economy-change" data-resource="food" data-change="-2">
  食料 -2
</span>
```
- リソース変動をカラーコード（増加=緑、減少=赤）
- 累積グラフでの経済状況推移
- 価格変動要因の解説ツールチップ

#### タイムライン機能
- 全ターンの重要イベントを時系列表示
- 特定勢力の行動だけをフィルタリング
- 戦闘・外交・経済イベントの分類表示

## 生成手順

1. 各 Markdown ファイルを解析し、構造を把握
2. ターン番号とタイトルを抽出
3. 地名・キャラクター・用語辞書を作成
4. HTML 基本構造を作成
5. CSS でスタイリング実装
6. JavaScript でインタラクション追加
7. 相互リンク機能を実装
8. ツールチップ・ポップアップ機能を実装
9. レスポンシブ対応を確認

## データ辞書生成指針

### 自動抽出すべき要素

#### 地名・場所情報
- Markdownから地名を自動抽出（大文字、特殊文字で始まる固有名詞）
- 世界マップファイルから地域データ取得
- 各地名に以下の情報を関連付け：
  - 地域タイプ（拠点、遺跡、自然地形等）
  - 支配勢力・影響度
  - 特殊効果・戦略価値
  - 隣接地域情報

#### キャラクター情報
- ナラティブから登場人物を自動抽出
- 勢力別にグループ化
- 各キャラクターに以下の情報を関連付け：
  - 所属勢力とアイコン
  - 役職・専門分野
  - 性格・口調の特徴
  - 主要行動・発言の記録

#### 戦術・技術用語
- 戦闘・魔法関連の専門用語を抽出
- 勢力固有技術の分類
- 各用語に以下の情報を関連付け：
  - 使用勢力・キャラクター
  - 効果・メカニズムの説明
  - 使用された具体的なターン
  - 関連する他の技術

#### リソース・経済要素
- プレイログから経済データを抽出
- 通貨・物資・特殊リソースの分類
- 各リソースに以下の情報を関連付け：
  - 初期値・最終値
  - ターン別変動履歴
  - 価格変動要因
  - 主要な取引・消費イベント

#### 重要イベント・転換点
- ナラティブとプレイログから重大事件を抽出
- 戦闘結果・外交成果・経済変動を分類
- 各イベントに以下の情報を関連付け：
  - 発生ターン・場所
  - 関与勢力・キャラクター
  - 因果関係・影響範囲
  - 後続イベントへの連鎖

### 汎用化パターン

#### 勢力システム
- N個の勢力を動的にサポート
- 各勢力に以下の属性を設定：
  - 固有カラーテーマ（プライマリ・セカンダリ色）
  - アイコン・エンブレム
  - 専門分野・戦略スタイル
  - 拠点・影響圏

#### ターンベース進行
- 任意のターン数に対応
- 各ターンの構造化データ：
  - GMアクション・プレイヤーアクション
  - 勢力間イベント・相互作用
  - リソース変動・統計変化
  - 重要な意思決定・結果

#### マルチファイル対応
- ナラティブ・プレイログ・世界情報の分離
- 追加ファイル（キャラクター詳細、ルールブック等）への拡張性
- ファイル間の自動クロスリファレンス生成

## 実装アルゴリズム

### Phase 1: データ解析
1. Markdown構造解析（ヘッダー階層、リスト、表）
2. 固有名詞抽出（正規表現・自然言語処理）
3. 数値データ抽出（統計・経済情報）
4. 時系列情報整理（ターン進行・因果関係）

### Phase 2: 関係性マッピング
1. 地名↔勢力の支配関係
2. キャラクター↔行動の履歴追跡
3. イベント↔影響の因果チェーン
4. リソース↔価格変動の相関

### Phase 3: インタラクティブ要素生成
1. ツールチップ用JSON辞書作成
2. クロスリンク用URL map生成
3. アニメーション用データ配列作成
4. フィルタリング用インデックス構築

## 品質チェックリスト

### 基本機能
- [ ] 全ターンの相互リンクが正常動作
- [ ] 地名・キャラクター名のツールチップが適切
- [ ] 勢力カラーテーマが統一
- [ ] ナビゲーションが直感的

### インタラクティブ機能
- [ ] インタラクティブ要素が機能
- [ ] タイムライン機能が動作
- [ ] 経済グラフが正確
- [ ] 戦闘フローチャートが分かりやすい
- [ ] 地図上のホバー・クリックが動作

### 汎用性・拡張性
- [ ] 他のキャンペーンデータでも動作
- [ ] 勢力数・ターン数の変更に対応
- [ ] 新しいファイル追加に対応
- [ ] データ構造の変更に柔軟

### パフォーマンス・品質
- [ ] 読み込み速度が適切
- [ ] アクセシビリティ基準遵守
- [ ] モバイル対応が完全
- [ ] ブラウザ互換性が確保

このプロンプトに従って、任意のナラティブTRPGキャンペーンに適用可能な汎用HTML生成システムを構築してください。Thunder Storm Campaignは実装例として使用し、他のキャンペーンデータにも適用できる柔軟な設計を目指してください。
