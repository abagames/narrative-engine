// Triple‑Light Linked Ring – Data Dictionary
// Auto-generated data dictionary: locations, characters, tactics, events etc.

const campaignData = {
  // Meta Information
  meta: {
    title: "Triple Light Linked Ring",
    titleJa: "Triple Light Linked Ring Conflict",
    subtitle: "Epic tale of the Silver Eclipse Cycle",
    subtitleJa: "Epic tale of the Silver Eclipse Cycle",
    totalTurns: 14,
    factions: ["auric", "veilbreak"],
    startDate: "2024",
    endDate: "2024",
  },

  // Faction Data
  factions: {
    auric: {
      name: "Auric Covenant",
      nameJa: "Auric Covenant",
      icon: "🌟",
      emoji: "🌟",
      primaryColor: "#ffd700",
      secondaryColor: "#b8860b",
      speciality: "Sacred rituals and diplomacy",
      specialityJa: "Sacred rituals and diplomacy",
      homeBase: "Moonweave Crossroads",
      philosophy:
        "Cooperative democratic decision-making based on careful analysis, formal diplomacy aligned with temple protocols",
      philosophyJa:
        "Cooperative democratic decision-making based on careful analysis, formal diplomacy aligned with temple protocols",
    },
    veilbreak: {
      name: "Veilbreak Sentinels",
      nameJa: "Veilbreak Sentinels",
      icon: "⚡",
      emoji: "⚡",
      primaryColor: "#8a2be2",
      secondaryColor: "#4b0082",
      speciality: "Tactical disruption and blockade operations",
      specialityJa: "Tactical disruption and blockade operations",
      homeBase: "Ashen Ramparts",
      philosophy:
        "Calculated ambushes under direct command, quick decisive action with military codes",
      philosophyJa:
        "Calculated ambushes under direct command, quick decisive action with military codes",
    },
  },

  // Character Data
  characters: {
    // Auric Covenant
    selene: {
      name: "High Cantor Selene",
      nameJa: "High Cantor Selene",
      faction: "auric",
      role: "Ritual Conductor",
      roleJa: "Ritual Conductor",
      description:
        "Devoted and serene personality, oversees sacred rituals and barrier magic",
      descriptionJa:
        "Devoted and serene personality, oversees sacred rituals and barrier magic",
      speech: "Gentle tone with prayers woven into words",
      speechJa: "Gentle tone with prayers woven into words",
      specialties: ["Sacred rituals", "Barrier magic", "Prayer chanting"],
      specialtiesJa: ["Sacred rituals", "Barrier magic", "Prayer chanting"],
    },
    thalen: {
      name: "Warden Thalen",
      nameJa: "Warden Thalen",
      faction: "auric",
      role: "Guardian",
      description:
        "Protective and steadfast personality, specializes in spear combat and guardian techniques",
      speech: "Brief and decisive, urges vigilance",
      specialties: ["Spear combat", "Guardian techniques", "Formation command"],
    },
    lyra: {
      name: "Oracle Lyra",
      nameJa: "Oracle Lyra",
      faction: "auric",
      role: "Seer",
      description:
        "Insightful and introspective personality, specializes in divination and star observation",
      speech: "Metaphorical like chanting",
      specialties: ["Divination", "Star observation", "Mist path reading"],
    },
    iven: {
      name: "Chronicler Iven",
      nameJa: "Chronicler Iven",
      faction: "auric",
      role: "Diplomat",
      description:
        "Diplomatic and sincere personality, handles negotiations and ceremonial records",
      speech: "Polite and values diplomatic etiquette",
      specialties: [
        "Diplomatic negotiation",
        "Ceremonial history",
        "Alliance formation",
      ],
    },
    // Veilbreak Sentinels
    raxen: {
      name: "Captain Raxen",
      nameJa: "Captain Raxen",
      faction: "veilbreak",
      role: "Commander",
      description:
        "Calm and aggressive personality, handles tactical command and assault operations",
      speech: "Brief and commanding",
      specialties: [
        "Tactical command",
        "Assault operations",
        "Blockade strategy",
      ],
    },
    nyx: {
      name: "Shade Operative Nyx",
      nameJa: "Shade Operative Nyx",
      faction: "veilbreak",
      role: "Saboteur",
      description:
        "Cunning and quiet personality, handles infiltration and trap deployment",
      speech: "Whispers only key points",
      specialties: [
        "Infiltration",
        "Trap deployment",
        "Shadow thread manipulation",
      ],
    },
    varek: {
      name: "Oathbreaker Varek",
      nameJa: "Oathbreaker Varek",
      faction: "veilbreak",
      role: "Enforcer",
      description:
        "Fierce and provocative personality, handles heavy combat and blockades",
      speech: "Sarcastic and intimidating",
      specialties: [
        "Heavy combat",
        "Blockade operations",
        "Shadow explosion techniques",
      ],
    },
  },

  // Location Data
  locations: {
    moonweave: {
      name: "Moonweave Crossroads",
      nameJa: "Moonweave Crossroads",
      type: "Trade City",
      capacity: 2,
      specialEffect: "Ritual Focus Bonus",
      strategicValue:
        "Transportation hub to three temples, economic and religious center",
      controlledBy: "auric",
      adjacentAreas: ["Solace Sanctum", "Verdant Outskirts", "Ashen Ramparts"],
      resources: ["Market Stalls", "Pilgrim Hostelry"],
    },
    solace: {
      name: "Solace Sanctum",
      nameJa: "Solace Sanctum",
      type: "Temple - Triple Light First Temple",
      capacity: 1,
      specialEffect: "Prayer Resonance",
      strategicValue: "Ritual starting point, Solace guardian effect",
      controlledBy: "Neutral",
      adjacentAreas: ["Moonweave Crossroads", "Stormspire Temple"],
      resources: ["Sun-Fire Altar"],
    },
    stormspire: {
      name: "Stormspire Temple",
      nameJa: "Stormspire Temple",
      type: "Temple - Triple Light Third Temple",
      capacity: 1,
      specialEffect: "Aerial Ward",
      strategicValue: "Final battle stage, lightning trial ground",
      controlledBy: "Neutral",
      adjacentAreas: [
        "Solace Sanctum",
        "Embershroud Basilica",
        "Ashen Ramparts",
      ],
      resources: ["Storm-Marked Obelisk"],
    },
    embershroud: {
      name: "Embershroud Basilica",
      nameJa: "Embershroud Basilica",
      type: "Temple - Triple Light Second Temple",
      capacity: 1,
      specialEffect: "Veil-Burn Ward, Leyline Tremor",
      strategicValue: "Fire trial ground, leyline amplification effect",
      controlledBy: "Neutral",
      adjacentAreas: ["Stormspire Temple", "Veilborn Way"],
      resources: ["火焔井戸"],
    },
    ashen: {
      name: "Ashen Ramparts",
      nameJa: "Ashen Ramparts",
      type: "Military Fortress",
      capacity: 2,
      specialEffect: "Fortified Gates",
      strategicValue:
        "Military stronghold, blockade base against temple clusters",
      controlledBy: "veilbreak",
      adjacentAreas: [
        "Moonweave Crossroads",
        "Stormspire Temple",
        "Veilborn Way",
      ],
      resources: ["Siege Engines"],
    },
    verdant: {
      name: "Verdant Outskirts",
      nameJa: "Verdant Outskirts",
      type: "Forest",
      capacity: 2,
      specialEffect: "Stealth Routes, Twilight Guides",
      strategicValue: "Detour route security, supply and intelligence support",
      controlledBy: "Neutral (Covenant-Allied)",
      adjacentAreas: ["Moonweave Crossroads", "Veilborn Way"],
      resources: ["Herb Groves", "Hidden Paths", "Lumen-Spore Beacon"],
    },
    veilborn: {
      name: "Veilborn Way",
      nameJa: "Veilborn Way",
      type: "Ancient Ruins",
      capacity: 2,
      specialEffect: "Sabotage Route",
      strategicValue: "Strategic stronghold, shadow snare deployment zone",
      controlledBy: "Neutral (Contested)",
      adjacentAreas: [
        "Ashen Ramparts",
        "Embershroud Basilica",
        "Verdant Outskirts",
      ],
      resources: ["Ley Shards"],
    },
  },

  // Tactics & Magic Terms
  tacticsAndMagic: {
    ritual_chanting: {
      name: "Ritual Chanting",
      nameJa: "Ritual Chanting",
      faction: "auric",
      description:
        "Sacred prayer chanting that forms the Triple Light Linked Ring ritual",
      user: "selene, lyra",
    },
    guardian_formation: {
      name: "Guardian Formation",
      nameJa: "Guardian Formation",
      faction: "auric",
      description: "Defensive formation centered on Thalen's spear techniques",
      user: "thalen",
    },
    light_barrier: {
      name: "Light Barrier",
      nameJa: "Light Barrier",
      faction: "auric",
      description: "Protective barrier technique using sacred magic",
      user: "selene",
    },
    storm_shield: {
      name: "Storm Shield",
      nameJa: "Storm Shield",
      faction: "auric",
      description: "Ultimate defensive technique used in the final battle",
      user: "selene, thalen",
    },
    shadow_snare: {
      name: "Shadow Snare",
      nameJa: "影縄",
      faction: "veilbreak",
      description: "Veilbreak's shadow art blockade and restraint techniques",
      user: "nyx",
    },
    shadow_stakes: {
      name: "Shadow Stakes",
      nameJa: "影の杭",
      faction: "veilbreak",
      description: "Shadow art terrain control and blockade techniques",
      user: "nyx",
    },
    lightning_spear: {
      name: "Lightning Spear",
      nameJa: "雷槍",
      faction: "veilbreak",
      description: "Long-range attack weapon imbued with lightning power",
      user: "raxen, varek",
    },
    shadow_explosion: {
      name: "Shadow Explosion",
      nameJa: "影爆",
      faction: "veilbreak",
      description: "Explosive attack technique using shadow arts",
      user: "varek",
    },
  },

  // Resources & Items
  resources: {
    incense: {
      name: "Incense",
      nameJa: "Incense",
      type: "sacred",
      description:
        "Incense used in sacred rituals. Essential for the Triple Light Linked Ring ceremony",
      faction: "auric",
    },
    sun_fragment: {
      name: "Sun Fragments",
      nameJa: "Sun Fragments",
      type: "sacred",
      description: "Ancient sacred relic. Powerful catalyst for sacred magic",
      faction: "auric",
    },
    guardian_scroll: {
      name: "Guardian Scrolls",
      nameJa: "Guardian Scrolls",
      type: "magic",
      description: "Magic scrolls inscribed with guardian techniques",
      faction: "auric",
    },
    light_resin: {
      name: "Light-Flower Resin",
      nameJa: "Light-Flower Resin",
      type: "magic",
      description: "Luminous resin. Talisman material for anti-shadow tactics",
      faction: "auric",
    },
    shadow_poison: {
      name: "Shadow Poison",
      nameJa: "Shadow Poison",
      type: "poison",
      description: "Special agent used in shadow arts",
      faction: "veilbreak",
    },
    far_sight: {
      name: "Far-sight Mirrors",
      nameJa: "Far-sight Mirrors",
      type: "tool",
      description: "Optical devices for long-range surveillance",
      faction: "veilbreak",
    },
    supply_ration: {
      name: "Supply Rations",
      nameJa: "Supply Rations",
      type: "food",
      description: "Preserved food for military operations",
      faction: "veilbreak",
    },
  },

  // Key Events per Turn
  keyEvents: {
    2: {
      title: "First Movement Completed",
      type: "ritual_success",
      result: "Achieved 1/3 ritual progress, discovered bypass route",
      participants: ["auric"],
      impact: "First step toward the Triple Light Linked Ring",
    },
    3: {
      title: "Pact with the Twilight Guide",
      type: "alliance",
      result: "Gained safe passage rights through the mist paths",
      participants: ["auric", "duskway_guides"],
      impact: "Successfully secured detour route",
    },
    6: {
      title: "Breakthrough into Veilborn Way",
      type: "direct_confrontation",
      result: "Both factions begin confrontation at the same location",
      participants: ["auric", "veilbreak"],
      impact: "Beginning of direct conflict",
    },
    10: {
      title: "Second Movement Completed and Flame-Wind Battle",
      type: "combat_ritual",
      result:
        "Repelled Sentinels' assault with barrier, completed second movement",
      participants: ["auric", "veilbreak"],
      impact: "Achieved 2/3 ritual progress",
    },
    11: {
      title: "Pact with the Ember Guardians",
      type: "alliance",
      result:
        "Obtained calm wind window information, final preparations complete",
      participants: ["auric", "ember_guardians"],
      impact: "Secured path to final battle",
    },
    14: {
      title: "Completion of the Triple Light Linked Ring",
      type: "final_victory",
      result: "Victory of light, completion of sacred covenant",
      participants: ["auric", "veilbreak"],
      impact: "Campaign completed, establishment of light's protection",
    },
  },

  // Turn Titles
  turnTitles: [
    "", // Index 0 is empty
    "Storm's Eve Deployment and the Moonweave Crossroads",
    "First Movement Completion at Solace Sanctum",
    "Pact with the Twilight Guide",
    "Movement to the Verdant Outskirts",
    "Light-Flower Resin Collection and Leyline Tremors",
    "Breakthrough into Veilborn Way",
    "Eclipse Shadows and Light Path Construction",
    "Afterimage Trap Analysis and Battle Preparation",
    "Breakthrough into Embershroud Basilica",
    "Second Movement Prayer and Flame-Wind Battle",
    "Pact with Ember Guardians and Calm Wind Window Discovery",
    "Breakthrough into Stormspire Temple",
    "Storm Shield Barrier and Final Preparations",
    "Completion of Triple Light Linked Ring and Victory of Light",
  ],

  // Economy Data (initial values)
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
        guardian_scroll: 2,
      },
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
        supply_ration: 5,
      },
    },
  },

  // Final Statistics
  finalStats: {
    auric: {
      finalMorale: 9.1,
      achievement: "Triple Light Linked Ring ritual completed",
      allianceCount: 3,
      ritualsCompleted: 3,
    },
    veilbreak: {
      finalMorale: 7.3,
      achievement: "Fought valiantly but failed to prevent",
      sabotageAttempts: 2,
      blockadeSuccess: 1,
    },
  },
};

// Global export
if (typeof module !== "undefined" && module.exports) {
  module.exports = campaignData;
} else {
  window.campaignData = campaignData;
}
