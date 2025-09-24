# Narrative TRPG Campaign HTML Generation System

This prompt is a general-purpose system for generating comprehensive web documents from Narrative TRPG campaign record files.
It takes the following Markdown files and JSON data as input and outputs interactive HTML groups:

## Input Files

- `narrative_replay.md` - Narrative format story records
- `playlog.md` - Statistics and data format play records
- `world_map.md` - World setting and geographical information
- `playlog.jsonl` - Turn-by-turn structured data (optional)
- `world_initial.json` / `world_current.json` - World state data (optional)

## Output File Structure

### Required Files

1. **index.html** - Campaign dashboard (statistics summary and navigation)
2. **narrative.html** - Narrative replay (story format with term explanations)
3. **playlog.html** - Playlog analysis (statistics, data, and graphs)
4. **worldmap.html** - World map (geographical information and spheres of influence)
5. **style.css** - Unified stylesheet (dark theme, faction color support)
6. **data.js** - Data dictionary (characters, place names, terms, statistics)

### Support Files

- Party images (e.g., `Ironbound_party.png`)
- Screenshots (e.g., `screenshot.png`)
- Language-specific folder support (e.g., `campaign_name/` and `campaign_name_ja/`)

## Core Features

### Cross-turn Cross-linking

- Bidirectional cross-linking between Narrative ↔ Playlog for the same turn
- Unified anchor IDs: `#turn-1`, `#turn-2`, ..., `#turn-N`
- Cross-link buttons: `📊 View Data` / `📖 View Narrative`

### Term Explanation System

- Automatic detection of first-occurrence terms and insertion of explanation boxes
- Styling with `.term-explanation` class
- Priority explanation for world-specific terms, organization names, and tactical terms

### Navigation

- Unified header across all pages: `🏠 Dashboard | 📖 Narrative | 📊 Playlog | 🗺️ World Map`
- Intra-turn navigation: `← Previous Turn | Next Turn →`
- Turn jump: Direct links in `T1 T2 T3...` format

### Responsive Design

- Unified UI based on dark theme
- Mobile support (layout adjustments for under 768px)
- Card-based layout and grid display

## Implementation Patterns

### Faction Display System

```html
<!-- Characters -->
<span class="character ironbound" data-name="serah_vance"
  >Commander Serah Vance</span
>
<span class="character nightglass" data-name="ilyra">Shadow Marshal Ilyra</span>
<span class="character stormveil" data-name="talan_mir"
  >Grand Mage Talan Mir</span
>

<!-- Organizations -->
<span class="organization" data-org="thunder_legion">Thunder Legion</span>

<!-- Locations -->
<span class="location" data-region="shadowfen_crossing"
  >Shadowfen Crossing</span
>
```

### Turn Section Structure

```html
<section id="turn-1" class="turn-section">
  <header class="turn-header">
    <h3>Turn 1: March to Shadowfen Crossing</h3>
    <nav class="turn-nav">
      <a href="playlog.html#turn-1" class="cross-link">📊 View Data</a>
      <a href="#turn-2" class="next-turn">Next Turn →</a>
    </nav>
  </header>
  <div class="turn-content">
    <!-- Term explanations -->
    <div class="term-explanation">
      <h5>💡 Term Explanation</h5>
      <p>
        <strong>Thunder Legion:</strong> A fourth faction controlling the
        region...
      </p>
    </div>
    <!-- Narrative content -->
  </div>
</section>
```

### Data Visualization

```html
<!-- Statistics table -->
<table class="stats-table">
  <tr>
    <td>💰 Currency</td>
    <td>150</td>
  </tr>
  <tr>
    <td>🗡️ Combat Power</td>
    <td>9</td>
  </tr>
  <tr>
    <td>📈 Morale</td>
    <td>7</td>
  </tr>
</table>

<!-- Faction status -->
<div class="faction-stats-grid">
  <div class="faction-stat ironbound">
    <h4>⚔️ Ironbound Covenant</h4>
    <!-- Status details -->
  </div>
</div>
```

