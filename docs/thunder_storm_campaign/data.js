// Thunder Storm Campaign - Data Dictionary (English Version)

const campaignData = {
  meta: {
    title: "Thunder Storm Campaign",
    subtitle: "Narrative Replay",
    totalTurns: 20,
    factions: ["ironbound", "nightglass", "stormveil"],
    startDate: "2024",
    endDate: "2024"
  },

  factions: {
    ironbound: {
      name: "Ironbound Covenant",
      icon: "⚔️",
      emoji: "⚔️",
      primaryColor: "#8B0000",
      secondaryColor: "#4A4A4A",
      speciality: "Combat & Military Command",
      homeBase: "Emberfront Keep",
      philosophy: "Bold opportunistic strategy through experienced leadership"
    },
    nightglass: {
      name: "Nightglass Collective",
      icon: "🌙",
      emoji: "🌙",
      primaryColor: "#4B0082",
      secondaryColor: "#2F2F2F",
      speciality: "Exploration & Assassination",
      homeBase: "Twilight Bog",
      philosophy: "Cautious analytical judgment based on expertise"
    },
    stormveil: {
      name: "Stormveil Circle",
      icon: "⚡",
      emoji: "⚡",
      primaryColor: "#1E90FF",
      secondaryColor: "#FFD700",
      speciality: "Diplomacy & Magical Trade",
      homeBase: "Auric Market",
      philosophy: "Balanced pragmatism through collaborative democracy"
    }
  },

  characters: {
    serah_vance: {
      name: "Commander Serah Vance",
      faction: "ironbound",
      role: "Strategist",
      description: "Indomitable personality, responsible for battlefield command",
      speechStyle: "Concise and authoritative command tone"
    },
    kael_draken: {
      name: "Brother Kael Draken",
      faction: "ironbound",
      role: "Vanguard Warrior",
      description: "Zealous personality, responsible for shield formation",
      speechStyle: "Hoarse-voiced battle cries"
    },
    leona_hale: {
      name: "Archivist Leona Hale",
      faction: "ironbound",
      role: "Battle Mage",
      description: "Strategic personality, responsible for time magic support",
      speechStyle: "Precise and concise analysis"
    },
    ilyra: {
      name: "Shadecaller Ilyra",
      faction: "nightglass",
      role: "Shadow Marshal",
      description: "Calculating personality, responsible for ambush coordination",
      speechStyle: "Whispered suggestions"
    },
    vesper_rune: {
      name: "Vesper Rune",
      faction: "nightglass",
      role: "Assassin",
      description: "Melancholic personality, responsible for poison arts",
      speechStyle: "Concise and sharp statements"
    },
    sable_myrr: {
      name: "Sable Myrr",
      faction: "nightglass",
      role: "Void Witch",
      description: "Obsessive personality, responsible for entropy magic",
      speechStyle: "Quiet theoretical contemplation"
    },
    talan_mir: {
      name: "Archmage Talan Mir",
      faction: "stormveil",
      role: "Grand Mage",
      description: "Calm personality, responsible for storm summoning",
      speechStyle: "Resonant leadership tone"
    },
    lysa_orien: {
      name: "Seer Lysa Orien",
      faction: "stormveil",
      role: "Oracle",
      description: "Empathetic personality, responsible for divination",
      speechStyle: "Gentle and prophetic guidance"
    },
    corrin_faye: {
      name: "Bladesinger Corrin Faye",
      faction: "stormveil",
      role: "Duelist",
      description: "Flamboyant personality, responsible for magical swordplay",
      speechStyle: "Ironic and theatrically confident"
    }
  },

  locations: {
    shadowfen_crossing: {
      name: "Shadowfen Crossing",
      type: "Strategic Ancient Ruins",
      capacity: 2,
      specialEffect: "Ambush bonus, miasma debuff",
      strategicValue: "Most important junction - key crossroads of three regions",
      controlledBy: "Contested (monitored by Thunder Legion)",
      adjacentAreas: ["Twilight Bog", "Crystal Hollow", "Gale Steppe"]
    },
    emberfront_keep: {
      name: "Emberfront Keep",
      type: "Military Fortress",
      capacity: 2,
      specialEffect: "Defensive stronghold, influence bonus",
      strategicValue: "Northeastern military base and gateway to Ashen Ridge",
      controlledBy: "ironbound",
      adjacentAreas: ["Auric Market", "Ashen Ridge"]
    },
    twilight_bog: {
      name: "Twilight Bog",
      type: "Poisonous Swamp",
      capacity: 2,
      specialEffect: "Stealth advantage, movement penalty",
      strategicValue: "Sanctuary for assassins and poison production hub",
      controlledBy: "nightglass",
      adjacentAreas: ["Auric Market", "Gale Steppe", "Shadowfen Crossing"]
    },
    auric_market: {
      name: "Auric Market",
      type: "Commercial City",
      capacity: 3,
      specialEffect: "Market hub, diplomatic influence bonus",
      strategicValue: "Economic center and key hub of diplomacy",
      controlledBy: "stormveil",
      adjacentAreas: ["Emberfront Keep", "Twilight Bog", "Crystal Hollow"]
    },
    crystal_hollow: {
      name: "Crystal Hollow",
      type: "Magical Cave",
      capacity: 2,
      specialEffect: "Unstable mana, resonant echoes",
      strategicValue: "Source of magical power and repository of ancient technology",
      controlledBy: "Neutral (ancient war machines present)",
      adjacentAreas: ["Auric Market", "Ashen Ridge", "Shadowfen Crossing"]
    },
    ashen_ridge: {
      name: "Ashen Ridge",
      type: "Volcanic Mountain Range",
      capacity: 2,
      specialEffect: "Fire hazard, rich in ore",
      strategicValue: "Junction of three regions and the site of the Ancient Guardian's judgment",
      controlledBy: "Neutral (home of the Basalt Guardian)",
      adjacentAreas: ["Emberfront Keep", "Crystal Hollow", "Gale Steppe"]
    },
    gale_steppe: {
      name: "Gale Steppe",
      type: "Wind-swept Plains",
      capacity: 2,
      specialEffect: "Open battlefield, wind tactics",
      strategicValue: "Ideal plains for large-scale battles and cavalry warfare",
      controlledBy: "Neutral (nomadic territory)",
      adjacentAreas: ["Ashen Ridge", "Twilight Bog", "Shadowfen Crossing"]
    }
  },

  tacticsAndMagic: {
    shield_wall: {
      name: "Shield Wall",
      faction: "ironbound",
      description: "Ironbound's organized defensive formation",
      user: "serah, kael"
    },
    time_magic: {
      name: "Time Magic",
      faction: "ironbound",
      description: "Leona's spacetime manipulation",
      user: "leona"
    },
    void_sigils: {
      name: "Void Sigils",
      faction: "nightglass",
      description: "Nightglass entropy magic",
      user: "sable"
    },
    resonance_device: {
      name: "Resonance Device",
      faction: "stormveil",
      description: "Stormveil magical technology",
      user: "talan"
    },
    poison_traps: {
      name: "Poison Traps",
      faction: "nightglass",
      description: "Nightglass assassination technique",
      user: "vesper, ilyra"
    },
    storm_calling: {
      name: "Storm Calling",
      faction: "stormveil",
      description: "Talan Mir's offensive magic",
      user: "talan"
    }
  },

  keyEvents: {
    3: {
      title: "Thunder Legion Ultimatum",
      type: "major_battle",
      result: "Ironbound victory, Ilyra & Vesper captured",
      participants: ["ironbound", "nightglass"],
      impact: "Strategic turning point"
    },
    5: {
      title: "Resonance Storm Rescue Operation",
      type: "rescue_operation",
      result: "Ilyra successfully rescued",
      participants: ["nightglass", "ironbound"],
      impact: "Beacon of hope"
    },
    9: {
      title: "Guardian's Trial",
      type: "divine_judgment",
      result: "Ironbound legitimacy established",
      participants: ["ironbound", "nightglass", "stormveil"],
      impact: "Legitimacy established"
    },
    13: {
      title: "Low Tide Window",
      type: "infiltration",
      result: "Underground infiltration prevented",
      participants: ["nightglass", "ironbound"],
      impact: "Defense completed"
    },
    19: {
      title: "Chapel Vent Infiltration",
      type: "infiltration",
      result: "Final defense successful, Ilyra recaptured",
      participants: ["nightglass", "ironbound"],
      impact: "Victory confirmed"
    },
    20: {
      title: "Final Judgment",
      type: "legal_resolution",
      result: "Reconstruction contract verdict",
      participants: ["ironbound", "nightglass", "stormveil"],
      impact: "New chapter begins"
    }
  },

  turnTitles: [
    "",
    "March to Shadowfen Crossing",
    "Ironbound Assault",
    "Thunder Legion Ultimatum",
    "War Machine Pulsation",
    "Resonance Storm Rescue Operation",
    "Market Chaos",
    "Pursuit Through Ion Storm",
    "Awakening of the Basalt Guardian",
    "Guardian's Trial",
    "Blockade of Emberfront",
    "Weapons Confiscation and Black Market",
    "Culvert Acoustic Discovery",
    "Low Tide Window",
    "Courtroom at Dawn",
    "Pressure from the Audience",
    "Testimony of the Munitions Officer",
    "Development of Cross-Examination",
    "Judge's Deliberation",
    "Chapel Vent Infiltration",
    "Final Judgment"
  ],

  initialEconomy: {
    ironbound: {
      currency: 150,
      combat: 9,
      exploration: 4,
      diplomacy: 2,
      morale: 7,
      resources: { iron: 20, food: 30, mana_crystal: 4 }
    },
    nightglass: {
      currency: 130,
      combat: 7,
      exploration: 8,
      diplomacy: 6,
      morale: 6,
      resources: { poison: 12, obsidian: 8, food: 20 }
    },
    stormveil: {
      currency: 140,
      combat: 6,
      exploration: 5,
      diplomacy: 8,
      morale: 8,
      resources: { mana_crystal: 18, silk: 10, food: 15 }
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = campaignData;
} else {
  window.campaignData = campaignData;
}
