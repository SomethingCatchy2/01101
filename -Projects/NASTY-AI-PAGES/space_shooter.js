// Set up canvas and game context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variables for spaceship, bullets, asteroids, stars, and particles
const spaceship = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 50,
    height: 50,
    speed: 5,  // Initial speed for spaceship
    dx: 0,
    dy: 0,
    angle: 0
};

const bullets = [];
const asteroids = [];
const stars = [];
const particles = [];
let score = 0;
let gameOver = false;
let autoShoot = false;

// Game difficulty variables
let asteroidSpeedIncrement = 0.2; // Asteroid speed increase over time
let asteroidSpawnInterval = 1200; // Time between asteroid spawns (ms)
let bulletSpeed = 8; // Bullet speed
let spaceshipSpeed = 5; // Spaceship speed

// Upgrade-related variables
let upgradePoints = 20; // Points required for the first upgrade
let upgradeInterval = 100; // Points required for each upgrade
let upgradeLevel = 0; // Tracks the number of upgrades the player has

// Upgrade categories
const upgrades = {
    spaceshipSpeed: 0,
    bulletSpeed: 0,
    asteroidSpeed: 0,
    autoShootSpeed: 0
};

// Key press events for spaceship movement
let rightPressed = false;
let leftPressed = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    } else if (e.key === " " && !gameOver) {
        autoShoot = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    } else if (e.key === " ") {
        autoShoot = false;
    }
}

function shootBullet() {
    bullets.push({
        x: spaceship.x + spaceship.width / 2 - 2,
        y: spaceship.y,
        width: 4,
        height: 20,
        speed: bulletSpeed
    });
}

let autoShootInterval = setInterval(() => {
    if (autoShoot && !gameOver) {
        shootBullet();
    }
}, 200);

function moveSpaceship() {
    if (rightPressed && spaceship.x < canvas.width - spaceship.width) {
        spaceship.dx = spaceshipSpeed;
    } else if (leftPressed && spaceship.x > 0) {
        spaceship.dx = -spaceshipSpeed;
    } else {
        spaceship.dx = 0;
    }
    spaceship.x += spaceship.dx;

    // Update spaceship angle based on movement
    if (spaceship.dx !== 0) {
        spaceship.angle = spaceship.dx > 0 ? Math.PI / 16 : -Math.PI / 16;
    } else {
        spaceship.angle = 0;
    }
}

function drawSpaceship() {
    ctx.save();
    ctx.translate(spaceship.x + spaceship.width / 2, spaceship.y + spaceship.height / 2);
    ctx.rotate(spaceship.angle);

    const gradient = ctx.createLinearGradient(-spaceship.width / 2, 0, spaceship.width / 2, 0);
    gradient.addColorStop(0, "cyan");
    gradient.addColorStop(1, "blue");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, -spaceship.height / 2);
    ctx.lineTo(-spaceship.width / 2, spaceship.height / 2);
    ctx.lineTo(spaceship.width / 2, spaceship.height / 2);
    ctx.closePath();
    ctx.fill();

    // Thruster effect when moving
    if (spaceship.dx !== 0) {
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.moveTo(0, spaceship.height / 2);
        ctx.lineTo(-spaceship.width / 4, spaceship.height / 1.5);
        ctx.lineTo(spaceship.width / 4, spaceship.height / 1.5);
        ctx.closePath();
        ctx.fill();
    }

    ctx.restore();
}

function drawBullets() {
    for (const bullet of bullets) {
        const gradient = ctx.createLinearGradient(bullet.x, bullet.y, bullet.x, bullet.y + bullet.height);
        gradient.addColorStop(0, "yellow");
        gradient.addColorStop(1, "red");

        ctx.fillStyle = gradient;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

function moveBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        if (bullets[i].y < 0) bullets.splice(i, 1);
    }
}