### data.js Data Dictionary Structure

```javascript
const campaignData = {
  meta: {
    title: "Campaign Title",
    totalTurns: 20,
    factions: ["faction1", "faction2", "faction3"],
  },
  factions: {
    ironbound: {
      name: "Ironbound Covenant",
      icon: "⚔️",
      primaryColor: "#8B0000",
      speciality: "Combat and Military Command",
      homeBase: "Emberfront Keep",
    },
  },
  characters: {
    serah_vance: {
      name: "Commander Serah Vance",
      faction: "ironbound",
      role: "Strategist",
      personality: "Indomitable",
    },
  },
  locations: {
    shadowfen_crossing: {
      name: "Shadowfen Crossing",
      type: "Strategic Point",
      description: "Important stronghold contested by three factions",
    },
  },
};
```

### Styling Rules

```css
/* Faction-specific colors */
.character.ironbound {
  color: #dc3545;
}
.character.nightglass {
  color: #6f42c1;
}
.character.stormveil {
  color: #ffd700;
}

/* Term explanation boxes */
.term-explanation {
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.1),
    rgba(37, 99, 235, 0.05)
  );
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-left: 4px solid #3b82f6;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  margin: 1rem 0 1.5rem 0;
}

/* Dark theme base */
body {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: #e0e0e0;
}
```

### Folder Structure

```
docs/
├── campaign_name/              # English version
│   ├── index.html
│   ├── narrative.html
│   ├── playlog.html
│   ├── worldmap.html
│   ├── style.css
│   ├── data.js
│   ├── *.png                   # Party images
│   └── *.json                  # Data files
├── campaign_name_ja/           # Japanese version
│   ├── index.html
│   ├── narrative.html
│   ├── playlog.html
│   ├── worldmap.html
│   ├── data.js                 # Japanese version data
│   └── (style.css references English version)
└── generate_campaign_html.md   # This prompt
```

## Special Features

### Progressive Objective Evolution Display

```html
<!-- Phase evolution visualization -->
<section class="phase-evolution">
  <h2>🌊 Three-phase Evolution</h2>
  <div class="phase-timeline">
    <div class="phase military-phase">
      <h3>⚔️ Military Conquest Phase (T1-3)</h3>
    </div>
    <div class="phase political-phase">
      <h3>⚖️ Political Authority Phase (T4-13)</h3>
    </div>
    <div class="phase legal-phase">
      <h3>📜 Legal Resolution Phase (T14-20)</h3>
    </div>
  </div>
</section>
```

### Objective Turning Point Markers

```html
<h3>Turn 3: Thunder Legion Ultimatum ⚔️【🔄 Objective Turning Point】</h3>
<div class="objective-shift">
  <h4>🔄 Catalyst of Change</h4>
  <p>Fundamental situational changes and their impact...</p>
</div>
```

### index.html Dashboard Structure

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Campaign Name - Dashboard</title>
    <link rel="stylesheet" href="style.css" />
    <script src="data.js"></script>
  </head>
  <body>
    <header class="main-header">
      <nav class="main-nav">
        <a href="index.html" class="active">🏠 Dashboard</a>
        <a href="narrative.html">📖 Narrative</a>
        <a href="playlog.html">📊 Playlog</a>
        <a href="worldmap.html">🗺️ World Map</a>
      </nav>
    </header>
    <main class="container">
      <section class="campaign-overview">
        <h1>🌩️ Campaign Title</h1>
        <p class="subtitle">Campaign description text</p>
      </section>
      <section class="card">
        <h3>📊 Campaign Statistics</h3>
        <div class="campaign-stats">
          <div class="stat-item">
            <div class="stat-number">20</div>
            <div class="stat-label">Turns</div>
          </div>
          <!-- ... -->
        </div>
      </section>
      <!-- Party introduction, final results, etc. -->
    </main>
  </body>
