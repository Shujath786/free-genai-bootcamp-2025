let canvas;
let ctx;
let isDrawing = false;
let lastX = 0;
let lastY = 0;

function initCanvas() {
    canvas = document.getElementById('writing-canvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas background to white
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set drawing style
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    // Add event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDrawing);
}

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = getCoordinates(e);
}

function draw(e) {
    if (!isDrawing) return;
    
    e.preventDefault();
    const [x, y] = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    [lastX, lastY] = [x, y];
}

function stopDrawing() {
    isDrawing = false;
}

function getCoordinates(e) {
    if (e.type.includes('touch')) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        return [
            touch.clientX - rect.left,
            touch.clientY - rect.top
        ];
    }
    const rect = canvas.getBoundingClientRect();
    return [
        e.clientX - rect.left,
        e.clientY - rect.top
    ];
}

function handleTouchStart(e) {
    e.preventDefault();
    startDrawing(e);
}

function handleTouchMove(e) {
    e.preventDefault();
    draw(e);
}

function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function getCanvasImage() {
    return canvas.toDataURL('image/png');
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initCanvas);
