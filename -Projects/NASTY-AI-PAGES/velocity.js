const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

// Set canvas to fill the entire window and ensure it’s responsive
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const state = {
  raptorSpeedX: 0, // Horizontal speed of the spaceship
  positionX: canvas.width / 2, // Spaceship's current position on the X-axis (centered)
  positionY: canvas.height / 2, // Spaceship's position on the Y-axis (centered)
  timeDilation: 1,
  acceleration: 0,
  keys: {},
  dt: 0.016,
  trail: [], // Array to store trail particles
  particles: [], // Array to store particle effects
  stars: [], // Stars array for the background
};

// Star properties
const SPEED_OF_LIGHT = 3e9;
const INITIAL_ACCELERATION = 1e20;
const ACCELERATION_EXPONENT = 2.5;

// Initialize stars for the background with more variety and behavior
for (let i = 0; i < 300; i++) {
  state.stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    speed: Math.random() * 3 + 1, // Speed at which each star moves
    size: Math.random() * 2 + 0.5, // Random star size for variety
    trail: [], // Comet trail for each star
    angle: Math.random() * Math.PI * 2, // Random starting angle for stars' movement
  });
}

document.addEventListener("keydown", (e) => (state.keys[e.key] = true));
document.addEventListener("keyup", (e) => (state.keys[e.key] = false));

function calculateExponentialAcceleration(currentSpeed) {
  const speedFraction = Math.abs(currentSpeed) / SPEED_OF_LIGHT;
  return INITIAL_ACCELERATION * Math.pow(1 - speedFraction, ACCELERATION_EXPONENT);
}

function applyThrust() {
  state.acceleration = 10;
  const currentAcceleration = calculateExponentialAcceleration(Math.abs(state.raptorSpeedX));

  // Left and right movement using both Arrow keys and A/D keys
  if (state.keys["ArrowLeft"] || state.keys["a"] || state.keys["A"]) {
    state.raptorSpeedX -= currentAcceleration * state.dt; // move left
  }
  if (state.keys["ArrowRight"] || state.keys["d"] || state.keys["D"]) {
    state.raptorSpeedX += currentAcceleration * state.dt; // move right
  }

  // Limit the spaceship's speed
  const speed = Math.abs(state.raptorSpeedX);
  const maxSpeed = SPEED_OF_LIGHT * 0.9999999999999999999999999999999999999999999999999999999999;
  if (speed > maxSpeed) {
    state.raptorSpeedX = (state.raptorSpeedX / speed) * maxSpeed;
  }
}

function updateState() {
  state.positionX += state.raptorSpeedX * state.dt;
  state.timeDilation = Math.sqrt(1 - Math.pow(state.raptorSpeedX / SPEED_OF_LIGHT, 2));
}

function drawSpaceship() {
  ctx.save(); // Save the current canvas state
  ctx.translate(canvas.width / 2, canvas.height / 2); // Translate the canvas to the spaceship's position

  // Rotate spaceship based on movement direction (right = 0 radians, left = Math.PI radians)
  const rotationAngle = Math.atan2(state.raptorSpeedX, 0); // Facing right by default
  ctx.rotate(rotationAngle);

  // Draw spaceship body with enhanced shading, detailing, and curves
  ctx.save(); // Save the current canvas state

  // Create a gradient for the spaceship body
  const bodyGradient = ctx.createLinearGradient(-25, -20, 25, 15);
  bodyGradient.addColorStop(0, "#00bcd4"); // Cyan at the top
  bodyGradient.addColorStop(1, "#0097a7"); // Darker cyan at the bottom
  ctx.fillStyle = bodyGradient;

  // Begin path for spaceship body
  ctx.beginPath();

  // Smooth, curved top and wings with bezier curves for a sleek shape
  ctx.moveTo(0, -20); // Top point of the spaceship
  ctx.bezierCurveTo(-30, -10, -25, 10, -25, 15); // Left wing curve
  ctx.lineTo(0, 10); // Bottom point
  ctx.lineTo(25, 15); // Right wing
  ctx.bezierCurveTo(30, 10, 25, -10, 0, -20); // Right wing curve to top

  ctx.closePath();
  ctx.fill();

  // Add a subtle highlight on the top
  ctx.beginPath();
  const highlightGradient = ctx.createLinearGradient(-25, -20, 25, -10);
  highlightGradient.addColorStop(0, "rgba(0, 255, 255, 0.6)");
  highlightGradient.addColorStop(1, "rgba(0, 255, 255, 0.3)");
  ctx.fillStyle = highlightGradient;
  ctx.moveTo(0, -20); // Top point of the spaceship
  ctx.bezierCurveTo(-25, -10, -20, 5, 0, 5); // Curved highlight
  ctx.bezierCurveTo(20, 5, 25, -10, 0, -20); // Right highlight curve
  ctx.closePath();
  ctx.fill();

  // Add darker shadow on the bottom part of the spaceship for depth
  ctx.beginPath();
  const shadowGradient = ctx.createLinearGradient(-25, 15, 25, 25);
  shadowGradient.addColorStop(0, "rgba(0, 0, 0, 0.4)");
  shadowGradient.addColorStop(1, "rgba(0, 0, 0, 0.8)");
  ctx.fillStyle = shadowGradient;
  ctx.moveTo(0, 10); // Bottom point
  ctx.lineTo(-25, 15); // Left wing
  ctx.bezierCurveTo(-25, 25, -15, 30, 0, 25); // Bottom shadow
  ctx.bezierCurveTo(15, 30, 25, 25, 25, 15); // Right bottom shadow
  ctx.closePath();
  ctx.fill();

  ctx.restore(); // Restore the previous canvas state

  // Add glowing engine effect for a more immersive feel
  if (Math.abs(state.raptorSpeedX) > 0) {
    ctx.beginPath();
    ctx.fillStyle = "rgba(0,255,255,0.7)";
    ctx.arc(0, 25, 18, 0, Math.PI * 2); // A larger engine glow
    ctx.fill();
  }

  // Adding shading and highlights to the spaceship
  ctx.beginPath();
  ctx.fillStyle = "rgba(0, 255, 255, 0.3)"; // Subtle highlight effect
  ctx.arc(0, -10, 15, Math.PI / 4, Math.PI * 3 / 4); // Highlight effect on the upper part of the spaceship
  ctx.fill();

  // Draw a darker shading effect on the bottom of the spaceship
  ctx.beginPath();
  ctx.fillStyle = "rgba(0, 255, 255, 0.5)"; // Bottom shading
  ctx.arc(0, 20, 15, Math.PI * 5 / 4, Math.PI * 7 / 4);
  ctx.fill();

  ctx.restore(); // Restore the previous canvas state
}

