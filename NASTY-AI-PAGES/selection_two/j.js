const dino = document.getElementById('dino');
const cactus = document.getElementById('cactus');
const scoreDisplay = document.createElement('div');
const gameOverScreen = document.createElement('div');

// Initialize score display
scoreDisplay.style.position = 'absolute';
scoreDisplay.style.top = '10px';
scoreDisplay.style.left = '10px';
scoreDisplay.style.fontSize = '20px';
scoreDisplay.style.fontFamily = 'Arial, sans-serif';

// Initialize game over screen
gameOverScreen.style.position = 'absolute';
gameOverScreen.style.top = '50%';
gameOverScreen.style.left = '50%';
gameOverScreen.style.transform = 'translate(-50%, -50%)';
gameOverScreen.style.padding = '20px';
gameOverScreen.style.backgroundColor = '#fff';
gameOverScreen.style.border = '2px solid #000';
gameOverScreen.style.textAlign = 'center';
gameOverScreen.style.fontFamily = 'Arial, sans-serif';
gameOverScreen.style.display = 'none';
gameOverScreen.innerHTML = '<h1>Game Over</h1><button id="restartButton">Restart</button>';

document.body.appendChild(scoreDisplay);
document.body.appendChild(gameOverScreen);

const restartButton = gameOverScreen.querySelector('#restartButton');

let isJumping = false;
let isGameOver = false;
let score = 0;

// Update score
function updateScore() {
    score += 1;
    scoreDisplay.textContent = `Score: ${score}`;
}

// Make the dino jump
function jump() {
    if (isJumping) return;

    isJumping = true;
    const initialBottom = parseInt(window.getComputedStyle(dino).getPropertyValue('bottom'));
    let currentBottom = initialBottom;
    let upInterval = setInterval(() => {
        if (currentBottom >= initialBottom + 150) { // Jump height increased
            clearInterval(upInterval);
            let downInterval = setInterval(() => {
                if (currentBottom <= initialBottom) {
                    clearInterval(downInterval);
                    isJumping = false;
                    dino.style.bottom = `${initialBottom}px`; // Reset to starting point
                }
                currentBottom -= 10;
                if (currentBottom < initialBottom) currentBottom = initialBottom; // Prevent falling below starting point
                dino.style.bottom = `${currentBottom}px`;
            }, 20);
        }
        currentBottom += 10;
        dino.style.bottom = `${currentBottom}px`;
    }, 20);
}

// Check for collision
function checkCollision() {
    const dinoRect = dino.getBoundingClientRect();
    const cactusRect = cactus.getBoundingClientRect();

    if (
        dinoRect.right > cactusRect.left &&
        dinoRect.left < cactusRect.right &&
        dinoRect.bottom > cactusRect.top
    ) {
        isGameOver = true;
        cactus.style.animation = 'none';
        showGameOverScreen();
    }
}

// Show game over screen
function showGameOverScreen() {
    gameOverScreen.style.display = 'block';
    scoreDisplay.style.display = 'none';
}

// Restart game
restartButton.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    scoreDisplay.style.display = 'block';
    score = 0;
    updateScore();
    isGameOver = false;
    cactus.style.animation = '';
    gameLoop();
});

// Event listener for jumping
window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        jump();
    }
});

// Game loop
function gameLoop() {
    if (!isGameOver) {
        checkCollision();
        updateScore();
        requestAnimationFrame(gameLoop);
    }
}

gameLoop();
