# Novel Conversion Examples and Templates

## 目的

`PARTY_PERSPECTIVE_NOVEL_CONVERSION.md` の具体的な実装例と、様々なシナリオでの変換テンプレートを提供する。

## 完全変換例

### 入力データ例

```json
{
  "playlog": {
    "entries": [
      {
        "step": 1,
        "type": "explore",
        "participants": ["emerald_hunters"],
        "narrative": {
          "basicDescription": "エメラルド・ハンターズが北の森を探索し、古い遺跡を発見",
          "internalPerspective": {
            "situationObservation": "森の奥で石造りの構造物を発見、魔法的なオーラを感知",
            "internalDeliberation": "ファイターは慎重な接近を主張、ウィザードは魔法分析を提案",
            "actionMotivation": "遺跡の価値を調査し、潜在的な危険も評価したい",
            "expectedOutcome": "貴重な魔法的知識か宝物の発見、または古代の守護者との遭遇"
          },
          "outcomeReaction": {
            "immediateEmotionalResponse": "発見への興奮と未知への畏敬の念",
            "strategicImplication": "新たな探索機会の獲得、専門知識の重要性再認識",
            "futureDirectionAdjustment": "古代魔法研究への投資拡大を検討"
          },
          "environmentalContext": {
            "settingDescription": "薄暗い森の中、苔むした古代の石造建築が神秘的に佇む",
            "worldStateAwareness": "この地域での魔法活動増加の噂と一致する発見"
          }
        },
        "effects": [
          {
            "target": "/treasures/ancient_rune_tablet/discoveredBy",
            "operation": "set",
            "value": "emerald_hunters"
          }
        ],
        "deltas": {
          "exploration_progress": 1
        }
      },
      {
        "step": 2,
        "type": "market_trade",
        "participants": ["emerald_hunters", "fire_forge_guild"],
        "narrative": {
          "basicDescription": "エメラルド・ハンターズが火の鍛冶ギルドから鉄鉱石5単位を通貨15で購入",
          "internalPerspective": {
            "situationObservation": "市場で鉄価格が安定、火の鍛冶ギルドの品質は信頼できる",
            "internalDeliberation": "遺跡調査用の装備強化が必要、予算内での調達を優先",
            "actionMotivation": "発見した遺跡の本格調査に向けた準備",
            "expectedOutcome": "質の良い鉄鉱石の確保と鍛冶ギルドとの関係維持"
          },
          "externalInteraction": {
            "approachStrategy": "長期的なパートナーシップを意識した友好的交渉",
            "communicationSummary": [
              "遺跡調査プロジェクトの概要を簡潔に説明",
              "継続的な資材調達の可能性を示唆",
              "品質保証と迅速な納期を要請"
            ],
            "perceivedResponse": "火の鍛冶ギルドは興味を示し、協力的な姿勢",
            "relationshipAssessment": "専門性を相互尊重する良好な取引関係"
          },
          "outcomeReaction": {
            "immediateEmotionalResponse": "順調な準備進行への満足感",
            "strategicImplication": "資材調達ルートの確立、プロジェクト実現性向上",
            "futureDirectionAdjustment": "火の鍛冶ギルドとの技術協力拡大を検討"
          }
        },
        "effects": [
          {
            "target": "/parties/emerald_hunters/resources/currency",
            "operation": "add",
            "value": -15
          },
          {
            "target": "/parties/emerald_hunters/resources/iron",
            "operation": "add",
            "value": 5
          }
        ],
        "deltas": {
          "currency:emerald_hunters": -15,
          "trust:emerald_hunters:fire_forge_guild": 1
        }
      }
    ],
    "finalWorld": {
      "parties": {
        "emerald_hunters": {
          "name": "エメラルド・ハンターズ",
          "location": "settlement_center",
          "resources": {"currency": 85, "iron": 5}
        }
      }
    }
  },
  "focusPartyId": "emerald_hunters",
  "characterProfile": {
    "partyName": "エメラルド・ハンターズ",
    "leadershipStyle": "collaborative_democracy",
    "decisionMaking": "cautious_analytical",
    "communicationStyle": "diplomatic_direct",
    "coreValues": ["knowledge_pursuit", "mutual_benefit", "strategic_patience"],
    "speechPatterns": {
      "internal": "丁寧語、分析的、慎重",
      "external": "礼儀正しく、明確、協力重視"
    }
  },
  "options": {
    "narrativeStyle": "novel",
    "emotionalDepth": "high",
    "dialogueDetail": "extensive"
  }
}
```