function drawTrail() {
  // Create a trail behind the spaceship with enhanced fading effect
  if (Math.abs(state.raptorSpeedX) > 0) {
    state.trail.push({ x: state.positionX, y: state.positionY });

    // Limit trail length
    if (state.trail.length > 400) {
      state.trail.shift();
    }

    // Draw the trail particles
    for (let i = 0; i < state.trail.length; i++) {
      const alpha = 1 - (i / state.trail.length); // Fade the trail as it moves
      ctx.fillStyle = `rgba(0, 255, 255, ${alpha * 0.5})`; // Light cyan trail
      ctx.beginPath();
      ctx.arc(state.trail[i].x, state.trail[i].y, 3, 0, Math.PI * 2); // Circular trail effect
      ctx.fill();
    }
  }
}

function createParticle() {
  // Check if the left or right arrow keys or A/D keys are being held down
  if (state.keys["ArrowLeft"] || state.keys["ArrowRight"] || state.keys["a"] || state.keys["A"] || state.keys["d"] || state.keys["D"]) {
    console.log("Creating particle..."); // Log to verify particle creation

    // Create particle effect for spaceship exhaust with a more complex effect
    state.particles.push({
      x: state.positionX + Math.random() * 10 - 5, // Random x position near spaceship
      y: state.positionY + 25, // Starting at spaceship exhaust (just below the spaceship)
      size: Math.random() * 3 + 1, // Random particle size
      speedX: Math.random() * 2 - 1, // Random horizontal speed
      speedY: Math.random() * 2 + 1, // Random vertical speed
      opacity: 1, // Full opacity at start
      color: `rgba(0, 255, 255, ${Math.random() * 0.6 + 0.4})` // Randomized particle color
    });
  }
}



function updateParticles() {
  // Update and draw each particle
  for (let i = 0; i < state.particles.length; i++) {
    let p = state.particles[i];
    p.x += p.speedX;  // Move horizontally
    p.y += p.speedY;  // Move vertically
    p.opacity -= 0.02; // Fade the particles over time

    if (p.opacity <= 0) {
      state.particles.splice(i, 1);  // Remove particle when opacity reaches 0
      i--;  // Adjust the index after removal
    } else {
      // Draw the particle with updated position and opacity
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); // Draw particle as a circle
      ctx.fill();
    }
  }
}

function drawStats() {
  // Create a semi-transparent background for the stats
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(10, 10, 300, 130);

  // Stats text with better formatting
  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.fillText(`Speed: ${(Math.abs(state.raptorSpeedX) / SPEED_OF_LIGHT * 100).toFixed(8)}% c`, 20, 30);
  ctx.fillText(`Time Dilation: ${state.timeDilation.toFixed(8)}`, 20, 60);
  ctx.fillText(`Position X: ${state.positionX.toFixed(2)} px`, 20, 90);
  ctx.fillText(`Acceleration: ${(state.acceleration / 1000).toFixed(2)} km/s²`, 20, 120);
}

function drawStars() {
  const starSpeedFactor = Math.abs(state.raptorSpeedX) / SPEED_OF_LIGHT;

  for (let star of state.stars) {
    // Move stars based on the speed factor, simulating movement
    star.x -= star.speed * starSpeedFactor;

    // Create trail effect for each star (comet tail)
    star.trail.push({ x: star.x, y: star.y });

    if (star.trail.length > 30) { // Limit trail length
      star.trail.shift();
    }

    // Draw the comet tail as a fading line
    for (let i = 0; i < star.trail.length; i++) {
      const alpha = 1 - (i / star.trail.length); // Fade the trail as it moves
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`; // Light trail effect
      ctx.beginPath();
      ctx.arc(star.trail[i].x, star.trail[i].y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Reset star position when it moves off screen
    if (star.x < 0) {
      star.x = canvas.width;
      star.y = Math.random() * canvas.height;
      star.trail = []; // Reset comet trail
    }

    // Draw the current star position with varying opacity and size
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Gradient background for deep space feel with dynamic color change
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#000022");
  gradient.addColorStop(1, "#000000");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawStars();
  drawSpaceship();
  drawTrail();
  updateParticles();
  drawStats();
}

function gameLoop() {
  applyThrust();
  updateState();
  createParticle(); // Will create particles only if any of the keys are held down
  updateParticles(); // Update and draw particles
  draw();
  requestAnimationFrame(gameLoop);  // Keep the loop going
}


gameLoop();

