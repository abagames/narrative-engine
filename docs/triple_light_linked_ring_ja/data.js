// 三光連環の儀 対立 - Data Dictionary
// 自動生成されたデータ辞書：地名、キャラクター、戦術用語、イベント等

const campaignData = {
  // メタ情報
  meta: {
    title: "三光連環の儀 対立",
    subtitle: "Silver Eclipse Cycle の壮大な物語",
    totalTurns: 14,
    factions: ["auric", "veilbreak"],
    startDate: "2024",
    endDate: "2024"
  },

  // 勢力データ
  factions: {
    auric: {
      name: "Auric Covenant",
      nameJa: "オーリック契約団",
      icon: "🌟",
      emoji: "🌟",
      primaryColor: "#ffd700",
      secondaryColor: "#b8860b",
      speciality: "神聖儀式と外交",
      homeBase: "Moonweave Crossroads",
      philosophy: "慎重な分析に基づく協調的民主制による意思決定、神殿儀礼に即した格式ばった外交"
    },
    veilbreak: {
      name: "Veilbreak Sentinels",
      nameJa: "ヴェイルブレイク監視団",
      icon: "⚡",
      emoji: "⚡",
      primaryColor: "#8a2be2",
      secondaryColor: "#4b0082",
      speciality: "戦術妨害と封鎖作戦",
      homeBase: "Ashen Ramparts",
      philosophy: "直接指揮による計算された奇襲、軍事符丁を交えた短文での即断即決"
    }
  },

  // キャラクターデータ
  characters: {
    // Auric Covenant
    selene: {
      name: "High Cantor Selene",
      nameJa: "ハイ・カントール セレネ",
      faction: "auric",
      role: "儀式指揮者",
      description: "献身的で静謐な性格で、神聖儀式と結界術を担当",
      speech: "穏やかで祈りを織り込む言葉遣い",
      specialties: ["神聖儀式", "結界術", "祈りの詠唱"]
    },
    thalen: {
      name: "Warden Thalen",
      nameJa: "守護官 ターレン",
      faction: "auric",
      role: "守護者",
      description: "守護的で揺るがない性格で、槍術と守護術式を担当",
      speech: "短く断定的、警戒を促す",
      specialties: ["槍術", "守護術式", "隊列指揮"]
    },
    lyra: {
      name: "Oracle Lyra",
      nameJa: "神託者 リラ",
      faction: "auric",
      role: "予見者",
      description: "洞察的で内省的な性格で、予知と占星観測を担当",
      speech: "詠唱のように比喩的",
      specialties: ["予知", "占星観測", "霧路読解"]
    },
    iven: {
      name: "Chronicler Iven",
      nameJa: "記録官 イヴェン",
      faction: "auric",
      role: "外交官",
      description: "外交的で誠実な性格で、交渉と儀礼史の記録を担当",
      speech: "丁寧で外交儀礼を重んじる",
      specialties: ["外交交渉", "儀礼史", "同盟締結"]
    },
    // Veilbreak Sentinels
    raxen: {
      name: "Captain Raxen",
      nameJa: "キャプテン ラクセン",
      faction: "veilbreak",
      role: "指揮官",
      description: "冷静で攻撃的な性格で、戦術指揮と強襲を担当",
      speech: "短く命令調",
      specialties: ["戦術指揮", "強襲作戦", "封鎖戦略"]
    },
    nyx: {
      name: "Shade Operative Nyx",
      nameJa: "影の工作員 ニクス",
      faction: "veilbreak",
      role: "破壊工作員",
      description: "狡猾で静かな性格で、潜入と罠設置を担当",
      speech: "囁くように要点だけを語る",
      specialties: ["潜入術", "罠設置", "影糸操作"]
    },
    varek: {
      name: "Oathbreaker Varek",
      nameJa: "誓約破り ヴァレク",
      faction: "veilbreak",
      role: "強制執行者",
      description: "苛烈で挑発的な性格で、重装戦闘と封鎖を担当",
      speech: "皮肉混じりで威圧的",
      specialties: ["重装戦闘", "封鎖作戦", "影爆術"]
    }
  },

  // 地名・場所データ
  locations: {
    "moonweave": {
      name: "Moonweave Crossroads",
      nameJa: "ムーンウィーブ交差路",
      type: "商業都市",
      capacity: 2,
      specialEffect: "儀式集中ボーナス",
      strategicValue: "三つの神殿への交通の要衝、経済・宗教の中枢",
      controlledBy: "auric",
      adjacentAreas: ["ソレース聖所", "ヴァーダント辺境", "アッシェン要塞"],
      resources: ["市場屋台", "巡礼宿舎"]
    },
    "solace": {
      name: "Solace Sanctum",
      nameJa: "ソレース聖所",
      type: "神殿 - 三光連環第一神殿",
      capacity: 1,
      specialEffect: "祈りの共鳴",
      strategicValue: "儀式の起点、慰めの守護効果",
      controlledBy: "中立",
      adjacentAreas: ["ムーンウィーブ交差路", "嵐尖塔神殿"],
      resources: ["陽火祭壇"]
    },
    "stormspire": {
      name: "Stormspire Temple",
      nameJa: "嵐尖塔神殿",
      type: "神殿 - 三光連環第三神殿",
      capacity: 1,
      specialEffect: "空中結界",
      strategicValue: "最終決戦の舞台、雷の試練場",
      controlledBy: "中立",
      adjacentAreas: ["ソレース聖所", "エンバーシュラウド大聖堂", "アッシェン要塞"],
      resources: ["嵐印オベリスク"]
    },
    "embershroud": {
      name: "Embershroud Basilica",
      nameJa: "エンバーシュラウド大聖堂",
      type: "神殿 - 三光連環第二神殿",
      capacity: 1,
      specialEffect: "ヴェイル焼却結界、地脈震動",
      strategicValue: "炎の試練場、地脈増幅効果",
      controlledBy: "中立",
      adjacentAreas: ["嵐尖塔神殿", "ヴェイルボーン街道"],
      resources: ["火焔井戸"]
    },
    "ashen": {
      name: "Ashen Ramparts",
      nameJa: "アッシェン要塞",
      type: "軍事要塞",
      capacity: 2,
      specialEffect: "要塞化門扉",
      strategicValue: "軍事拠点、神殿群への封鎖基地",
      controlledBy: "veilbreak",
      adjacentAreas: ["ムーンウィーブ交差路", "嵐尖塔神殿", "ヴェイルボーン街道"],
      resources: ["攻城兵器"]
    },
    "verdant": {
      name: "Verdant Outskirts",
      nameJa: "ヴァーダント辺境",
      type: "森林",
      capacity: 2,
      specialEffect: "隠密経路、黄昏案内人",
      strategicValue: "迂回路確保、補給・情報支援",
      controlledBy: "中立（契約団同盟）",
      adjacentAreas: ["ムーンウィーブ交差路", "ヴェイルボーン街道"],
      resources: ["薬草林", "隠し道", "光胞子灯台"]
    },
    "veilborn": {
      name: "Veilborn Way",
      nameJa: "ヴェイルボーン街道",
      type: "古代遺跡",
      capacity: 2,
      specialEffect: "破壊工作経路",
      strategicValue: "戦略要衝、影縄罠の展開地",
      controlledBy: "中立（争奪地域）",
      adjacentAreas: ["アッシェン要塞", "エンバーシュラウド大聖堂", "ヴァーダント辺境"],
      resources: ["地脈断片"]
    }
  },

  // 戦術・魔法用語
  tacticsAndMagic: {
    "ritual_chanting": {
      name: "儀式詠唱",
      nameJa: "儀式詠唱",
      faction: "auric",
      description: "三光連環の儀を構成する神聖なる祈りの詠唱",
      user: "selene, lyra"
    },
    "guardian_formation": {
      name: "守護陣形",
      nameJa: "守護陣形",
      faction: "auric",
      description: "Thalen の槍術を核とした防御フォーメーション",
      user: "thalen"
    },
    "light_barrier": {
      name: "光の結界",
      nameJa: "光の結界",
      faction: "auric",
      description: "神聖魔法による防護結界術",
      user: "selene"
    },
    "storm_shield": {
      name: "嵐盾",
      nameJa: "嵐盾",
      faction: "auric",
      description: "最終決戦で使用された究極の防御術",
      user: "selene, thalen"
    },
    "shadow_snare": {
      name: "影縄",
      nameJa: "影縄",
      faction: "veilbreak",
      description: "Veilbreak の影術による封鎖・拘束技術",
      user: "nyx"
    },
    "shadow_stakes": {
      name: "影の杭",
      nameJa: "影の杭",
      faction: "veilbreak",
      description: "影術による地形制御・封鎖技術",
      user: "nyx"
    },
    "lightning_spear": {
      name: "雷槍",
      nameJa: "雷槍",
      faction: "veilbreak",
      description: "雷の力を宿した遠距離攻撃兵器",
      user: "raxen, varek"
    },
    "shadow_explosion": {
      name: "影爆",
      nameJa: "影爆",
      faction: "veilbreak",
      description: "影術による爆発攻撃技術",
      user: "varek"
    }
  },

  // リソース・アイテム
  resources: {
    "incense": {
      name: "香束",
      nameJa: "香束",
      type: "sacred",
      description: "神聖儀式に使用される薫香。三光連環の儀に必須",
      faction: "auric"
    },
    "sun_fragment": {
      name: "太陽欠片",
      nameJa: "太陽欠片",
      type: "sacred",
      description: "古代の聖遺物。強力な神聖魔法の触媒",
      faction: "auric"
    },
    "guardian_scroll": {
      name: "守護巻物",
      nameJa: "守護巻物",
      type: "magic",
      description: "守護術式が記された魔法の巻物",
      faction: "auric"
    },
    "light_resin": {
      name: "光花樹脂",
      nameJa: "光花樹脂",
      type: "magic",
      description: "光る樹脂。対影戦術の護符材料",
      faction: "auric"
    },
    "shadow_poison": {
      name: "影縛薬",
      nameJa: "影縛薬",
      type: "poison",
      description: "影術に使用される特殊薬剤",
      faction: "veilbreak"
    },
    "far_sight": {
      name: "遠見鏡",
      nameJa: "遠見鏡",
      type: "tool",
      description: "遠距離監視用の光学機器",
      faction: "veilbreak"
    },
    "supply_ration": {
      name: "補給糧",
      nameJa: "補給糧",
      type: "food",
      description: "軍事行動用の保存食料",
      faction: "veilbreak"
    }
  },

  // ターン別重要イベント
  keyEvents: {
    2: {
      title: "第一節完遂",
      type: "ritual_success",
      result: "儀式進行度1/3達成、迂回路発見",
      participants: ["auric"],
      impact: "三光連環への第一歩"
    },
    3: {
      title: "黄昏案内人との誓約",
      type: "alliance",
      result: "霧路の安全通行権獲得",
      participants: ["auric", "duskway_guides"],
      impact: "迂回路確保の成功"
    },
    6: {
      title: "ヴェイルボーン街道突入",
      type: "direct_confrontation",
      result: "両陣営同一地点で対峙開始",
      participants: ["auric", "veilbreak"],
      impact: "直接衝突の始まり"
    },
    10: {
      title: "第二節完遂と炎風攻防",
      type: "combat_ritual",
      result: "監視団突撃を結界で撃退、第二節完遂",
      participants: ["auric", "veilbreak"],
      impact: "儀式進行度2/3達成"
    },
    11: {
      title: "炎守護僧との協定",
      type: "alliance",
      result: "静風窓情報獲得、最終準備完了",
      participants: ["auric", "ember_guardians"],
      impact: "最終決戦への道筋確保"
    },
    14: {
      title: "三光連環の完成",
      type: "final_victory",
      result: "光の勝利、聖約の完成",
      participants: ["auric", "veilbreak"],
      impact: "キャンペーン完了、光の守護確立"
    }
  },

  // ターン別タイトル
  turnTitles: [
    "", // インデックス0は空
    "嵐前夜の布陣と月光の交差路",
    "慰めの聖所での第一節完遂",
    "黄昏案内人との誓約",
    "夕闇の森辺境移動",
    "光花樹脂の採集と地脈の震え",
    "ヴェイルボーン街道への突入",
    "日蝕の影と光路の構築",
    "残像罠の解析と決戦準備",
    "エンバーシュラウド大聖堂への突入",
    "第二節の祈りと炎風の攻防",
    "炎守護僧との協定と静風窓の発見",
    "嵐尖塔への突入",
    "嵐盾の結界と最終準備",
    "三光連環の完成と光の勝利"
  ],

  // 経済データ（初期値）
  initialEconomy: {
    auric: {
      currency: 120,
      combat: 5,
      exploration: 6,
      diplomacy: 8,
      ritual: 9,
      morale: 7,
      resources: {
        incense: 6,
        sun_fragment: 3,
        guardian_scroll: 2
      }
    },
    veilbreak: {
      currency: 95,
      combat: 7,
      exploration: 7,
      diplomacy: 5,
      sabotage: 8,
      morale: 7,
      resources: {
        shadow_poison: 4,
        far_sight: 3,
        supply_ration: 5
      }
    }
  },

  // 最終統計
  finalStats: {
    auric: {
      finalMorale: 9.1,
      achievement: "三光連環の儀完遂",
      allianceCount: 3,
      ritualsCompleted: 3
    },
    veilbreak: {
      finalMorale: 7.3,
      achievement: "善戦するも阻止失敗",
      sabotageAttempts: 2,
      blockadeSuccess: 1
    }
  }
};

// グローバルエクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = campaignData;
} else {
  window.campaignData = campaignData;
}