</html>
```

### Automatic Generation Algorithm

#### Phase 1: Markdown Parsing

1. **Structure Analysis**: Recognition of header levels, lists, and tables
2. **Turn Extraction**: Detection of "Turn X" patterns
3. **Proper Noun Extraction**: Place names, person names, organization names starting with capital letters and special symbols
4. **Faction Classification**: Faction identification by specific patterns (emojis, colors, technical terms)

#### Phase 2: Data Dictionary Construction

1. **Character Dictionary**: Association of names, factions, roles, and characteristics
2. **Location Dictionary**: Recording regions, types, controlling factions, strategic values
3. **Term Dictionary**: Explanation data for technical terms, tactics, magic, and technology
4. **Statistical Data**: Numerical extraction from playlogs and change tracking

#### Phase 3: HTML Generation

1. **Template Application**: Data injection into unified layout
2. **Cross-linking**: Turn correspondence between Narrative ↔ Playlog
3. **Term Explanations**: Automatic insertion of explanation boxes at first occurrence
4. **Style Application**: Faction colors, animations, responsive support

#### Phase 4: JavaScript Functionality

1. **Interactive Elements**: Tooltips, hover effects, animations
2. **Data Integration**: Dynamic binding between data.js and HTML elements
3. **Navigation Enhancement**: Cross-links, filtering, search
4. **Responsive Adjustment**: Screen size adaptation, touch operation optimization

### Quality Checklist

- [ ] Verification of cross-linking functionality between all turns
- [ ] Proper placement of term explanation boxes
- [ ] Consistency of faction color themes
- [ ] Intuitiveness of navigation
- [ ] Mobile display optimization
- [ ] Multilingual support (\_ja folders)
- [ ] Completeness of data.js data

## Implementation Guidelines

### Input File Requirements

```
// Minimum required files
narrative_replay.md     # Turn-by-turn story records
playlog.md             # Statistics and data records
world_map.md           # World setting and geographical information

// Optional extension files
playlog.jsonl          # Structured data (for automatic analysis)
world_initial.json     # Initial world state
world_current.json     # Final world state
*.png                  # Party images and screenshots
```

### Generalization Support

#### N-Faction Support System

```javascript
// Support for dynamic number of factions
const factionColors = {
  faction1: { primary: "#8B0000", secondary: "#4A4A4A" },
  faction2: { primary: "#4B0082", secondary: "#2F2F2F" },
  faction3: { primary: "#1E90FF", secondary: "#FFD700" },
  // Expandable to any number
};
```

#### Extensible Structure

- Dynamic addition of additional factions, characters, and regions
- Custom field support
- Complete customization of themes and colors
- Support for arbitrary turn numbers (1-999)

### Implementation Priority

#### Critical Path (Most Important)

1. **Basic HTML Structure** - Basic layout for 4 pages
2. **Turn Sections** - Content display in unified format
3. **Cross-linking** - Bidirectional movement between Narrative ↔ Playlog
4. **data.js Generation** - Automatic dictionary creation and binding

#### High Priority (Important)

5. **Term Explanation System** - Automatic explanation of first-occurrence terms
6. **Faction Color Theme** - Unified visual identification
7. **Responsive Support** - Mobile display optimization

#### Medium Priority (Recommended)

8. **Statistical Graphs** - Visualization of numerical data
9. **Interactive Elements** - Hover effects and tooltips
10. **Animations** - Phase evolution and transitions

## Usage Examples

The following campaign HTML groups have been generated using this system:

### Thunder Storm Campaign

- 📁 `docs/thunder_storm_campaign/` (English version)
- 📁 `docs/thunder_storm_campaign_ja/` (Japanese version)
- ✅ 3 factions, 20 turns, complex objective evolution system
- ✅ Term explanation features, cross-linking, statistical graphs

### Triple Light Linked Ring

- 📁 `docs/triple_light_linked_ring/` (English version)
- 📁 `docs/triple_light_linked_ring_ja/` (Japanese version)
- ✅ Support for different faction configurations, geography, and tactical systems