### 出力小説例

```markdown
# エメラルド・ハンターズの記録 — 古代遺跡発見編

## プロローグ

我々エメラルド・ハンターズは、知識と発見を追求する探索者集団である。ファイターとウィザードが協力し、この危険で神秘に満ちた世界で新たな真実を追い求めている。今回の記録は、我々の運命を変えることになった重大な発見の物語である。

---

## 第一章: 森の奥の秘密

### ターン1: 古代遺跡発見 — 知識への扉が開かれる

**北の森の探索**

薄暗い森の奥深く、我々は慎重に足を進めていた。木漏れ日が作り出す光と影のパターンが、まるで古代の暗号のように複雑に絡み合っている。そんな中、ウィザードが立ち止まった。

「何か感じませんか？魔法的なオーラが...」彼女の声には興奮と緊張が混じっている。

我々は周囲を注意深く観察した。そして、見つけたのだ——苔むした石造りの構造物が、まるで時を超えて我々を待っていたかのように佇んでいる。古代の遺跡。その存在感は圧倒的で、我々の心を揺さぶった。

「これは...相当古いものですね」ファイターが慎重に近づきながら呟く。「罠や守護者がいる可能性もあります」

「でも、この魔法的なオーラ。ただの廃墟ではありませんね」ウィザードが興奮を抑えきれずに言う。「きっと貴重な知識が眠っている」

我々は互いを見つめ、同じ決意を確認した。これは単なる偶然の発見ではない。我々の探求心と専門性が導いた必然の出会いだ。しかし、慎重さを忘れてはならない。

「まずは基本的な調査から始めましょう」我々は合意に達した。「危険を冒す前に、この遺跡が何なのか理解する必要があります」

石の表面に刻まれた文字を発見したとき、我々の心は躍った。古代ルーン文字の石板——これは間違いなく価値ある発見だ。発見への興奮と未知への畏敬の念が胸の内で渦巻く。

この発見は我々の今後の方針を大きく変えることになるだろう。古代魔法の研究への投資を本格的に検討すべきかもしれない。知識こそが我々の最大の武器なのだから。

---

### ターン2: 装備調達 — 準備は成功への第一歩

**中央市場での取引**

遺跡での発見から一夜明け、我々は中央市場にいた。朝の活気に満ちた市場では、様々な商人が声を張り上げている。その中で、火の鍛冶ギルドの露店は特に目を引いた。

「遺跡の本格調査には、より良い装備が必要ですね」我々は小声で話し合う。「火の鍛冶ギルドなら、信頼できる品質の鉄鉱石を提供してくれるはず」

市場の価格を確認すると、鉄の相場は安定している。我々の予算内で必要な資材を調達できそうだ。これは好都合だ——慎重な計画の重要性を改めて実感する。

火の鍛冶ギルドの職人が我々に気づいて近づいてくる。その表情は職人らしい真摯さに満ちている。

「お忙しい中恐縮ですが、鉄鉱石5単位をお譲りいただけませんでしょうか」我々は丁寧に切り出した。「実は、古代遺跡の調査プロジェクトを進めており、質の良い資材が必要なのです」

「古代遺跡ですか、それは興味深い」職人の目が輝く。「我々も古い技術には関心があります。通貨15でいかがでしょう？品質は保証いたします」

「ありがとうございます。今回だけでなく、継続的にお取引いただける可能性もあります」我々は将来の協力関係を視野に入れて返答する。「迅速な納期もお願いできますでしょうか？」

「もちろんです。エメラルド・ハンターズの皆さんのような真摯な探求者とは、ぜひ長いお付き合いをさせていただきたい」

取引は円滑に成立した。質の良い鉄鉱石5単位を手に入れ、火の鍛冶ギルドとの信頼関係もさらに深まった。この職人たちの専門性を尊重し、我々も彼らから尊重される——これこそが理想的な取引関係だ。

順調な準備進行に満足感を覚える。資材調達ルートが確立され、プロジェクトの実現性が大きく向上した。今後は火の鍛冶ギルドとの技術協力も拡大していけるかもしれない。

古代の謎解きに向けて、着実に一歩を踏み出している。我々の慎重さと準備の丁寧さが、きっと成功をもたらすだろう。

---

## エピローグ

これらの出来事は、我々エメラルド・ハンターズの新たな章の始まりに過ぎない。古代遺跡の発見は、我々の知識への渇望を満たすとともに、新たな疑問と挑戦をもたらした。

火の鍛冶ギルドとの協力関係は、技術と知識の融合という新しい可能性を示唆している。互いの専門性を尊重し、相互利益を追求する——これが我々の信念であり、成功への道筋だ。

次の記録では、いよいよ遺跡の本格的な調査が始まる。そこで我々が発見するものは何か？新たな知識か、古代の危険か、それとも想像を超えた真実か？

確実に言えるのは、我々が慎重に、しかし勇敢に前進し続けるということだ。知識と発見の追求——それこそが我々エメラルド・ハンターズの使命なのだから。

*（記録者：エメラルド・ハンターズ一同）*
```

