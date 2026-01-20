// Timer state
let timer = {
    hours: 1,
    minutes: 2,
    seconds: 31,
    totalSeconds: 0,
    intervalId: null,
    isRunning: false,
    isPaused: false
};

// DOM elements
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const pauseBtn = document.getElementById('pauseBtn');
const increaseBtn = document.getElementById('increaseBtn');
const decreaseBtn = document.getElementById('decreaseBtn');
const repeatToggle = document.getElementById('repeatToggle');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const infoBtn = document.getElementById('infoBtn');
const preferencesBtn = document.getElementById('preferencesBtn');
const blogBtn = document.getElementById('blogBtn');
const infoModal = document.getElementById('infoModal');
const preferencesModal = document.getElementById('preferencesModal');

// Initialize timer display
function updateDisplay() {
    hoursEl.textContent = timer.hours.toString();
    minutesEl.textContent = timer.minutes.toString().padStart(2, '0');
    secondsEl.textContent = timer.seconds.toString().padStart(2, '0');
}

// Make time values editable
function makeTimeEditable(element, type, maxValue) {
    element.addEventListener('click', () => {
        if (timer.isRunning || element.classList.contains('disabled')) return; // Don't allow editing while timer is running
        
        const currentValue = timer[type];
        const isHours = type === 'hours';
        const displayValue = isHours ? currentValue.toString() : currentValue.toString().padStart(2, '0');
        
        // Create input element
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'time-value-input';
        input.value = displayValue;
        input.maxLength = isHours ? 2 : 2;
        
        // Get computed styles to match the original element
        const computedStyle = window.getComputedStyle(element);
        input.style.width = computedStyle.width;
        input.style.height = computedStyle.height;
        input.style.fontSize = computedStyle.fontSize;
        input.style.fontWeight = computedStyle.fontWeight;
        input.style.lineHeight = computedStyle.lineHeight;
        
        // Replace element with input
        element.style.display = 'none';
        element.classList.add('editing');
        element.parentElement.insertBefore(input, element);
        
        // Focus and select all text
        input.focus();
        input.select();
        
        // Handle input validation (numbers only)
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
        
        // Handle Enter key (confirm)
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                confirmEdit(input, element, type, maxValue);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit(input, element);
            }
        });
        
        // Handle blur (click outside)
        input.addEventListener('blur', () => {
            confirmEdit(input, element, type, maxValue);
        });
    });
}

// Confirm edit
function confirmEdit(input, element, type, maxValue) {
    let value = parseInt(input.value) || 0;
    
    // Validate and clamp value
    value = Math.max(0, Math.min(maxValue, value));
    
    // Update timer state
    timer[type] = value;
    timer.totalSeconds = 0; // Reset total seconds when manually edited
    
    // Remove input and restore element
    input.remove();
    element.style.display = '';
    element.classList.remove('editing');
    
    // Update display
    updateDisplay();
}

// Cancel edit
function cancelEdit(input, element) {
    input.remove();
    element.style.display = '';
    element.classList.remove('editing');
}

// Calculate total seconds
function calculateTotalSeconds() {
    return timer.hours * 3600 + timer.minutes * 60 + timer.seconds;
}

// Convert total seconds to hours, minutes, seconds
function secondsToTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { hours, minutes, seconds };
}

// Start timer
function startTimer() {
    if (timer.isRunning) return;
    
    timer.isRunning = true;
    timer.isPaused = false;
    pauseBtn.textContent = 'Pause';
    
    // Disable editing when timer is running
    [hoursEl, minutesEl, secondsEl].forEach(el => el.classList.add('disabled'));
    
    if (timer.totalSeconds === 0) {
        timer.totalSeconds = calculateTotalSeconds();
    }
    
    timer.intervalId = setInterval(() => {
        if (timer.totalSeconds > 0) {
            timer.totalSeconds--;
            const time = secondsToTime(timer.totalSeconds);
            timer.hours = time.hours;
            timer.minutes = time.minutes;
            timer.seconds = time.seconds;
            updateDisplay();
        } else {
            stopTimer();
            if (repeatToggle.checked) {
                // Reset and restart if repeat is enabled
                resetTimer();
                startTimer();
            } else {
                // Timer finished
                pauseBtn.textContent = 'Start';
            }
        }
    }, 1000);
}

// Stop timer
function stopTimer() {
    timer.isRunning = false;
    // Re-enable editing when timer stops
    [hoursEl, minutesEl, secondsEl].forEach(el => el.classList.remove('disabled'));
    if (timer.intervalId) {
        clearInterval(timer.intervalId);
        timer.intervalId = null;
    }
}

