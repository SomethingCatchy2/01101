// Maze chunk size (adjustable)
const CHUNK_WIDTH = 40;
const CHUNK_HEIGHT = 20;

// Parameters for Perlin noise
const NOISE_SCALE = 0.1;
const THRESHOLD = 0.5;

// Player starting position (chunk coordinates)
let playerChunkX = 0;
let playerChunkY = 0;
let playerPosition = { x: Math.floor(CHUNK_WIDTH / 2), y: Math.floor(CHUNK_HEIGHT / 2) };

// Maze chunk cache
const mazeCache = {};

// Key press states
const keyState = {
  up: false,
  down: false,
  left: false,
  right: false
};

// Interval for smooth continuous movement
let movementInterval = null;

// Initialize Simplex noise generator
const simplex = new SimplexNoise();

// Game state initialization
function initializeGame() {
  playerChunkX = 0;
  playerChunkY = 0;
  playerPosition = { x: Math.floor(CHUNK_WIDTH / 2), y: Math.floor(CHUNK_HEIGHT / 2) };
  loadCurrentChunk();
}

// Maze generation using Perlin noise
function generateMaze(chunkX, chunkY) {
  const mazeLayout = [];
  for (let y = 0; y < CHUNK_HEIGHT; y++) {
    const row = [];
    for (let x = 0; x < CHUNK_WIDTH; x++) {
      const noiseValue = simplex.noise2D((chunkX + x) * NOISE_SCALE, (chunkY + y) * NOISE_SCALE);
      row.push(noiseValue > THRESHOLD ? 1 : 0);
    }
    mazeLayout.push(row);
  }
  mazeCache[`${chunkX},${chunkY}`] = mazeLayout;
  return mazeLayout;
}

// Get the maze for the current chunk, using cache if available
function getMaze(chunkX, chunkY) {
  const key = `${chunkX},${chunkY}`;
  if (!mazeCache[key]) {
    return generateMaze(chunkX, chunkY);
  }
  return mazeCache[key];
}

// Place player in the center or a valid open space of the maze
function placePlayer(mazeLayout) {
  let placed = false;
  const centerX = Math.floor(CHUNK_WIDTH / 2);
  const centerY = Math.floor(CHUNK_HEIGHT / 2);

  if (mazeLayout[centerY][centerX] === 0) {
    playerPosition = { x: centerX, y: centerY };
    mazeLayout[centerY][centerX] = 2; // Mark player position
    placed = true;
  }

  if (!placed) {
    for (let y = 0; y < CHUNK_HEIGHT; y++) {
      for (let x = 0; x < CHUNK_WIDTH; x++) {
        if (mazeLayout[y][x] === 0) {
          playerPosition = { x, y };
          mazeLayout[y][x] = 2; // Mark player position
          placed = true;
          break;
        }
      }
      if (placed) break;
    }
  }

  return mazeLayout;
}

// Render the maze with ASCII characters
function renderMaze(mazeLayout) {
  let mazeString = '';
  mazeLayout.forEach(row => {
    mazeString += row.map(cell => {
      if (cell === 1) return '#';  // Wall
      if (cell === 0) return '.';  // Empty space
      if (cell === 2) return '^';  // Player symbol (changed from '@' to '^')
    }).join('') + '\n';
  });
  document.getElementById('maze').textContent = mazeString;
}

// Load the current chunk based on the player's chunk coordinates
function loadCurrentChunk() {
  const mazeLayout = getMaze(playerChunkX, playerChunkY);
  placePlayer(mazeLayout);
  renderMaze(mazeLayout);
}

// Handle player movement with collision detection
function movePlayer(dx, dy) {
  const newX = playerPosition.x + dx;
  const newY = playerPosition.y + dy;

  const mazeLayout = getMaze(playerChunkX, playerChunkY);

  // Check if the new position is within bounds and not a wall
  if (
    newX >= 0 && newX < CHUNK_WIDTH &&
    newY >= 0 && newY < CHUNK_HEIGHT &&
    mazeLayout[newY][newX] !== 1 // Ensure it's not a wall (1 represents wall)
  ) {
    playerPosition = { x: newX, y: newY }; // Update player position
  }

  // Check if the player has reached the edge of the current chunk and needs to load a new one
  if (playerPosition.x === 0 || playerPosition.x === CHUNK_WIDTH - 1 || playerPosition.y === 0 || playerPosition.y === CHUNK_HEIGHT - 1) {
    loadNewChunk(dx, dy);
  }

  // After movement, render the new chunk
  loadCurrentChunk();
}

// Load a new chunk when the player walks to the edge
function loadNewChunk(dx, dy) {
  if (dx === 1) playerChunkX++;
  if (dx === -1) playerChunkX--;
  if (dy === 1) playerChunkY++;
  if (dy === -1) playerChunkY--;
}

// Keydown event listener to detect multiple key presses (WASD or Arrow keys)
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'w') keyState.up = true;
  if (event.key === 'ArrowDown' || event.key === 's') keyState.down = true;
  if (event.key === 'ArrowLeft' || event.key === 'a') keyState.left = true;
  if (event.key === 'ArrowRight' || event.key === 'd') keyState.right = true;

  // Start movement interval if any key is pressed
  if (movementInterval === null) {
    movementInterval = setInterval(() => {
      const dx = (keyState.right - keyState.left);
      const dy = (keyState.down - keyState.up);
      if (dx || dy) movePlayer(dx, dy);
    }, 100); // 100ms delay for smoother continuous movement
  }
});

// Keyup event listener to stop movement when keys are released
document.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'w') keyState.up = false;
  if (event.key === 'ArrowDown' || event.key === 's') keyState.down = false;
  if (event.key === 'ArrowLeft' || event.key === 'a') keyState.left = false;
  if (event.key === 'ArrowRight' || event.key === 'd') keyState.right = false;

  // Stop the movement interval if no keys are pressed
  if (!keyState.up && !keyState.down && !keyState.left && !keyState.right) {
    clearInterval(movementInterval);
    movementInterval = null;
  }
});

// Initialize game state when the page loads
initializeGame();
