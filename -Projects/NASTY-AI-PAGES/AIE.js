document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const canvas = document.getElementById('paintCanvas');
    const context = canvas.getContext('2d');
    const speedUpButton = document.getElementById('speed-up');
    const slowDownButton = document.getElementById('slow-down');
    const pauseResumeButton = document.getElementById('pause-resume');
    const addColorButton = document.getElementById('add-color');
    const toggleEraserButton = document.getElementById('toggle-eraser');
    const redSlider = document.getElementById('red-slider');
    const greenSlider = document.getElementById('green-slider');
    const blueSlider = document.getElementById('blue-slider');
    const brushSlider = document.getElementById('brush-slider');

    let animationSpeed = 10;
    let paused = false;
    let colors = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet'];
    let isEraser = false; // Track whether eraser mode is active

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function updateBackground() {
        const gradient = `linear-gradient(90deg, ${colors.join(', ')})`;
        body.style.background = gradient;
        body.style.backgroundSize = '400% 400%';
        body.style.animation = paused ? 'none' : `colorWave ${animationSpeed}s infinite linear`;
    }

    pauseResumeButton.addEventListener('click', () => {
        paused = !paused;
        pauseResumeButton.textContent = paused ? 'Resume' : 'Pause';
        updateBackground();
    });

    speedUpButton.addEventListener('click', () => {
        animationSpeed = Math.max(1, animationSpeed - 1);
        updateBackground();
    });

    slowDownButton.addEventListener('click', () => {
        animationSpeed += 1;
        updateBackground();
    });

    addColorButton.addEventListener('click', () => {
        const newColor = `rgb(${redSlider.value}, ${greenSlider.value}, ${blueSlider.value})`;
        colors.push(newColor);
        updateBackground();
    });

    toggleEraserButton.addEventListener('click', () => {
        isEraser = !isEraser;
        toggleEraserButton.textContent = isEraser ? 'Brush' : 'Eraser';
    });

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    canvas.addEventListener('mousedown', (event) => {
        isDrawing = true;
        [lastX, lastY] = [event.clientX, event.clientY];
    });

    canvas.addEventListener('mouseup', () => (isDrawing = false));
    canvas.addEventListener('mousemove', (event) => {
        if (!isDrawing) return;

        context.strokeStyle = isEraser
            ? '#d4d0c8' // Eraser color matches the background
            : `rgb(${redSlider.value}, ${greenSlider.value}, ${blueSlider.value})`;
        context.lineWidth = brushSlider.value;
        context.lineCap = 'round';

        context.beginPath();
        context.moveTo(lastX, lastY);
        context.lineTo(event.clientX, event.clientY);
        context.stroke();
        [lastX, lastY] = [event.clientX, event.clientY];
    });

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    updateBackground();
});
