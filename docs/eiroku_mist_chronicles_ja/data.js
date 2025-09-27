// 永禄の霧戦記 - Data Dictionary
// 自動生成されたデータ辞書：地名、キャラクター、戦術用語、イベント等

const campaignData = {
  // メタ情報
  meta: {
    title: "永禄の霧戦記",
    subtitle: "Eiroku Mist Chronicles",
    totalTurns: 20,
    factions: ["shadow_gale", "moonlit_onmyo", "crimson_blade", "silver_dutch"],
    era: "永禄の乱世",
    season: "初夏"
  },

  // 勢力データ
  factions: {
    shadow_gale: {
      name: "影颶の衆",
      nameEn: "Shadow Gale Clan",
      icon: "🌫️",
      emoji: "🌫️",
      primaryColor: "#2C3E50",
      secondaryColor: "#34495E",
      speciality: "忍術・諜報戦",
      homeBase: "伊勢影ヶ淵",
      faction: "伊賀上忍・百地丹波家",
      philosophy: "静謐な洞察と機会主義的計算による暗躍戦略"
    },
    moonlit_onmyo: {
      name: "月影陰陽寮",
      nameEn: "Moonlit Onmyo Guild",
      icon: "🌙",
      emoji: "🌙",
      primaryColor: "#663399",
      secondaryColor: "#9966CC",
      speciality: "陰陽道・結界術",
      homeBase: "熊野霊峰社",
      faction: "京洛公武調停衆・足利家",
      philosophy: "占術的予測と儀礼的合意による霊的守護"
    },
    crimson_blade: {
      name: "紅刃先鋒隊",
      nameEn: "Crimson Blade Vanguard",
      icon: "⚔️",
      emoji: "⚔️",
      primaryColor: "#DC3545",
      secondaryColor: "#C82333",
      speciality: "武士道剣術・騎馬戦術",
      homeBase: "桜井試合原",
      faction: "甲斐武田家・騎馬武者団",
      philosophy: "決断的突撃と武辺による直截な軍事指揮"
    },
    silver_dutch: {
      name: "銀蘭機巧院",
      nameEn: "Silver Dutch Institute",
      icon: "⚙️",
      emoji: "⚙️",
      primaryColor: "#17A2B8",
      secondaryColor: "#138496",
      speciality: "西洋技術工学・機巧術",
      homeBase: "江戸武備船渠",
      faction: "長崎出島西洋技術奉行支局・大友家",
      philosophy: "反復試作と多言語議会による技術革新"
    }
  },

  // キャラクターデータ
  characters: {
    // 影颶の衆
    kiryu_aoi: {
      name: "霧生 葵",
      faction: "shadow_gale",
      role: "影衆頭",
      personality: "静謐で洞察深い",
      speechStyle: "低い声で短く命じる",
      specialization: "戦略立案と潜入"
    },
    fuma_jin: {
      name: "風魔 迅",
      faction: "shadow_gale",
      role: "機先斥候",
      personality: "皮肉屋で大胆",
      speechStyle: "挑発混じりのささやき",
      specialization: "索敵と撹乱"
    },
    nuedo_kogetsu: {
      name: "鵺堂 紅月",
      faction: "shadow_gale",
      role: "毒薬師",
      personality: "冷静沈着",
      speechStyle: "淡々と分析報告",
      specialization: "毒と幻術調合"
    },

    // 月影陰陽寮
    manai_sakuya: {
      name: "真名井 朔夜",
      faction: "moonlit_onmyo",
      role: "陰陽頭",
      personality: "静かな情熱家",
      speechStyle: "和歌を織り込んだ宣託",
      specialization: "結界術"
    },
    karasumaru_kaya: {
      name: "烏丸 伽耶",
      faction: "moonlit_onmyo",
      role: "式神使い",
      personality: "豪胆で直感的",
      speechStyle: "率直で飾り気のない断言",
      specialization: "戦闘式神運用"
    },
    ashiya_hotaru: {
      name: "蘆屋 蛍",
      faction: "moonlit_onmyo",
      role: "占術士",
      personality: "内省的で観察眼鋭い",
      speechStyle: "静かな囁き",
      specialization: "未来視と霊視"
    },

    // 紅刃先鋒隊
    sanada_rekka: {
      name: "真田 烈火",
      faction: "crimson_blade",
      role: "隊長",
      personality: "豪胆で闘志旺盛",
      speechStyle: "力強く端的な檄",
      specialization: "槍騎兵指揮"
    },
    yuki_sayone: {
      name: "結城 鞘音",
      faction: "crimson_blade",
      role: "剣士",
      personality: "冷静な求道者",
      speechStyle: "静かな剣術理論の分析",
      specialization: "二刀流剣術"
    },
    sasaki_rinkuro: {
      name: "佐々木 凜九郎",
      faction: "crimson_blade",
      role: "軍師",
      personality: "老練で策略家",
      speechStyle: "重みのある低声で指示",
      specialization: "布陣と間合い制御"
    },

    // 銀蘭機巧院
    johan_stark: {
      name: "ヨハン・ファン・デル・スターク",
      faction: "silver_dutch",
      role: "技術院長",
      personality: "理論派で几帳面",
      speechStyle: "蘭語混じりの丁寧な和訳",
      specialization: "砲術工学"
    },
    okame_tsuyaku: {
      name: "通詞 お亀",
      faction: "silver_dutch",
      role: "外交通訳",
      personality: "社交的で度胸がある",
      speechStyle: "柔らかな肥前訛りで調整",
      specialization: "交渉と情報収集"
    },
    hendrik_spiker: {
      name: "ヘンドリク・スパイカー",
      faction: "silver_dutch",
      role: "兵装技師",
      personality: "好奇心旺盛な発明家",
      speechStyle: "早口で技術用語を列挙",
      specialization: "機巧武器設計"
    }
  },

  // 地域データ
  locations: {
    ise_shadow_vale: {
      name: "伊勢影ヶ淵",
      type: "森林",
      description: "忍術の聖地、京洛への隠密侵入ルート",
      capacity: 2,
      resources: ["影蓮", "絹契約書"],
      specialEffects: ["夜帳: 隠密判定+2", "霧沼: 移動コスト+1"],
      controllingFaction: "shadow_gale"
    },
    koga_mist_forest: {
      name: "甲賀朧林",
      type: "霧林",
      description: "中立地域、隠し道と珍薬草の宝庫",
      capacity: 3,
      resources: ["珍薬草", "霧絹"],
      specialEffects: ["霧幕: 斥候判定難化", "隠し道: 秘密経路"],
      controllingFaction: null
    },
    kumano_spirit_shrine: {
      name: "熊野霊峰社",
      type: "神社",
      description: "陰陽道の中心地、霊的守護の拠点",
      capacity: 2,
      resources: ["霊符", "霊水"],
      specialEffects: ["霊流: 妖術判定+2", "神恩: 祝詞成功率向上"],
      controllingFaction: "moonlit_onmyo"
    },
    kyoto_arcane_quarter: {
      name: "京洛術院区",
      type: "都市",
      description: "政治中枢、朝廷との交渉の要地",
      capacity: 4,
      resources: ["月銀", "学者巻物", "朝廷影響力"],
      specialEffects: ["宮廷陰謀: 外交判定+1", "妖術図書館: 妖術研究効率+2"],
      controllingFaction: null
    },
    edo_arsenal_dock: {
      name: "江戸武備船渠",
      type: "港湾",
      description: "西洋技術の導入拠点、貿易と軍事技術の中心",
      capacity: 3,
      resources: ["火薬", "南蛮銃", "貿易契約"],
      specialEffects: ["海軍補給: 補給効率+2", "西洋接続: 外交交渉+2"],
      controllingFaction: "silver_dutch"
    },
    azuchi_clockwork_foundry: {
      name: "安土機巧炉",
      type: "工業",
      description: "技術革新の中心地、雁行砲発見の舞台",
      capacity: 3,
      resources: ["歯車部品", "精錬鉄"],
      specialEffects: ["歯車共鳴: 工学判定+2", "煙幕: 視界-1"],
      controllingFaction: null
    },
    sakurai_dueling_fields: {
      name: "桜井試合原",
      type: "平原",
      description: "武術の聖地、騎馬戦術の訓練拠点",
      capacity: 2,
      resources: ["折鉄", "訓練場"],
      specialEffects: ["切磋同調: 剣術訓練成功率+2", "旗風: 士気+1"],
      controllingFaction: "crimson_blade"
    }
  },

  // 用語辞書
  terms: {
    shadow_gale_clan: {
      term: "影颶の衆",
      description: "伊賀上忍・百地丹波家配下の忍び衆。霧生葵を頭として、諜報戦と潜入作戦を専門とする。"
    },
    moonlit_onmyo_guild: {
      term: "月影陰陽寮",
      description: "足利家に属する陰陽師集団。真名井朔夜を筆頭に、結界術と式神運用で京洛の霊的守護を担う。"
    },
    ganko_cannon: {
      term: "雁行砲",
      description: "西洋式大筒の試作図。安土機巧炉で発見され、武田と大友の緊張を最高潮に押し上げた戦略兵器。"
    },
    azuchi_foundry: {
      term: "安土機巧炉",
      description: "近江にある工業拠点で、西洋技術と日本の職人技が融合する場所。"
    },
    imperial_duel: {
      term: "帝勅決闘",
      description: "帝より下された緊急武術裁定の勅により行われる公式決闘。京洛術院区で陰陽寮と影颶の代表が臨むことになった歴史的な武術裁判。"
    },
    court_inspection: {
      term: "朝廷監察",
      description: "帝より派遣された調査官。京洛に到着し、忍びと陰陽の協議記録提出を要求した重要な政治的圧力。"
    },
    chaos_judgment: {
      term: "乱戦判定",
      description: "決闘輪が雷撃で砕けたため、個別決闘から四勢力入り乱れる乱戦へと戦闘形式が変化した重要な転換点。"
    }
  },

  // 統計データ
  statistics: {
    totalTurns: 20,
    totalBattles: 8,
    majorTurningPoints: 4,
    technicalInnovations: 3,
    diplomaticNegotiations: 6,
    factionWins: {
      shadow_gale: 3,
      moonlit_onmyo: 4,
      crimson_blade: 2,
      silver_dutch: 3
    }
  },

  // ターン別重要イベント
  turningPoints: {
    turn2: {
      title: "雁行砲発見",
      description: "技術転換点：単なる勢力争いから軍事技術を巡る本格的な覇権争いへ",
      type: "技術革新"
    },
    turn6: {
      title: "帝勅決闘宣告",
      description: "運命の決戦：帝の裁定により、暗闘が公式の決戦へ格上げ",
      type: "政治的転換"
    },
    turn8: {
      title: "決闘輪砕破",
      description: "混戦への転換：個別決闘から四勢力入り乱れる乱戦へ",
      type: "戦術的転換"
    },
    turn9: {
      title: "近衛府介入",
      description: "帝権の発動：近衛府による強制停戦布告",
      type: "政治的介入"
    }
  }
};

// データ検索用ヘルパー関数
const campaignUtils = {
  getFactionByCharacter: (characterId) => {
    const character = campaignData.characters[characterId];
    return character ? campaignData.factions[character.faction] : null;
  },

  getLocationsByFaction: (factionId) => {
    return Object.values(campaignData.locations).filter(loc =>
      loc.controllingFaction === factionId
    );
  },

  getTurningPointsByType: (type) => {
    return Object.entries(campaignData.turningPoints).filter(([turn, point]) =>
      point.type === type
    );
  }
};