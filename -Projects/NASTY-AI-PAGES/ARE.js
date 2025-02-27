let slideIndex = 0;
const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions to match the container
canvas.width = window.innerWidth;
canvas.height = 500;

// Define an array of art functions (each one draws a unique art piece)
const artFunctions = [
    drawComplexGradient,
    drawAnimatedCircles,
    drawMovingDots,      // Updated Particle System with moving and summoning dots
    drawDynamicPolygon,
    drawMovingGradient,      // New Slide 1
    drawSpinningSquares,     // New Slide 2
    drawConcentricCircles,   // New Slide 3
    drawBouncingBalls        // New Slide 4
];

// Function to show slides
function showSlides() {
    // Clear the canvas before drawing each new piece
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the current art piece
    artFunctions[slideIndex]();

    // Update the slide index
    slideIndex = (slideIndex + 1) % artFunctions.length;
}

// Art function 1: Complex Gradient Background
function drawComplexGradient() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgb(255, 94, 77)'); // Red
    gradient.addColorStop(0.5, 'rgb(255, 204, 0)'); // Yellow
    gradient.addColorStop(1, 'rgb(0, 153, 255)'); // Blue

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Art function 2: Animated Circles
function drawAnimatedCircles() {
    const time = Date.now() / 1000; // Get current time for animation
    const circleCount = 10;

    for (let i = 0; i < circleCount; i++) {
        const x = canvas.width / 2 + Math.sin(time + i) * 200;
        const y = canvas.height / 2 + Math.cos(time + i) * 200;
        const radius = Math.abs(Math.sin(time + i) * 50) + 20;
        const color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
    }
}

// Art function 3: Moving Dots (Always Moving and Summoning New Dots)
let movingDots = [];

function drawMovingDots() {
    // Summon new dots at random intervals
    if (Math.random() < 0.05) { // 5% chance to create a new dot each frame
        const dot = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 5 + 3,
            color: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
            speedX: Math.random() * 2 - 1, // Random horizontal speed
            speedY: Math.random() * 2 - 1  // Random vertical speed
        };
        movingDots.push(dot);
    }

    // Update the position of each dot
    movingDots.forEach(dot => {
        dot.x += dot.speedX;
        dot.y += dot.speedY;

        // Wrap around edges of the canvas
        if (dot.x > canvas.width) dot.x = 0;
        if (dot.x < 0) dot.x = canvas.width;
        if (dot.y > canvas.height) dot.y = 0;
        if (dot.y < 0) dot.y = canvas.height;

        // Draw the dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, 2 * Math.PI);
        ctx.fillStyle = dot.color;
        ctx.fill();
    });
}

// Art function 4: Dynamic Polygon (hexagon with rotating effect)
function drawDynamicPolygon() {
    const sides = 6;
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    const radius = 100;
    const angle = (Math.PI * 2) / sides;
    const rotation = Date.now() / 1000; // Rotate based on time

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation); // Apply rotation based on time

    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const dx = Math.cos(i * angle) * radius;
        const dy = Math.sin(i * angle) * radius;
        ctx.lineTo(dx, dy);
    }
    ctx.closePath();
    ctx.fillStyle = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
    ctx.fill();

    ctx.restore();
}

// Art function 5: Moving Gradient Animation
function drawMovingGradient() {
    const time = Date.now() / 1000;
    const gradient = ctx.createLinearGradient(
        Math.sin(time) * 200, 0,
        Math.cos(time) * 200 + canvas.width, canvas.height
    );
    gradient.addColorStop(0, 'rgb(255, 94, 77)');
    gradient.addColorStop(0.5, 'rgb(0, 255, 255)');
    gradient.addColorStop(1, 'rgb(255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Art function 6: Spinning Squares
function drawSpinningSquares() {
    const time = Date.now() / 1000;
    const squareCount = 6;

    for (let i = 0; i < squareCount; i++) {
        const size = Math.abs(Math.sin(time + i) * 100);
        const rotation = time * (i + 1);
        const x = canvas.width / 2 + Math.cos(rotation) * 150;
        const y = canvas.height / 2 + Math.sin(rotation) * 150;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.fillStyle = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.restore();
    }
}

// Art function 7: Concentric Circles
function drawConcentricCircles() {
    const time = Date.now() / 1000;
    const maxCircles = 10;
    const maxSize = 100;

    for (let i = 0; i < maxCircles; i++) {
        const radius = Math.abs(Math.sin(time + i) * maxSize);
        const color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;

        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, 2 * Math.PI);
        ctx.lineWidth = 5;
        ctx.strokeStyle = color;
        ctx.stroke();
    }
}

// Art function 8: Bouncing Balls
let balls = [];
function drawBouncingBalls() {
    if (balls.length < 10) {
        const ball = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 20 + 10,
            color: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
            speedX: Math.random() * 2 - 1,
            speedY: Math.random() * 2 - 1
        };
        balls.push(ball);
    }

    balls.forEach(ball => {
        ball.x += ball.speedX;
        ball.y += ball.speedY;

        // Bounce off the edges
        if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= canvas.width) {
            ball.speedX *= -1;
        }
        if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
            ball.speedY *= -1;
        }

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
        ctx.fillStyle = ball.color;
        ctx.fill();
    });
}

// Control buttons
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Previous slide button functionality
prevBtn.addEventListener('click', () => {
    slideIndex = (slideIndex - 1 + artFunctions.length) % artFunctions.length;
    showSlides();
});

// Next slide button functionality
nextBtn.addEventListener('click', () => {
    slideIndex = (slideIndex + 1) % artFunctions.length;
    showSlides();
});

// Add a color picker to dynamically change the background color
const colorPicker = document.createElement('input');
colorPicker.type = 'color';
colorPicker.value = '#FFFFFF'; // Default white color
document.body.appendChild(colorPicker);

colorPicker.addEventListener('input', (event) => {
    const color = event.target.value;
    canvas.style.backgroundColor = color; // Change the canvas background color
});

// Start the slideshow
showSlides();
