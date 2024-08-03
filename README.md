
# XYZxplore (pronounced, X, Y, Zzplore)

Play it here!

https://david-wolgemuth.github.io/xyzplore/?t=readme

hosted on gh pages

david-wolgemuth.github.io

UNDER DEVELOPMENT !! SIDE PROJECT !! LEARNING CODE !! FUN !!!

### Quick Message

Welcome to the Hex Grid Adventure Game!

Our goal is to create a **FUN** and **educational** game where you can explore a dynamic world, interact with unique characters, and solve intriguing challenges. This game is designed to be a platform for **expression**, allowing players to immerse themselves in a richly detailed environment while learning and enjoying the process.

Happy adventuring!

### Summary of the Application Code

This React application describes a game where the player navigates a hexagonal grid, interacts with NPCs, collects items, and encounters various mobs. The game supports loading and saving states, dynamically generating levels, and handling player movements and interactions. Key components include:

- **Grid and Tiles**: Representation of the game world using a grid of tiles.
- **Player and Mobs**: Handling player movements, interactions with NPCs, and mob behaviors.
- **Levels**: Loading and transitioning between different levels.
- **Dialog System**: Managing dialogs for NPC interactions.
- **Game State Management**: Saving and loading game states.

### README.md

```markdown
# Hex Grid Adventure Game

## Overview

This project is a React-based game where the player navigates a hexagonal grid, interacts with NPCs, collects items, and encounters various mobs. The game supports dynamic level loading, saving game states, and handling player movements and interactions.

## Features

- Hexagonal grid-based navigation
- Dynamic level loading from CSV files
- Player interactions with NPCs and mobs
- Inventory management
- Saving and loading game states
- Dialog system for NPC interactions

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/hex-grid-adventure-game.git
   ```
2. Navigate to the project directory:
   ```bash
   cd hex-grid-adventure-game
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Game

Start the development server:
```bash
npm start
```

Open your browser and navigate to `http://localhost:3000`.

## Project Structure

```plaintext
hex-grid-adventure-game/
├── .gitignore
├── README.md
├── config-overrides.js
├── package-lock.json
├── package.json
├── tsconfig.json
├── public/
│   ├── favicon.ico
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   ├── robots.txt
│   └── assets/
└── src/
    ├── App.tsx
    ├── Grid.tsx
    ├── NPCs.tsx
    ├── Tiles.tsx
    ├── directions.tsx
    ├── index.css
    ├── index.tsx
    ├── lighting.tsx
    ├── reportWebVitals.ts
    ├── setupTests.ts
    ├── utilities.tsx
    └── levels/
```

## Key Components

- `App.tsx`: Main application component managing game state and logic.
- `Grid.tsx`: Component for rendering the game grid.
- `NPCs.tsx`: Handling NPC interactions and dialogs.
- `Tiles.tsx`: Definitions of different types of tiles.
- `directions.tsx`: Utility functions for handling directions in the hex grid.
- `lighting.tsx`: Functions for calculating light levels in the game.
- `utilities.tsx`: General utility functions.

## License

This project is licensed under the MIT License.
```

### Functions to be Written

#### 1. `canMoveMob(x, y, dx, dy, canFly = false)`
- **Description**: Checks if a mob can move to a new position.
- **Parameters**:
  - `x`: Current x-coordinate of the mob.
  - `y`: Current y-coordinate of the mob.
  - `dx`: Change in x-coordinate.
  - `dy`: Change in y-coordinate.
  - `canFly`: Boolean indicating if the mob can fly (optional).
- **Returns**: Boolean indicating if the move is possible.

#### 2. `getHexGridDelta(y, direction)`
- **Description**: Calculates the delta for moving in a given direction on a hex grid.
- **Parameters**:
  - `y`: Current y-coordinate.
  - `direction`: Direction to move in.
- **Returns**: Array `[deltaX, deltaY]` representing the change in coordinates.

#### 3. `getRelativeDirection(prevDirection, direction)`
- **Description**: Determines the relative direction of movement.
- **Parameters**:
  - `prevDirection`: Previous direction of movement.
  - `direction`: Current direction of movement.
- **Returns**: The relative direction (`FRONT`, `LEFT`, `RIGHT`, etc.).

#### 4. `getLightLevels(visibleCells)`
- **Description**: Calculates the light levels for the visible cells.
- **Parameters**:
  - `visibleCells`: Array of visible cells in the game grid.
- **Returns**: Array of cells with updated light levels.

#### 5. `randomChoice(array)`
- **Description**: Selects a random element from an array.
- **Parameters**:
  - `array`: Array to select from.
- **Returns**: Randomly selected element.

#### 6. `randomSort(array)`
- **Description**: Returns a new array with elements sorted in random order.
- **Parameters**:
  - `array`: Array to sort.
- **Returns**: New array with randomly sorted elements.

#### 7. `loadLevel(x, y, z, cb = null)`
- **Description**: Loads a level and sets it as the current level.
- **Parameters**:
  - `x`: x-coordinate of the level.
  - `y`: y-coordinate of the level.
  - `z`: z-coordinate (depth) of the level.
  - `cb`: Optional callback to execute after loading the level.
- **Returns**: None (updates state).

#### 8. `saveGame()`
- **Description**: Saves the current game state to local storage.
- **Parameters**: None.
- **Returns**: None (stores state in local storage).

#### 9. `tryMovePlayerDirection(direction)`
- **Description**: Attempts to move the player in a given direction.
- **Parameters**:
  - `direction`: Direction to move the player.
- **Returns**: Boolean indicating if the move was successful.

#### 10. `getCells(level)`
- **Description**: Returns a copy of the level with NPCs and mobs layered on top.
- **Parameters**:
  - `level`: The current level grid.
- **Returns**: Array of cells with NPC and mob data.

Implementing these functions will enable a working solution for the game. Start with `canMoveMob`, `getHexGridDelta`, and `getRelativeDirection` as they are foundational for movement and interactions. Then proceed with the remaining functions to complete the game's functionality.

<details>

<summary># Getting Started with Create React App</summary>

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

</details>