// Pause/Resume timer
function togglePause() {
    if (!timer.isRunning && timer.totalSeconds === 0) {
        // Start fresh
        timer.totalSeconds = calculateTotalSeconds();
        startTimer();
    } else if (timer.isRunning) {
        // Pause
        stopTimer();
        timer.isPaused = true;
        pauseBtn.textContent = 'Resume';
    } else if (timer.isPaused) {
        // Resume
        startTimer();
    }
}

// Reset timer to initial values
function resetTimer() {
    stopTimer();
    timer.hours = 1;
    timer.minutes = 2;
    timer.seconds = 31;
    timer.totalSeconds = 0;
    timer.isPaused = false;
    pauseBtn.textContent = 'Start';
    updateDisplay();
}

// Increase time
function increaseTime() {
    if (timer.isRunning) return;
    
    timer.seconds += 10;
    if (timer.seconds >= 60) {
        timer.minutes += Math.floor(timer.seconds / 60);
        timer.seconds = timer.seconds % 60;
    }
    if (timer.minutes >= 60) {
        timer.hours += Math.floor(timer.minutes / 60);
        timer.minutes = timer.minutes % 60;
    }
    if (timer.hours > 99) {
        timer.hours = 99;
        timer.minutes = 59;
        timer.seconds = 59;
    }
    updateDisplay();
}

// Decrease time
function decreaseTime() {
    if (timer.isRunning) return;
    
    timer.totalSeconds = calculateTotalSeconds();
    timer.totalSeconds = Math.max(0, timer.totalSeconds - 10);
    const time = secondsToTime(timer.totalSeconds);
    timer.hours = time.hours;
    timer.minutes = time.minutes;
    timer.seconds = time.seconds;
    updateDisplay();
}

// Toggle fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && 
        !document.msFullscreenElement) {
        // Enter fullscreen
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        }
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// Handle fullscreen change events
function handleFullscreenChange() {
    const isFullscreen = !!(document.fullscreenElement || 
                           document.webkitFullscreenElement || 
                           document.mozFullScreenElement || 
                           document.msFullscreenElement);
    
    if (isFullscreen) {
        document.body.classList.add('fullscreen-mode');
    } else {
        document.body.classList.remove('fullscreen-mode');
    }
}

// Listen for fullscreen changes
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

// Modal functions
function openModal(modal) {
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
}

// Event listeners
pauseBtn.addEventListener('click', togglePause);
increaseBtn.addEventListener('click', increaseTime);
decreaseBtn.addEventListener('click', decreaseTime);
fullscreenBtn.addEventListener('click', toggleFullscreen);

infoBtn.addEventListener('click', () => openModal(infoModal));
preferencesBtn.addEventListener('click', () => openModal(preferencesModal));
blogBtn.addEventListener('click', () => {
    window.open('https://example.com/blog', '_blank');
});

// Close modals
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        closeModal(modal);
    });
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target);
    }
});

// Preferences
document.getElementById('savePreferences').addEventListener('click', () => {
    const hours = parseInt(document.getElementById('initialHours').value) || 0;
    const minutes = parseInt(document.getElementById('initialMinutes').value) || 0;
    const seconds = parseInt(document.getElementById('initialSeconds').value) || 0;
    
    if (!timer.isRunning) {
        timer.hours = Math.min(99, Math.max(0, hours));
        timer.minutes = Math.min(59, Math.max(0, minutes));
        timer.seconds = Math.min(59, Math.max(0, seconds));
        timer.totalSeconds = 0;
        updateDisplay();
    }
    
    closeModal(preferencesModal);
});

// Keyboard shortcuts (only when not editing)
document.addEventListener('keydown', (e) => {
    // Don't trigger shortcuts if user is editing a time value
    if (e.target.classList.contains('time-value-input')) {
        return;
    }
    
    if (e.code === 'Space') {
        e.preventDefault();
        togglePause();
    } else if (e.code === 'ArrowUp' || e.code === 'Equal') {
        e.preventDefault();
        increaseTime();
    } else if (e.code === 'ArrowDown' || e.code === 'Minus') {
        e.preventDefault();
        decreaseTime();
    } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
    }
});

// Initialize display
updateDisplay();

// Make time values editable
makeTimeEditable(hoursEl, 'hours', 99);
makeTimeEditable(minutesEl, 'minutes', 59);
makeTimeEditable(secondsEl, 'seconds', 59);

