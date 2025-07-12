# Bird NPC Documentation

## Table of Contents

- [Overview](#overview)
- [Visual Representation](#visual-representation)
- [Behavior](#behavior)
- [Gameplay Role](#gameplay-role)
- [Interaction](#interaction)
- [Technical Notes](#technical-notes)
- [Design Philosophy](#design-philosophy)
- [Mystical Lore: Whistles of the Sky-Scribe](#mystical-lore-whistles-of-the-sky-scribe)
- [Usage Examples](#usage-examples)
- [Mystical Lore: Whistles of the Sky-Scribe](#mystical-lore-whistles-of-the-sky-scribe)

## Overview

The **Bird** is a passive mob that inhabits the hex grid world of XYZxplore. It serves as an elusive creature that avoids player contact, adding dynamic movement and life to the game environment.

## Visual Representation

- **Display Character**: `𓅚` (Egyptian hieroglyph bird)
- **Color**: `#cd3f58` (Deep red/crimson)
- **Key**: `` ` `` (backtick)
- **Type**: Mob (`mob: true`)

## Behavior

### Movement Pattern
The bird exhibits **evasive behavior** - it actively avoids the player when they come too close. This creates an interesting dynamic where players must approach carefully if they wish to observe or interact with birds.

### Movement Algorithm
The bird uses a proximity-based movement system:

1. **Detection**: Calculates distance to player using standard distance formula
   ```javascript
   const distanceToPlayer = Math.sqrt(
     Math.pow(playerX - x, 2) + Math.pow(playerY - y, 2)
   );
   ```

2. **Trigger**: When player gets within 5 units, bird activates
   ```javascript
   if (distanceToPlayer > 5) {
     return bird; // Stay still if player is far away
   }
   ```

3. **Evasion**: Moves in the opposite direction from the player's position
   ```javascript
   const directionToPlayer = Math.atan2(playerY - y, playerX - x);
   ```

4. **Pathfinding**: Respects terrain boundaries and impassable tiles
   ```javascript
   if (canMoveMob(x, y, deltaX, deltaY, true)) {
     return {
       ...bird,
       x: bird.x + deltaX,
       y: bird.y + deltaY,
     };
   }
   ```

### Technical Implementation

**File Location**: `src/App.tsx:669-750` (extracted to `bird.npc.js`)

**Key Functions**:
- `moveBird(bird)` - Main movement logic
- `moveBird2(bird)` - Alternative implementation (exact opposite direction)

**Tile Definition**: `src/Tiles.tsx:60-67`

```javascript
export const BIRD_TILE = {
  name: 'bird',
  color: '#cd3f58',
  key: '`',
  display: '𓅚',
  mob: true,
};
```

**Movement Algorithm Implementation**:

```javascript
export function moveBird(bird, gameState, canMoveMob) {
  const { playerX, playerY } = gameState;
  const { x, y } = bird;
  
  // Calculate distance to player
  const distanceToPlayer = Math.sqrt(
    Math.pow(playerX - x, 2) + Math.pow(playerY - y, 2)
  );
  
  // Calculate direction from bird to player
  const directionToPlayer = Math.atan2(playerY - y, playerX - x);
  
  // Only move if player is within 5 units
  if (distanceToPlayer > 5) {
    return bird;
  }
  
  // Determine opposite directions based on angle to player
  let oppositeDirections;
  if (directionToPlayer < Math.PI / 6) {
    oppositeDirections = randomSort([
      Direction.SOUTH_WEST,
      Direction.SOUTH_EAST,
    ]);
  } else if (directionToPlayer < Math.PI / 3) {
    oppositeDirections = randomSort([
      Direction.WEST,
      Direction.EAST,
    ]);
  }
  // ... additional angle calculations
  
  // Try to move in opposite directions
  for (const direction of oppositeDirections) {
    const [deltaX, deltaY] = getHexGridDelta(y, direction);
    if (canMoveMob(x, y, deltaX, deltaY, true)) {
      return {
        ...bird,
        x: bird.x + deltaX,
        y: bird.y + deltaY,
      };
    }
  }
  
  return bird;
}
```

## Gameplay Role

### Exploration Element
- Adds life and movement to environments
- Creates points of interest that respond to player presence
- Encourages careful observation and patience

### Environmental Storytelling
- Represents wildlife in the game world
- Shows ecosystem interaction (birds flee from intruders)
- Adds immersion through realistic animal behavior

## Interaction

Currently, birds are **non-interactive** in terms of dialog or item exchange. They serve purely as environmental entities that respond to player proximity through movement.

### Future Possibilities
- Could be expanded to drop items when approached
- Potential for bird-watching mechanics
- Integration with dialog system for nature-themed interactions

## Technical Notes

### Properties
- **Passable**: Players can move through bird tiles
- **Mobile**: Bird position updates each game tick
- **Responsive**: Reacts to player position changes
- **Flight Capability**: Can fly over water tiles (`canFly = true`)

### Direction System
The bird uses a hex grid direction system:

```javascript
const Direction = {
  NORTH_WEST: 'UP_LEFT',
  NORTH_EAST: 'UP_RIGHT', 
  SOUTH_WEST: 'DOWN_LEFT',
  SOUTH_EAST: 'DOWN_RIGHT',
  WEST: 'LEFT',
  EAST: 'RIGHT',
};
```

### Hex Grid Movement
Movement calculations account for hex grid geometry:

```javascript
function getHexGridDelta(currentY, direction) {
  switch (direction) {
    case Direction.NORTH_WEST:
      return [currentY % 2 === 0 ? 0 : -1, -1];
    case Direction.NORTH_EAST:
      return [currentY % 2 === 0 ? 1 : 0, -1];
    case Direction.SOUTH_WEST:
      return [currentY % 2 === 0 ? 0 : -1, 1];
    case Direction.SOUTH_EAST:
      return [currentY % 2 === 0 ? 1 : 0, 1];
    case Direction.WEST:
      return [-1, 0];
    case Direction.EAST:
      return [1, 0];
  }
}
```

### Alternative Movement Implementation
The `moveBird2` function provides a more precise evasion algorithm:

```javascript
export function moveBird2(bird, gameState, canMoveMob) {
  const { playerX, playerY } = gameState;
  const { x, y } = bird;
  
  const distanceToPlayer = Math.sqrt(
    Math.pow(playerX - x, 2) + Math.pow(playerY - y, 2)
  );
  
  const directionToPlayer = Math.atan2(playerY - y, playerX - x);
  
  if (distanceToPlayer > 5) {
    return bird;
  }
  
  // Define the 6 primary directions in a hex grid
  const directions = [
    Direction.EAST, Direction.NORTH_EAST, Direction.NORTH_WEST,
    Direction.WEST, Direction.SOUTH_WEST, Direction.SOUTH_EAST
  ];
  
  // Calculate exact opposite direction
  const index = Math.floor((directionToPlayer + Math.PI) / (Math.PI / 3)) % 6;
  const oppositeDirection = directions[index];
  
  const [deltaX, deltaY] = getHexGridDelta(y, oppositeDirection);
  
  if (canMoveMob(x, y, deltaX, deltaY, true)) {
    return {
      ...bird,
      x: bird.x + deltaX,
      y: bird.y + deltaY,
    };
  }
  
  return bird;
}
```

### Integration
- Managed by the main game loop in `App.tsx`
- Movement calculated alongside other mobs (slimes, bats, landscaper)
- Follows standard mob movement interface
- Exported as standalone module in `bird.npc.js`

## Design Philosophy

The bird embodies the game's approach to **environmental storytelling** and **dynamic world-building**. Rather than being a static decoration, it contributes to the feeling of a living, responsive world where creatures have their own behaviors and motivations.

Its evasive nature creates emergent gameplay moments - players might try to "corner" a bird, or simply enjoy watching their graceful escape patterns across the hex grid.

## Usage Examples

### Basic Implementation
```javascript
// Import the bird NPC module
import { moveBird, BIRD_TILE } from './bird.npc.js';

// Create game state
const gameState = {
  playerX: 10,
  playerY: 10,
};

// Create a bird instance
const bird = {
  ...BIRD_TILE,
  x: 5,
  y: 5,
  id: 'bird_1',
};

// Mock movement validation function
function canMoveMob(x, y, deltaX, deltaY, canFly) {
  // Your game logic here
  return true; // Allow movement
}

// Update bird position
const updatedBird = moveBird(bird, gameState, canMoveMob);
```

### Integration with Game Loop
```javascript
// In your main game loop
function updateMobs() {
  this.state.mobs = this.state.mobs.map(mob => {
    switch (mob.key) {
      case BIRD_TILE.key:
        return moveBird(mob, this.state, this.canMoveMob);
      // ... other mob types
      default:
        return mob;
    }
  });
}
```

## Mystical Lore: Whistles of the Sky-Scribe

### 🌌 Prologue

*"Not all voices wear feathers, but some are carried by them."*

In the amber twilight skies of XYZxplore, the Bird is more than just a passive creature—more than a mob. It is a vessel. A conduit. A spirit-channel.

Though it flits from branch to branch and evades the careless footstep, the bird is not alone in its body.

### 🐦 The Sky-Scribe

They called it the Sky-Scribe.

Marked crimson like an old comet's tail, the Sky-Scribe whistles not its own songs, but melodies passed to it from the other side. It speaks for those who cannot—spirits, long-dead druids, forgotten explorers, even ancient machines that once dreamed.

These messages come through music—not mere sound, but notes strung through the Mixolydian mode, carried in tones that hover between earthly and etheric.

- The whistles resonate in a five-note signature.
- Each note glows faintly in the air, hovering as subtitles only you can read.

*Whistle A♭ – Whistle C – Whistle D♭ – Whistle E♭ – Whistle F*

> "The vines grew back over the gate. You must try the western ridge."

### 🎶 The Spirit-Tuned App

In your inventory lies a curious device:
**sound_muse.app** — an arcane audio tuner disguised as a music box.

When active, it:
- Listens for the bird's whistles.
- Decodes their Mixolydian rock scale into messages.
- Plays soft chord beds in E Mixolydian (E–F#–G#–A–B–C#–D) as ambient background.

Each whistle triggers a visual pulse and a floating subtitle in English.

*Whistle D – Whistle A – Whistle C# – Whistle B*

> "Lanterns extinguished. The path is no longer safe."

### 🔄 Interaction: The Possessed Bird

When spirits seek you, they do not walk.
They possess the Sky-Scribe.

- Villagers use the phrase: *"Follow the bird when the wind forgets its name."*
- NPCs who died far away may still communicate—only once, only through song.
- Some whistles form harmonic loops—repeating messages until deciphered.

When approached:

𓅚: *Whistle F – Whistle D – Whistle A – Whistle G*

> "The roots remember. Dig beside the blue stone."

If ignored, the bird flits away—resetting the chance for that message to be heard. Patience and attentiveness are key.

### 💡 Enhanced Gameplay Integration

```javascript
// Extended Bird with spirit communication
const ENHANCED_BIRD_TILE = {
  ...BIRD_TILE,
  messages: [
    {
      notes: ['F', 'D', 'A', 'G'],
      text: "The roots remember. Dig beside the blue stone.",
      spirit: "Ancient Druid",
      triggered: false
    },
    {
      notes: ['A♭', 'C', 'D♭', 'E♭', 'F'],
      text: "The vines grew back over the gate. You must try the western ridge.",
      spirit: "Lost Explorer",
      triggered: false
    },
    {
      notes: ['D', 'A', 'C#', 'B'],
      text: "Lanterns extinguished. The path is no longer safe.",
      spirit: "Village Guardian",
      triggered: false
    }
  ],
  messageIndex: 0,
  hasActiveSpirit: false
};

// Spirit communication system
function checkSpiritMessages(bird, gameState) {
  if (!gameState.soundMuseApp.active) {
    return bird;
  }
  
  const currentMessage = bird.messages[bird.messageIndex];
  if (currentMessage && !currentMessage.triggered) {
    // Trigger audio playback in Mixolydian tuning
    playMixolydianWhistle(currentMessage.notes);
    
    // Display floating subtitle
    showFloatingMessage(currentMessage.text, currentMessage.spirit);
    
    // Mark as triggered and advance to next message
    currentMessage.triggered = true;
    return {
      ...bird,
      messageIndex: (bird.messageIndex + 1) % bird.messages.length,
      hasActiveSpirit: true
    };
  }
  
  return bird;
}

// Enhanced bird movement with spirit possession
export function moveSkyScribe(bird, gameState, canMoveMob) {
  // Check for spirit messages first
  const updatedBird = checkSpiritMessages(bird, gameState);
  
  // If possessed by spirit, movement patterns change
  if (updatedBird.hasActiveSpirit) {
    // Spirit-possessed birds move in mystical patterns
    return moveSpiritPossessedBird(updatedBird, gameState, canMoveMob);
  }
  
  // Otherwise, use normal evasive behavior
  return moveBird(updatedBird, gameState, canMoveMob);
}
```

### 🌿 Extended Lore

The hex grid is ancient. Its shapes are etched into the minds of spirits who passed beneath its geometry.
Birds, wild and fleet, became the wires of the dead—transmitting data not with electricity, but with melody.

You are the receiver.

**Villager Wisdom:**
- *"Listen to the bird. Not for the song, but for the silence it breaks."*
- *"When the crimson bird sings thrice, a spirit seeks audience."*
- *"The Sky-Scribe knows paths that maps have forgotten."*

### 🎵 Mixolydian Scale Implementation

```javascript
// Mixolydian mode notes (E Mixolydian: E–F#–G#–A–B–C#–D)
const MIXOLYDIAN_SCALE = {
  'E': 329.63,  // Hz frequencies
  'F#': 369.99,
  'G#': 415.30,
  'A': 440.00,
  'B': 493.88,
  'C#': 554.37,
  'D': 587.33,
  'A♭': 415.30,
  'C': 523.25,
  'D♭': 554.37,
  'E♭': 622.25,
  'F': 698.46
};

function playMixolydianWhistle(notes) {
  notes.forEach((note, index) => {
    setTimeout(() => {
      // Play note at specified frequency
      playTone(MIXOLYDIAN_SCALE[note], 300); // 300ms duration
    }, index * 400); // 400ms between notes
  });
}
```

---

*Part of the XYZxplore hex grid adventure game ecosystem*