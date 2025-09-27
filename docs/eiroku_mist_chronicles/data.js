// Eiroku Mist Chronicles - Data Dictionary
// Auto-generated data dictionary: place names, characters, tactical terms, events, etc.

const campaignData = {
  // Meta information
  meta: {
    title: "Eiroku Mist Chronicles",
    subtitle: "Eiroku Mist Chronicles",
    totalTurns: 20,
    factions: ["shadow_gale", "moonlit_onmyo", "crimson_blade", "silver_dutch"],
    era: "Chaotic Eiroku Era",
    season: "Early Summer"
  },

  // Faction data
  factions: {
    shadow_gale: {
      name: "Shadow Gale Clan",
      nameEn: "Shadow Gale Clan",
      icon: "🌫️",
      emoji: "🌫️",
      primaryColor: "#2C3E50",
      secondaryColor: "#34495E",
      speciality: "Ninjutsu & Espionage",
      homeBase: "Ise Shadow Vale",
      faction: "Iga Jōnin, Momochi Tanba Family",
      philosophy: "Shadow warfare through quiet observation and opportunistic calculation"
    },
    moonlit_onmyo: {
      name: "Moonlit Onmyo Guild",
      nameEn: "Moonlit Onmyo Guild",
      icon: "🌙",
      emoji: "🌙",
      primaryColor: "#663399",
      secondaryColor: "#9966CC",
      speciality: "Onmyōdō & Barrier Arts",
      homeBase: "Kumano Spirit Shrine",
      faction: "Kyoto Civil-Military Mediation Group, Ashikaga Family",
      philosophy: "Spiritual protection through divinatory prediction and ceremonial consensus"
    },
    crimson_blade: {
      name: "Crimson Blade Vanguard",
      nameEn: "Crimson Blade Vanguard",
      icon: "⚔️",
      emoji: "⚔️",
      primaryColor: "#DC3545",
      secondaryColor: "#C82333",
      speciality: "Bushidō Swordsmanship & Cavalry Tactics",
      homeBase: "Sakurai Dueling Fields",
      faction: "Kai Takeda Family, Mounted Warrior Corps",
      philosophy: "Direct military command through decisive charges and martial valor"
    },
    silver_dutch: {
      name: "Silver Dutch Institute",
      nameEn: "Silver Dutch Institute",
      icon: "⚙️",
      emoji: "⚙️",
      primaryColor: "#17A2B8",
      secondaryColor: "#138496",
      speciality: "Western Engineering & Mechanical Arts",
      homeBase: "Edo Arsenal Dock",
      faction: "Nagasaki Dejima Western Technology Magistrate Branch, Ōtomo Family",
      philosophy: "Technological innovation through iterative prototyping and multilingual councils"
    }
  },

  // Character data
  characters: {
    // Shadow Gale Clan
    kiryu_aoi: {
      name: "Kiryu Aoi",
      faction: "shadow_gale",
      role: "Shadow Leader",
      personality: "Quiet and perceptive",
      speechStyle: "Commands quietly in a low voice",
      specialization: "Strategy & infiltration"
    },
    fuma_jin: {
      name: "Fuma Jin",
      faction: "shadow_gale",
      role: "Advanced Scout",
      personality: "Cynical and bold",
      speechStyle: "Provocative whispers",
      specialization: "Reconnaissance & disruption"
    },
    nuedo_kogetsu: {
      name: "Nuedo Kogetsu",
      faction: "shadow_gale",
      role: "Poison Master",
      personality: "Calm and composed",
      speechStyle: "Detached analytical reports",
      specialization: "Poison & illusion synthesis"
    },

    // Moonlit Onmyo Guild
    manai_sakuya: {
      name: "Manai Sakuya",
      faction: "moonlit_onmyo",
      role: "Onmyo Head",
      personality: "Quiet passionate",
      speechStyle: "Oracles woven with waka poetry",
      specialization: "Barrier arts"
    },
    karasumaru_kaya: {
      name: "Karasumaru Kaya",
      faction: "moonlit_onmyo",
      role: "Shikigami User",
      personality: "Bold and intuitive",
      speechStyle: "Straightforward unadorned assertions",
      specialization: "Combat shikigami operations"
    },
    ashiya_hotaru: {
      name: "Ashiya Hotaru",
      faction: "moonlit_onmyo",
      role: "Diviner",
      personality: "Introspective with keen observation",
      speechStyle: "Quiet whispers",
      specialization: "Future sight & spirit vision"
    },

    // Crimson Blade Vanguard
    sanada_rekka: {
      name: "Sanada Rekka",
      faction: "crimson_blade",
      role: "Captain",
      personality: "Bold with strong fighting spirit",
      speechStyle: "Powerful and direct rallying cries",
      specialization: "Spear cavalry command"
    },
    yuki_sayone: {
      name: "Yuki Sayone",
      faction: "crimson_blade",
      role: "Swordsman",
      personality: "Calm seeker of the way",
      speechStyle: "Quiet analysis of sword theory",
      specialization: "Dual-sword style"
    },
    sasaki_rinkuro: {
      name: "Sasaki Rinkuro",
      faction: "crimson_blade",
      role: "Strategist",
      personality: "Veteran strategist",
      speechStyle: "Weighty low voice giving orders",
      specialization: "Formation & range control"
    },

    // Silver Dutch Institute
    johan_stark: {
      name: "Johan van der Stark",
      faction: "silver_dutch",
      role: "Technical Director",
      personality: "Theoretical and methodical",
      speechStyle: "Polite Japanese mixed with Dutch",
      specialization: "Artillery engineering"
    },
    okame_tsuyaku: {
      name: "Interpreter Okame",
      faction: "silver_dutch",
      role: "Diplomatic Translator",
      personality: "Sociable and courageous",
      speechStyle: "Gentle Hizen dialect coordination",
      specialization: "Negotiation & intelligence gathering"
    },
    hendrik_spiker: {
      name: "Hendrik Spiker",
      faction: "silver_dutch",
      role: "Armament Engineer",
      personality: "Curious inventor",
      speechStyle: "Rapid technical terminology listing",
      specialization: "Mechanical weapon design"
    }
  },

  // Location data
  locations: {
    ise_shadow_vale: {
      name: "Ise Shadow Vale",
      type: "Forest",
      description: "Sacred ground of ninjutsu, covert infiltration route to Kyoto",
      capacity: 2,
      resources: ["Shadow lotus", "Silk contracts"],
      specialEffects: ["Night veil: Stealth judgment +2", "Mist marsh: Movement cost +1"],
      controllingFaction: "shadow_gale"
    },
    koga_mist_forest: {
      name: "Koga Mist Forest",
      type: "Mist forest",
      description: "Neutral territory, treasure trove of hidden paths and rare medicinal herbs",
      capacity: 3,
      resources: ["Rare herbs", "Mist silk"],
      specialEffects: ["Mist veil: Scout detection difficulty increased", "Hidden paths: Secret routes"],
      controllingFaction: null
    },
    kumano_spirit_shrine: {
      name: "Kumano Spirit Shrine",
      type: "Shrine",
      description: "Center of Onmyōdō, stronghold of spiritual protection",
      capacity: 2,
      resources: ["Spirit talismans", "Sacred water"],
      specialEffects: ["Spirit flow: Mystical arts judgment +2", "Divine blessing: Prayer success rate improvement"],
      controllingFaction: "moonlit_onmyo"
    },
    kyoto_arcane_quarter: {
      name: "Kyoto Arcane Quarter",
      type: "City",
      description: "Political center, key location for negotiations with the Imperial Court",
      capacity: 4,
      resources: ["Moon silver", "Scholar scrolls", "Imperial influence"],
      specialEffects: ["Court intrigue: Diplomatic judgment +1", "Mystical library: Magical research efficiency +2"],
      controllingFaction: null
    },
    edo_arsenal_dock: {
      name: "Edo Arsenal Dock",
      type: "Harbor",
      description: "Introduction hub for Western technology, center of trade and military technology",
      capacity: 3,
      resources: ["Gunpowder", "Foreign firearms", "Trade contracts"],
      specialEffects: ["Naval supply: Supply efficiency +2", "Western connection: Diplomatic negotiation +2"],
      controllingFaction: "silver_dutch"
    },
    azuchi_clockwork_foundry: {
      name: "Azuchi Clockwork Foundry",
      type: "Industrial",
      description: "Center of technological innovation, site of the goose formation cannon discovery",
      capacity: 3,
      resources: ["Gear components", "Refined iron"],
      specialEffects: ["Gear resonance: Engineering judgment +2", "Smoke screen: Visibility -1"],
      controllingFaction: null
    },
    sakurai_dueling_fields: {
      name: "Sakurai Dueling Fields",
      type: "Plains",
      description: "Sacred ground of martial arts, cavalry tactics training stronghold",
      capacity: 2,
      resources: ["Folded steel", "Training grounds"],
      specialEffects: ["Mutual refinement: Sword training success rate +2", "Banner wind: Morale +1"],
      controllingFaction: "crimson_blade"
    }
  },

  // Terms dictionary
  terms: {
    shadow_gale_clan: {
      term: "Shadow Gale Clan",
      description: "Ninja group under Iga Jōnin Momochi Tanba family. Led by Kiryu Aoi, specializing in espionage warfare and infiltration operations."
    },
    moonlit_onmyo_guild: {
      term: "Moonlit Onmyō Guild",
      description: "Onmyōji group belonging to the Ashikaga family. Led by Manai Sakuya, responsible for spiritual protection of Kyoto through barrier arts and shikigami operations."
    },
    ganko_cannon: {
      term: "Goose Formation Cannon",
      description: "Prototype design of Western-style ōtsutsumi (large cannon). Discovered at Azuchi Clockwork Foundry, a strategic weapon that escalated tensions between Takeda and Ōtomo to their peak."
    },
    azuchi_foundry: {
      term: "Azuchi Clockwork Foundry",
      description: "Industrial stronghold in Ōmi Province where Western technology and Japanese craftsmanship merge."
    },
    imperial_duel: {
      term: "Imperial Duel",
      description: "Official duel conducted by Imperial emergency martial arbitration decree. A historic martial trial where representatives of the Onmyō Guild and Shadow Gale faced each other in the Kyoto Arcane Quarter."
    },
    court_inspection: {
      term: "Imperial Court Inspection",
      description: "Inspector dispatched by the Emperor. Arrived in Kyoto and demanded submission of ninja and onmyōji negotiation records, representing significant political pressure."
    },
    chaos_judgment: {
      term: "Chaos Melee Ruling",
      description: "Critical turning point where the dueling ring was shattered by lightning, causing the combat format to change from individual duels to a four-faction free-for-all melee."
    }
  },

  // Statistics data
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

  // Turn-based important events
  turningPoints: {
    turn2: {
      title: "Goose Formation Cannon Discovery",
      description: "Technological turning point: from mere factional conflict to full-scale hegemony struggle over military technology",
      type: "Technological innovation"
    },
    turn6: {
      title: "Imperial Duel Declaration",
      description: "Decisive battle of fate: By Imperial ruling, secret conflicts elevated to official decisive battle",
      type: "Political transformation"
    },
    turn8: {
      title: "Dueling Ring Shattered",
      description: "Transition to chaos: from individual duels to four-faction free-for-all melee",
      type: "Tactical transformation"
    },
    turn9: {
      title: "Imperial Guard Intervention",
      description: "Exercise of Imperial authority: forced ceasefire declaration by the Imperial Guard",
      type: "Political intervention"
    }
  }
};

// Data search helper functions
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