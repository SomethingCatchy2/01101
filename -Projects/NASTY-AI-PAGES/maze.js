// Maze chunk size (adjustable)
const CHUNK_WIDTH = 100; // Reduced from 200 for better performance
const CHUNK_HEIGHT = 50; // Reduced from 100 for better performance

// Parameters for Perlin noise
const NOISE_SCALE = 0.05; // Slightly increased for better terrain variety
const THRESHOLD = 0.001;  // Threshold to determine path vs wall

// Player starting position (chunk coordinates)
let playerChunkX = 0;
let playerChunkY = 0;
let playerPosition = { x: Math.floor(CHUNK_WIDTH / 2), y: Math.floor(CHUNK_HEIGHT / 2) };

// Player stats
let playerScore = 0;
let playerSpeed = 1; // Base movement speed
let lastMoveTime = 0; // For controlling movement speed

// Maze chunk cache (stores the generated mazes for each chunk)
const mazeCache = {};

// Track starting position for score calculation
const startingPosition = { chunkX: 0, chunkY: 0, x: Math.floor(CHUNK_WIDTH / 2), y: Math.floor(CHUNK_HEIGHT / 2) };

// Cell types with symbols and effects
const CELL_TYPES = {
  0: { symbol: '.', color: '#888', speedModifier: 1.7 }, // Path (slower)
  1: { symbol: '#', color: '#444', speedModifier: 3.5 }, // Wall (faster)
  2: { symbol: '@', color: '#FF5', speedModifier: 1.0 }, // Player
  3: { symbol: '!', color: '#F0F', speedModifier: 1.0 }, // Portal
  4: { symbol: '"', color: '#0A0', speedModifier: 1.2 }, // Plant1
  5: { symbol: '\'', color: '#0D0', speedModifier: 1.3 }, // Plant2
  6: { symbol: '~', color: '#08F', speedModifier: 0.5 }, // Water
  7: { symbol: '*', color: '#FD0', speedModifier: 2.0 }, // Crystal
  8: { symbol: '^', color: '#F00', speedModifier: 0.3 }, // Lava
  9: { symbol: '=', color: '#A50', speedModifier: 1.1 }, // Bridge
  10: { symbol: ':', color: '#DC8', speedModifier: 0.8 }, // Sand
  11: { symbol: '&', color: '#777', speedModifier: 0.9 }, // Rock
  12: { symbol: '?', color: '#F8F', speedModifier: 1.4 }, // Mushroom
  13: { symbol: '+', color: '#FA0', speedModifier: 1.0 }, // Chest
  14: { symbol: '_', color: '#ADF', speedModifier: 1.8 }, // Ice
  15: { symbol: '|', color: '#FFF', speedModifier: 1.2 }, // Shrine
  16: { symbol: '<', color: '#0FA', speedModifier: 1.5 }, // Gem
  17: { symbol: '>', color: '#A0F', speedModifier: 1.3 }, // Altar
  18: { symbol: '}', color: '#AAA', speedModifier: 1.1 }, // Ruins
  19: { symbol: '{', color: '#DDD', speedModifier: 0.9 }  // Bones
};

