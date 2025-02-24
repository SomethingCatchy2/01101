const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);


// Starfield setup
const stars = [];
for (let i = 0; i < 200; i++) {
  stars.push({

    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 1.5,
    speed: Math.random() * 2 // Increased speed for a faster starfield
  });
}

const state = {
  raptorSpeed: 0,
  position: 0,
  timeDilation: 1,
  acceleration: 0,
  activeMilestones: [],
  milestones: [
    // ... your milestone definitions ...
  ],
  keys: {},
  dt: 0.016,
};

const SPEED_OF_LIGHT = 3e8;
const INITIAL_ACCELERATION = 1e7;
const ACCELERATION_EXPONENT = 1.5;

// Milestone management
function updateMilestones() {
  // ... your milestone update logic ...
}

document.addEventListener("keydown", (e) => (state.keys[e.key] = true));
document.addEventListener("keyup", (e) => (state.keys[e.key] = false));

function calculateExponentialAcceleration(currentSpeed) {
  // ... your acceleration calculation ...
}

function applyThrust() {
  // ... your thrust application logic ...
}

function updateState() {
  state.position += state.raptorSpeed * state.dt;
  state.timeDilation = Math.sqrt(1 - Math.pow(state.raptorSpeed / SPEED_OF_LIGHT, 2));
  updateMilestones();
}

function drawStarfield() {
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  stars.forEach(star => {
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();

    star.x -= star.speed;
    if (star.x < 0) {
      star.x = canvas.width;
      star.y = Math.random() * canvas.height;
    }
  });
}

function draw() {
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawStarfield();

  // Draw milestones
  state.activeMilestones.forEach((milestone, index) => {
    // ... your milestone drawing logic ...
    const x = canvas.width - normalizedDistance * (canvas.width - 200) - 50;
    const baseY = canvas.height / 2;
    const verticalSpacing = 40;

    // Draw milestone text without overlap check
    ctx.fillStyle = milestone.color;
    ctx.font = "14px Arial";
    ctx.fillText(milestone.name, x + 10, baseY + (index - state.activeMilestones.length / 2) * verticalSpacing);
  });

  // ... your spaceship and stats drawing ...
}

function gameLoop() {
  applyThrust();
  updateState();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();