## シナリオ別テンプレート

### 戦闘シーン変換例

```typescript
// 入力
{
  "type": "conflict",
  "narrative": {
    "internalPerspective": {
      "situationObservation": "オークの群れが奇襲攻撃、数的劣勢だが地形は有利",
      "internalDeliberation": "ファイターが前衛で時間稼ぎ、ウィザードが範囲攻撃魔法で決着を図る戦術で合意",
      "actionMotivation": "被害を最小限に抑えつつ、確実に脅威を排除したい"
    }
  }
}

// 出力
"剣戟の音が森に響く。我々は背中合わせになって身構えた。
「数は多いが、この地形なら何とかなる」ファイターが冷静に状況を分析する。
「魔法の準備はできています」ウィザードが集中を高める。
我々の連携が試される瞬間だ。"
```

### 外交交渉変換例

```typescript
// 入力
{
  "type": "negotiate",
  "narrative": {
    "externalInteraction": {
      "approachStrategy": "相手の面子を立てつつ、互いの利益を強調",
      "communicationSummary": [
        "相手の功績を認める発言",
        "Win-Win提案の提示",
        "長期協力の可能性示唆"
      ],
      "perceivedResponse": "最初は警戒していたが、徐々に興味を示すように"
    }
  }
}

// 出力
"「皆様の功績は広く知られております」我々は敬意を込めて挨拶する。
相手の表情が僅かに緩んだのを見逃さない。
「実は、お互いに利益をもたらす提案がございます」
交渉のテーブルが整い始めた。"
```

## 感情表現パターン集

### 成功時の反応
```json
{
  "cautious_analytical": "「計画通りの結果です。しかし、なぜ成功したかの分析も重要ですね」",
  "bold_opportunistic": "「やったぞ！この調子で次のチャンスも掴んでいこう！」",
  "balanced_pragmatic": "「良い結果でした。この経験を今後に活かしていきましょう」"
}
```

### 失敗時の反応
```json
{
  "cautious_analytical": "「予想外でした。何を見落としていたのか、詳細に検証する必要があります」",
  "bold_opportunistic": "「一時的な挫折に過ぎません。すぐに体勢を立て直しましょう」",
  "balanced_pragmatic": "「厳しい結果ですが、学ぶべき点もあります。次に繋げましょう」"
}
```

### 驚きの場面
```json
{
  "positive_surprise": "「これは予想以上です！」我々の目は輝きに満ちている。",
  "negative_surprise": "「これは...計算外でした」我々は素早く状況を再評価する。",
  "mysterious_discovery": "「この現象は...我々の知識を超えています」畏敬の念が胸を満たす。"
}
```

## 品質チェックリスト

### 技術的整合性
- [ ] 数値データ（deltas, effects）との完全一致
- [ ] 参加者パーティーの正確な反映
- [ ] 時系列順序の維持
- [ ] 行動タイプの正確な表現

### キャラクター一貫性
- [ ] 設定された personality profile との整合
- [ ] 全ターン通しての口調の統一
- [ ] 価値観に基づく判断の表現
- [ ] 成長・変化の自然な描写

### 物語品質
- [ ] 自然な日本語表現
- [ ] 適切な情景描写
- [ ] 感情移入可能な心理描写
- [ ] 読み進めたくなる展開

### 文化的適切性
- [ ] ファンタジー世界観との調和
- [ ] 敬語・丁寧語の適切な使用
- [ ] 現代的すぎる表現の回避
- [ ] 地域・文化設定との整合性