// Use a lightweight noise generator instead of SimplexNoise
// Simple Perlin noise implementation
const noise = {
  grad3: [
    [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
    [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
    [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
  ],
  p: [], // Populated in init
  perm: [], // Populated in init
  
  init: function() {
    // Initialize permutation table
    this.p = [];
    for (let i = 0; i < 256; i++) {
      this.p[i] = Math.floor(Math.random() * 256);
    }
    
    // Duplicate to avoid overflow
    this.perm = [];
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
    }
  },
  
  dot: function(g, x, y) {
    return g[0] * x + g[1] * y;
  },
  
  mix: function(a, b, t) {
    return (1 - t) * a + t * b;
  },
  
  fade: function(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  },
  
  noise2D: function(x, y) {
    // Find unit grid cell containing point
    let X = Math.floor(x) & 255;
    let Y = Math.floor(y) & 255;
    
    // Get relative coords of point in cell
    x -= Math.floor(x);
    y -= Math.floor(y);
    
    // Compute fade curves
    let u = this.fade(x);
    let v = this.fade(y);
    
    // Hash coordinates of the 4 square corners
    let A = this.perm[X] + Y;
    let B = this.perm[X + 1] + Y;
    
    // And add blended results from 4 corners of square
    let g1 = this.grad3[this.perm[A] % 12];
    let g2 = this.grad3[this.perm[B] % 12];
    let g3 = this.grad3[this.perm[A + 1] % 12];
    let g4 = this.grad3[this.perm[B + 1] % 12];
    
    let n1 = this.dot(g1, x, y);
    let n2 = this.dot(g2, x - 1, y);
    let n3 = this.dot(g3, x, y - 1);
    let n4 = this.dot(g4, x - 1, y - 1);
    
    // Blend contributions from each corner
    let x1 = this.mix(n1, n2, u);
    let x2 = this.mix(n3, n4, u);
    
    return this.mix(x1, x2, v);
  }
};

// Initialize the noise generator
noise.init();

// Game state initialization
function initializeGame() {
  playerChunkX = 0;
  playerChunkY = 0;
  playerPosition = { x: Math.floor(CHUNK_WIDTH / 2), y: Math.floor(CHUNK_HEIGHT / 2) };
  playerScore = 0;
  
  // Create simple UI elements
  setupUI();
  
  // Load the initial chunk
  loadCurrentChunk();
}

// Create minimal UI
function setupUI() {
  const statsDiv = document.createElement('div');
  statsDiv.id = 'stats';
  statsDiv.style.cssText = 'font-family: monospace; margin-bottom: 10px; color: white;';
  statsDiv.innerHTML = 'Score: <span id="score">0</span> | Distance: <span id="distance">0</span> | Speed: <span id="speed">1.0</span>x';
  
  const mazeDiv = document.createElement('pre');
  mazeDiv.id = 'maze';
  mazeDiv.style.cssText = 'font-family: monospace; line-height: 1; font-size: 12px; white-space: pre; margin: 0;';
  
  const helpDiv = document.createElement('div');
  helpDiv.style.cssText = 'font-family: monospace; margin-top: 10px; font-size: 12px; color: white;';
  helpDiv.innerHTML = 'Move: Arrow keys or WASD | Diagonals: Q, E, Z, C | # = fast, . = slow, ! = refresh';
  
  document.body.style.backgroundColor = 'black';
  document.body.style.padding = '20px';
  document.body.appendChild(statsDiv);
  document.body.appendChild(mazeDiv);
  document.body.appendChild(helpDiv);
}

// Update stats display
function updateStats() {
  document.getElementById('score').textContent = playerScore;
  document.getElementById('distance').textContent = calculateDistance();
  document.getElementById('speed').textContent = playerSpeed.toFixed(1);
}

// Calculate distance from starting point
function calculateDistance() {
  const globalPlayerX = playerChunkX * CHUNK_WIDTH + playerPosition.x;
  const globalPlayerY = playerChunkY * CHUNK_HEIGHT + playerPosition.y;
  const globalStartX = startingPosition.chunkX * CHUNK_WIDTH + startingPosition.x;
  const globalStartY = startingPosition.chunkY * CHUNK_HEIGHT + startingPosition.y;
  
  const dx = globalPlayerX - globalStartX;
  const dy = globalPlayerY - globalStartY;
  
  return Math.floor(Math.sqrt(dx * dx + dy * dy));
}

// Maze generation using optimized noise
function generateMaze(chunkX, chunkY) {
  const mazeLayout = [];
  const baseX = chunkX * CHUNK_WIDTH;
  const baseY = chunkY * CHUNK_HEIGHT;

  for (let y = 0; y < CHUNK_HEIGHT; y++) {
    const row = [];
    for (let x = 0; x < CHUNK_WIDTH; x++) {
      // Primary terrain using noise
      const noiseValue = noise.noise2D((baseX + x) * NOISE_SCALE, (baseY + y) * NOISE_SCALE);
      
      // Secondary noise for decorations (using a different scale)
      const decorNoise = noise.noise2D((baseX + x) * NOISE_SCALE * 2 + 100, (baseY + y) * NOISE_SCALE * 2 + 100);
      
      // Determine cell type based on noise values
      let cellType;
      
      if (noiseValue > THRESHOLD) {
        cellType = 1; // Wall (#)
      } else {
        cellType = 0; // Path (.)
        
        // Add decorative elements with reduced frequency (performance improvement)
        if (Math.abs(decorNoise) > 0.7) {
          // Small chance for a portal
          if (Math.random() < 0.02) {
            cellType = 3; // Portal (!)
          } else {
            // Select a decorative element based on the noise value to ensure consistent generation
            const decor = Math.floor(Math.abs(decorNoise * 100)) % 16 + 4;
            cellType = decor;
          }
        }
      }
      
      row.push(cellType);
    }
    mazeLayout.push(row);
  }

  // Add chunk to cache for future reference
  mazeCache[`${chunkX},${chunkY}`] = mazeLayout;
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

// Place player in the maze
function placePlayer(mazeLayout) {
  // Check the current cell type before placing player
  if (playerPosition.y < mazeLayout.length && playerPosition.x < mazeLayout[0].length) {
    const currentCell = mazeLayout[playerPosition.y][playerPosition.x];
    
    // Set player's speed based on current terrain (fixing bug with missing cell types)
    const cellInfo = CELL_TYPES[currentCell] || CELL_TYPES[0];
    playerSpeed = cellInfo.speedModifier;
    
    // Special cell effects
    if (currentCell === 3) { // Portal - refresh the page
      setTimeout(() => {
        location.reload();
      }, 300);
    }
    
    // Update score based on distance
    playerScore = calculateDistance() * 10;
    
    // Update stats display
    updateStats();
    
    // Place player (avoid overwriting the cell type by marking for rendering only)
    const playerPosY = playerPosition.y;
    const playerPosX = playerPosition.x;
    
    // Create a shallow copy of the layout for rendering (to avoid modifying the original)
    const renderLayout = mazeLayout.map((row, y) => {
      if (y === playerPosY) {
        const newRow = [...row];
        newRow[playerPosX] = 2; // Player
        return newRow;
      }
      return row;
    });
    
    return renderLayout;
  }
  
  return mazeLayout;
}

// Render the maze with colored ASCII characters
function renderMaze(mazeLayout) {
  const mazeElement = document.getElementById('maze');
  
  // Clear previous content
  while (mazeElement.firstChild) {
    mazeElement.removeChild(mazeElement.firstChild);
  }
  
  // Viewport size (centered on player for better performance)
  const viewportWidth = Math.min(CHUNK_WIDTH, 80); // Max width for viewport
  const viewportHeight = Math.min(CHUNK_HEIGHT, 40); // Max height for viewport
  
  // Calculate viewport bounds (centered on player)
  const startX = Math.max(0, Math.min(playerPosition.x - Math.floor(viewportWidth / 2), CHUNK_WIDTH - viewportWidth));
  const startY = Math.max(0, Math.min(playerPosition.y - Math.floor(viewportHeight / 2), CHUNK_HEIGHT - viewportHeight));
  const endX = startX + viewportWidth;
  const endY = startY + viewportHeight;
  
  // Create colored spans for each cell in the viewport
  for (let y = startY; y < endY; y++) {
    const rowSpan = document.createElement('div');
    
    for (let x = startX; x < endX; x++) {
      const cellType = mazeLayout[y][x];
      const cellInfo = CELL_TYPES[cellType] || CELL_TYPES[0];
      
      const cellSpan = document.createElement('span');
      cellSpan.textContent = cellInfo.symbol;
      cellSpan.style.color = cellInfo.color;
      
      rowSpan.appendChild(cellSpan);
    }
    
    mazeElement.appendChild(rowSpan);
  }
}

// Load the current chunk based on the player's chunk coordinates
function loadCurrentChunk() {
  const mazeLayout = getMaze(playerChunkX, playerChunkY);  // Get the current chunk
  const renderLayout = placePlayer(mazeLayout);  // Place the player
  renderMaze(renderLayout);  // Render the maze
}

// Handle player movement with speed consideration
function movePlayer(dx, dy) {
  const now = Date.now();
  const elapsed = now - lastMoveTime;
  
  // Calculate movement cooldown based on player speed (faster = lower cooldown)
  const cooldown = Math.max(50, 200 / playerSpeed); // Min 50ms, max based on speed
  
  // Check if enough time has passed since last move
  if (elapsed < cooldown) return;
  
  lastMoveTime = now;
  
  const newX = playerPosition.x + dx;
  const newY = playerPosition.y + dy;

  // Get the current maze chunk
  const mazeLayout = getMaze(playerChunkX, playerChunkY);

  // Check if the new position is within bounds
  if (
    newX >= 0 && newX < CHUNK_WIDTH &&
    newY >= 0 && newY < CHUNK_HEIGHT
  ) {
    // Check if the destination is not a wall (we can move to any cell in this version)
    const cellType = mazeLayout[newY][newX];
    playerPosition = { x: newX, y: newY };
  } else {
    // Player is trying to move outside the chunk, load a new chunk
    loadNewChunk(dx, dy);
  }

  loadCurrentChunk();  // Re-render the current chunk with the updated player position
}

// Load a new chunk when the player walks to the edge
function loadNewChunk(dx, dy) {
  // Calculate new chunk coordinates
  let newChunkX = playerChunkX;
  let newChunkY = playerChunkY;
  let newPlayerX = playerPosition.x;
  let newPlayerY = playerPosition.y;
  
  // Adjust chunk coordinates and player position
  if (playerPosition.x + dx < 0) {
    newChunkX--;
    newPlayerX = CHUNK_WIDTH - 1;
  } else if (playerPosition.x + dx >= CHUNK_WIDTH) {
    newChunkX++;
    newPlayerX = 0;
  } else {
    newPlayerX += dx;
  }
  
  if (playerPosition.y + dy < 0) {
    newChunkY--;
    newPlayerY = CHUNK_HEIGHT - 1;
  } else if (playerPosition.y + dy >= CHUNK_HEIGHT) {
    newChunkY++;
    newPlayerY = 0;
  } else {
    newPlayerY += dy;
  }
  
  // Update player chunk coordinates and position
  playerChunkX = newChunkX;
  playerChunkY = newChunkY;
  playerPosition = { x: newPlayerX, y: newPlayerY };
  
  // Limit cache size for better memory usage (keep only nearby chunks)
  pruneChunkCache();
}

// Prune chunk cache to prevent memory issues
function pruneChunkCache() {
  const maxCachedChunks = 9; // Keep at most 9 chunks in memory (current + 8 surrounding)
  const keys = Object.keys(mazeCache);
  
  if (keys.length <= maxCachedChunks) return;
  
  // Sort chunks by distance from current chunk
  const sortedKeys = keys.sort((a, b) => {
    const [aX, aY] = a.split(',').map(Number);
    const [bX, bY] = b.split(',').map(Number);
    
    const distA = Math.abs(aX - playerChunkX) + Math.abs(aY - playerChunkY);
    const distB = Math.abs(bX - playerChunkX) + Math.abs(bY - playerChunkY);
    
    return distA - distB;
  });
  
  // Remove the furthest chunks
  for (let i = maxCachedChunks; i < sortedKeys.length; i++) {
    delete mazeCache[sortedKeys[i]];
  }
}

// Listen for key presses with optimized event handling
document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(event) {
  // Prevent default action for arrow keys to avoid page scrolling
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault();
  }
  
  // Cardinal directions
  if (event.key === 'ArrowUp' || event.key === 'w') movePlayer(0, -1);
  if (event.key === 'ArrowDown' || event.key === 's') movePlayer(0, 1);
  if (event.key === 'ArrowLeft' || event.key === 'a') movePlayer(-1, 0);
  if (event.key === 'ArrowRight' || event.key === 'd') movePlayer(1, 0);
  
  // Diagonal directions
  if (event.key === 'q') movePlayer(-1, -1); // Northwest
  if (event.key === 'e') movePlayer(1, -1);  // Northeast
  if (event.key === 'z') movePlayer(-1, 1);  // Southwest
  if (event.key === 'c') movePlayer(1, 1);   // Southeast
}

// Initialize game
window.onload = initializeGame;