function drawAsteroids() {
    for (const asteroid of asteroids) {
        const gradient = ctx.createRadialGradient(asteroid.x, asteroid.y, asteroid.size / 4, asteroid.x, asteroid.y, asteroid.size);
        gradient.addColorStop(0, "darkgray");
        gradient.addColorStop(0.5, "gray");
        gradient.addColorStop(1, "black");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(asteroid.x, asteroid.y, asteroid.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function moveAsteroids() {
    for (const asteroid of asteroids) {
        asteroid.y += asteroid.speed;
        if (asteroid.y > canvas.height) {
            asteroid.y = -asteroid.size;
            asteroid.x = Math.random() * canvas.width;
            asteroid.speed += asteroidSpeedIncrement;
        }
        asteroid.angle += 0.01;  // Slight rotation for the asteroid
    }
}

function createAsteroid() {
    const size = Math.random() < 0.5 ? Math.random() * 20 + 10 : Math.random() * 50 + 30;  // Mix of small and large asteroids
    asteroids.push({
        x: Math.random() * canvas.width,
        y: -50,
        size: size,
        speed: Math.random() * 3 + 3,   // Initial speed
        angle: 0
    });
}

function drawStars() {
    for (const star of stars) {
        ctx.fillStyle = "white";
        ctx.globalAlpha = star.opacity;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function moveStars() {
    for (const star of stars) {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = -5;
            star.x = Math.random() * canvas.width;
        }
    }
}

function createStars() {
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 1.5 + 0.5,
            opacity: Math.random() * 0.5 + 0.5
        });
    }
}

function createParticles(x, y) {
    for (let i = 0; i < 30; i++) {
        particles.push({
            x: x,
            y: y,
            size: Math.random() * 5 + 2,
            speedX: (Math.random() - 0.5) * 4,
            speedY: (Math.random() - 0.5) * 4,
            life: 100
        });
    }
}

function drawParticles() {
    particles.forEach((particle, index) => {
        ctx.fillStyle = `rgba(255, 165, 0, ${particle.life / 100})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life--;

        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });
}

function checkCollisions() {
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];

        // Check bullet-asteroid collisions
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bullet = bullets[j];
            const dx = bullet.x + bullet.width / 2 - asteroid.x;
            const dy = bullet.y + bullet.height / 2 - asteroid.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < asteroid.size) {
                bullets.splice(j, 1);
                asteroids.splice(i, 1);
                score += 10;
                createParticles(asteroid.x, asteroid.y);
                break;
            }
        }

        // Check spaceship-asteroid collisions
        const spaceshipCenterX = spaceship.x + spaceship.width / 2;
        const spaceshipCenterY = spaceship.y + spaceship.height / 2;
        const dx = spaceshipCenterX - asteroid.x;
        const dy = spaceshipCenterY - asteroid.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < asteroid.size + Math.min(spaceship.width, spaceship.height) / 2) {
            gameOver = true;
        }
    }
}

// Upgrade function
function applyUpgrades() {
    if (score >= upgradePoints) {
        // Apply upgrades based on upgrade level
        switch (upgradeLevel) {
            case 0:
                spaceshipSpeed += 1;  // Increase spaceship speed
                upgrades.spaceshipSpeed++;
                break;
            case 1:
                bulletSpeed += 2;  // Increase bullet speed
                upgrades.bulletSpeed++;
                break;
            case 2:
                asteroidSpeedIncrement += 0.1;  // Increase asteroid speed increment
                upgrades.asteroidSpeed++;
                break;
            case 3:
                autoShootInterval = Math.max(50, autoShootInterval - 50);  // Faster auto-shoot
                upgrades.autoShootSpeed++;
                break;
            // Add more cases for additional upgrades
        }

        upgradePoints += upgradeInterval; // Increase upgrade threshold
        upgradeLevel++; // Move to the next upgrade level
    }
}

// Display upgrades on the screen
function drawUpgrades() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Upgrades:", 20, 30);
    ctx.fillText(`Spaceship Speed: ${upgrades.spaceshipSpeed}`, 20, 60);
    ctx.fillText(`Bullet Speed: ${upgrades.bulletSpeed}`, 20, 90);
    ctx.fillText(`Asteroid Speed: ${upgrades.asteroidSpeed}`, 20, 120);
    ctx.fillText(`Auto-shoot Speed: ${upgrades.autoShootSpeed}`, 20, 150);
    ctx.fillText(`Next Upgrade at: ${upgradePoints} points`, 20, 180);
}

// Draw the score meter bar
function drawScoreMeter() {
    const meterWidth = 300;
    const meterHeight = 20;
    const progress = (score % upgradePoints) / upgradePoints;  // Percentage of progress
    ctx.fillStyle = "gray";
    ctx.fillRect(20, canvas.height - 40, meterWidth, meterHeight);
    ctx.fillStyle = "green";
    ctx.fillRect(20, canvas.height - 40, meterWidth * progress, meterHeight);
    ctx.fillStyle = "white";
    ctx.fillText(`Points: ${score}`, 20, canvas.height - 10);
}

// Main game loop (modified to include score meter)
function gameLoop() {
    if (!gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        moveSpaceship();
        drawSpaceship();
        moveBullets();
        drawBullets();
        moveAsteroids();
        drawAsteroids();
        drawStars();
        moveStars();
        drawParticles();
        checkCollisions();
        applyUpgrades(); // Apply upgrades based on score
        drawUpgrades();  // Display upgrade information
        drawScoreMeter(); // Display the score meter

        requestAnimationFrame(gameLoop);
    } else {
        ctx.font = "30px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("Game Over! Score: " + score, canvas.width / 2 - 100, canvas.height / 2);
    }
}

// Initialize the game
createStars();
setInterval(createAsteroid, asteroidSpawnInterval);  // Create new asteroids at a faster interval
gameLoop();
