// Maze chunk size (adjustable)
const CHUNK_WIDTH = 20;
const CHUNK_HEIGHT = 10;

// Parameters for Perlin noise
const NOISE_SCALE = 0.1;
const THRESHOLD = 0.5;  // Threshold to determine path vs wall

// Player starting position (chunk coordinates)
let playerChunkX = 0;
let playerChunkY = 0;
let playerPosition = { x: Math.floor(CHUNK_WIDTH / 2), y: Math.floor(CHUNK_HEIGHT / 2) }; // Starting position in the center

// Maze chunk cache (stores the generated mazes for each chunk)
const mazeCache = {};

// Initialize Simplex noise generator
const simplex = new SimplexNoise();

// Game state initialization
function initializeGame() {
  playerChunkX = 0;
  playerChunkY = 0;
  playerPosition = { x: Math.floor(CHUNK_WIDTH / 2), y: Math.floor(CHUNK_HEIGHT / 2) };
  loadCurrentChunk();  // Load the initial chunk
}

// Maze generation using Perlin noise
function generateMaze(chunkX, chunkY) {
  const mazeLayout = [];

  for (let y = 0; y < CHUNK_HEIGHT; y++) {
    const row = [];
    for (let x = 0; x < CHUNK_WIDTH; x++) {
      const noiseValue = simplex.noise2D((chunkX + x) * NOISE_SCALE, (chunkY + y) * NOISE_SCALE);
      row.push(noiseValue > THRESHOLD ? 1 : 0);  // 1 = wall, 0 = path
    }
    mazeLayout.push(row);
  }

  mazeCache[`${chunkX},${chunkY}`] = mazeLayout; // Cache the maze for this chunk
  return mazeLayout;
}

// Get the maze for the current chunk, using cache if available
function getMaze(chunkX, chunkY) {
  const key = `${chunkX},${chunkY}`;
  if (!mazeCache[key]) {
    return generateMaze(chunkX, chunkY); // Generate and cache if not already cached
  }
  return mazeCache[key];
}

// Place player in the center or a valid open space of the maze
function placePlayer(mazeLayout) {
  let placed = false;
  const centerX = Math.floor(CHUNK_WIDTH / 2);
  const centerY = Math.floor(CHUNK_HEIGHT / 2);

  // Try placing player at the center, if blocked, find first open space
  if (mazeLayout[centerY][centerX] === 0) {
    playerPosition = { x: centerX, y: centerY };
    mazeLayout[centerY][centerX] = 2;  // Player
    placed = true;
  }

  if (!placed) {
    // Look for first open spot
    for (let y = 0; y < CHUNK_HEIGHT; y++) {
      for (let x = 0; x < CHUNK_WIDTH; x++) {
        if (mazeLayout[y][x] === 0) {
          playerPosition = { x, y };
          mazeLayout[y][x] = 2;  // Player
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
      if (cell === 0) return '.';  // Path
      if (cell === 2) return '@';  // Player
    }).join('') + '\n'; // Join each row and add a newline
  });
  document.getElementById('maze').textContent = mazeString;
}

// Load the current chunk based on the player's chunk coordinates
function loadCurrentChunk() {
  const mazeLayout = getMaze(playerChunkX, playerChunkY);  // Get the current chunk
  placePlayer(mazeLayout);  // Place the player
  renderMaze(mazeLayout);  // Render the maze
}

// Handle player movement
function movePlayer(dx, dy) {
  const newX = playerPosition.x + dx;
  const newY = playerPosition.y + dy;

  // Generate the current maze chunk
  const mazeLayout = getMaze(playerChunkX, playerChunkY);

  // Check if the new position is within bounds and not a wall
  if (
    newX >= 0 && newX < CHUNK_WIDTH &&
    newY >= 0 && newY < CHUNK_HEIGHT &&
    mazeLayout[newY][newX] !== 1  // Ensure it's not a wall
  ) {
    playerPosition = { x: newX, y: newY };  // Update player position
  }

  // If the player reaches the edge of the chunk, load a new chunk
  if (playerPosition.x === 0 || playerPosition.x === CHUNK_WIDTH - 1 || playerPosition.y === 0 || playerPosition.y === CHUNK_HEIGHT - 1) {
    loadNewChunk(dx, dy);
  }

  loadCurrentChunk();  // Re-render the current chunk with the updated player position
}

// Load a new chunk when the player walks to the edge
function loadNewChunk(dx, dy) {
  if (dx === 1) playerChunkX++;  // Moving to the right (east)
  if (dx === -1) playerChunkX--; // Moving to the left (west)
  if (dy === 1) playerChunkY++;  // Moving down (south)
  if (dy === -1) playerChunkY--; // Moving up (north)
}

// Listen for key presses (Arrow keys and WASD)
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'w') movePlayer(0, -1);
  if (event.key === 'ArrowDown' || event.key === 's') movePlayer(0, 1);
  if (event.key === 'ArrowLeft' || event.key === 'a') movePlayer(-1, 0);
  if (event.key === 'ArrowRight' || event.key === 'd') movePlayer(1, 0);
});

// Initialize game state when the page loads
initializeGame();
