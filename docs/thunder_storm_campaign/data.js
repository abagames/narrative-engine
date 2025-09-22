// Thunder Storm Campaign - Data Dictionary
// 自動生成されたデータ辞書：地名、キャラクター、戦術用語、イベント等

const campaignData = {
  // メタ情報
  meta: {
    title: "Thunder Storm Campaign",
    subtitle: "ナラティブリプレイ",
    totalTurns: 20,
    factions: ["ironbound", "nightglass", "stormveil"],
    startDate: "2024",
    endDate: "2024"
  },

  // 勢力データ
  factions: {
    ironbound: {
      name: "Ironbound Covenant",
      nameJa: "鉄血盟約",
      icon: "⚔️",
      emoji: "⚔️",
      primaryColor: "#8B0000",
      secondaryColor: "#4A4A4A",
      speciality: "戦闘・軍事指揮",
      homeBase: "Emberfront Keep",
      philosophy: "経験豊富な指導による大胆な機会主義戦略"
    },
    nightglass: {
      name: "Nightglass Collective",
      nameJa: "夜硝子集団",
      icon: "🌙",
      emoji: "🌙",
      primaryColor: "#4B0082",
      secondaryColor: "#2F2F2F",
      speciality: "探索・暗殺術",
      homeBase: "Twilight Bog",
      philosophy: "専門性に基づく慎重な分析的判断"
    },
    stormveil: {
      name: "Stormveil Circle",
      nameJa: "嵐幕団",
      icon: "⚡",
      emoji: "⚡",
      primaryColor: "#1E90FF",
      secondaryColor: "#FFD700",
      speciality: "外交・魔術交易",
      homeBase: "Auric Market",
      philosophy: "協調的民主主義による均衡した実用主義"
    }
  },

  // キャラクターデータ
  characters: {
    // Ironbound Covenant
    serah_vance: {
      name: "Commander Serah Vance",
      nameJa: "指揮官セラ・ヴァンス",
      faction: "ironbound",
      role: "戦略家",
      description: "不屈の性格で、戦場指揮を担当",
      speechStyle: "簡潔で権威ある命令口調"
    },
    kael_draken: {
      name: "Brother Kael Draken",
      nameJa: "兄弟ケイル・ドレイケン",
      faction: "ironbound",
      role: "前衛戦士",
      description: "熱狂的な性格で、盾陣形成を担当",
      speechStyle: "しわがれ声での戦闘叫び"
    },
    leona_hale: {
      name: "Archivist Leona Hale",
      nameJa: "記録官レオナ・ヘイル",
      faction: "ironbound",
      role: "戦闘魔法使い",
      description: "戦略的な性格で、時間魔法支援を担当",
      speechStyle: "正確で簡潔な分析"
    },
    // Nightglass Collective
    ilyra: {
      name: "Shadecaller Ilyra",
      nameJa: "影召喚者イリラ",
      faction: "nightglass",
      role: "影の元帥",
      description: "計算高い性格で、待ち伏せ調整を担当",
      speechStyle: "ささやくような暗示"
    },
    vesper_rune: {
      name: "Vesper Rune",
      nameJa: "ヴェスパー・ルーン",
      faction: "nightglass",
      role: "暗殺者",
      description: "憂鬱な性格で、毒術を担当",
      speechStyle: "簡潔で鋭い発言"
    },
    sable_myrr: {
      name: "Sable Myrr",
      nameJa: "セーブル・ミア",
      faction: "nightglass",
      role: "虚無の魔女",
      description: "強迫観念の強い性格で、エントロピー魔法を担当",
      speechStyle: "物静かな理論的思索"
    },
    // Stormveil Circle
    talan_mir: {
      name: "Archmage Talan Mir",
      nameJa: "大魔法使いタラン・ミア",
      faction: "stormveil",
      role: "大魔法使い",
      description: "冷静な性格で、嵐召喚を担当",
      speechStyle: "響きのある指導的口調"
    },
    lysa_orien: {
      name: "Seer Lysa Orien",
      nameJa: "預言者リサ・オリエン",
      faction: "stormveil",
      role: "神託者",
      description: "共感的な性格で、占術を担当",
      speechStyle: "穏やかで預言的な導き"
    },
    corrin_faye: {
      name: "Bladesinger Corrin Faye",
      nameJa: "剣歌コリン・フェイ",
      faction: "stormveil",
      role: "決闘剣士",
      description: "華やかな性格で、魔法剣術を担当",
      speechStyle: "皮肉で演劇的に自信満々"
    }
  },

  // 地名・場所データ
  locations: {
    "shadowfen_crossing": {
      name: "Shadowfen Crossing",
      nameJa: "シャドウフェン・クロッシング",
      type: "戦略要衝遺跡",
      capacity: 2,
      specialEffect: "待ち伏せボーナス、瘴気デバフ",
      strategicValue: "最重要要衝 - 三地域への交通の要",
      controlledBy: "係争地（Thunder Legion が監視）",
      adjacentAreas: ["Twilight Bog", "Crystal Hollow", "Gale Steppe"]
    },
    "emberfront_keep": {
      name: "Emberfront Keep",
      nameJa: "エンバーフロント要塞",
      type: "軍事要塞",
      capacity: 2,
      specialEffect: "防御陣地、影響力増加ボーナス",
      strategicValue: "北東部の軍事拠点、Ashen Ridge への玄関口",
      controlledBy: "ironbound",
      adjacentAreas: ["Auric Market", "Ashen Ridge"]
    },
    "twilight_bog": {
      name: "Twilight Bog",
      nameJa: "トワイライト沼",
      type: "毒沼地",
      capacity: 2,
      specialEffect: "隠密優位、移動ペナルティ",
      strategicValue: "暗殺者の聖域、毒製造拠点",
      controlledBy: "nightglass",
      adjacentAreas: ["Auric Market", "Gale Steppe", "Shadowfen Crossing"]
    },
    "auric_market": {
      name: "Auric Market",
      nameJa: "オーリック市場",
      type: "商業都市",
      capacity: 3,
      specialEffect: "市場ハブ、外交影響力ボーナス",
      strategicValue: "経済の中心、外交の要衝",
      controlledBy: "stormveil",
      adjacentAreas: ["Emberfront Keep", "Twilight Bog", "Crystal Hollow"]
    },
    "crystal_hollow": {
      name: "Crystal Hollow",
      nameJa: "クリスタル洞窟",
      type: "魔法洞窟",
      capacity: 2,
      specialEffect: "不安定マナ、共鳴エコー",
      strategicValue: "魔力の源泉、古代技術の宝庫",
      controlledBy: "中立（古代戦争機械が存在）",
      adjacentAreas: ["Auric Market", "Ashen Ridge", "Shadowfen Crossing"]
    },
    "ashen_ridge": {
      name: "Ashen Ridge",
      nameJa: "アッシュ山脈",
      type: "火山山脈",
      capacity: 2,
      specialEffect: "火災危険、鉱石豊富",
      strategicValue: "三地域への要衝、古代守護者の審判地",
      controlledBy: "中立（玄武岩守護者が存在）",
      adjacentAreas: ["Emberfront Keep", "Crystal Hollow", "Gale Steppe"]
    },
    "gale_steppe": {
      name: "Gale Steppe",
      nameJa: "ゲイル平原",
      type: "風吹く平原",
      capacity: 2,
      specialEffect: "開放戦場、風戦術",
      strategicValue: "大規模戦闘に適した平原、騎兵戦の舞台",
      controlledBy: "中立（遊牧地帯）",
      adjacentAreas: ["Ashen Ridge", "Twilight Bog", "Shadowfen Crossing"]
    }
  },

  // 戦術・魔法用語
  tacticsAndMagic: {
    "shield_wall": {
      name: "盾壁",
      faction: "ironbound",
      description: "Ironbound の組織的防御陣形",
      user: "serah, kael"
    },
    "time_magic": {
      name: "時間魔法詠唱",
      faction: "ironbound",
      description: "Leona の時空操作術",
      user: "leona"
    },
    "void_sigils": {
      name: "虚無の印章",
      faction: "nightglass",
      description: "Nightglass の破壊魔法",
      user: "sable"
    },
    "resonance_device": {
      name: "共鳴装置",
      faction: "stormveil",
      description: "Stormveil の魔術技術",
      user: "talan"
    },
    "poison_traps": {
      name: "毒の罠",
      faction: "nightglass",
      description: "Nightglass の暗殺術",
      user: "vesper, ilyra"
    },
    "storm_calling": {
      name: "嵐召喚",
      faction: "stormveil",
      description: "Talan Mir の攻撃魔法",
      user: "talan"
    }
  },

  // ターン別重要イベント
  keyEvents: {
    3: {
      title: "雷軍団の最後通牒",
      type: "major_battle",
      result: "Ironbound 勝利、Ilyra & Vesper 捕獲",
      participants: ["ironbound", "nightglass"],
      impact: "戦略的転換点"
    },
    5: {
      title: "共鳴嵐の救出作戦",
      type: "rescue_operation",
      result: "Ilyra 救出成功",
      participants: ["nightglass", "ironbound"],
      impact: "希望の光"
    },
    9: {
      title: "守護者の試練",
      type: "divine_judgment",
      result: "Ironbound の正統性確立",
      participants: ["ironbound", "nightglass", "stormveil"],
      impact: "正統性確立"
    },
    13: {
      title: "干潮の窓",
      type: "infiltration",
      result: "地下侵入阻止",
      participants: ["nightglass", "ironbound"],
      impact: "防御完成"
    },
    19: {
      title: "礼拝堂通気口からの侵入",
      type: "infiltration",
      result: "最終防御成功、Ilyra 再捕獲",
      participants: ["nightglass", "ironbound"],
      impact: "勝利確定"
    },
    20: {
      title: "最終判決",
      type: "legal_resolution",
      result: "復興契約判決",
      participants: ["ironbound", "nightglass", "stormveil"],
      impact: "新章開始"
    }
  },

  // ターン別タイトル
  turnTitles: [
    "", // インデックス0は空
    "Shadowfen Crossing への進軍",
    "Ironbound の強襲",
    "雷軍団の最後通牒",
    "戦争機械の脈動",
    "共鳴嵐の救出作戦",
    "市場の混乱",
    "イオン嵐の中の追跡",
    "玄武岩の守護者の目覚め",
    "守護者の試練",
    "Emberfront の封鎖",
    "武器没収と闇市場",
    "Culvert の音響発見",
    "干潮の窓",
    "夜明けの法廷",
    "観衆の圧力",
    "軍需将校の証言",
    "反対尋問の展開",
    "判事の熟議",
    "礼拝堂通気口からの侵入",
    "最終判決"
  ],

  // 経済データ（初期値）
  initialEconomy: {
    ironbound: {
      currency: 150,
      combat: 9,
      exploration: 4,
      diplomacy: 2,
      morale: 7,
      resources: {
        iron: 20,
        food: 30,
        mana_crystal: 4
      }
    },
    nightglass: {
      currency: 130,
      combat: 7,
      exploration: 8,
      diplomacy: 6,
      morale: 6,
      resources: {
        poison: 12,
        obsidian: 8,
        food: 20
      }
    },
    stormveil: {
      currency: 140,
      combat: 6,
      exploration: 5,
      diplomacy: 8,
      morale: 8,
      resources: {
        mana_crystal: 18,
        silk: 10,
        food: 15
      }
    }
  }
};

// グローバルエクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = campaignData;
} else {
  window.campaignData = campaignData;
}