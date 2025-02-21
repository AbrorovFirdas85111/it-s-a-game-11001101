// Elementlarni tanlash
const gameArea = document.getElementById('game-area');
const crosshair = document.getElementById('crosshair');
const scoreDisplay = document.getElementById('score');
const timeLeftDisplay = document.getElementById('time-left');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const shootSound = document.getElementById('shoot-sound');
const hitSound = document.getElementById('hit-sound');
const bgMusic = document.getElementById('bg-music');

// O'yin holati
let score = 0;
let timeLeft = 60;
let gameActive = false;
let targets = [];
let gameInterval;

// Nishon belgisini sichqoncha bilan boshqarish
document.addEventListener('mousemove', (e) => {
    if (gameActive) {
        const rect = gameArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            crosshair.style.left = `${x}px`;
            crosshair.style.top = `${y}px`;
        }
    }
});

// O'q otish
document.addEventListener('click', (e) => {
    if (gameActive) {
        shootSound.play();
        checkHit(e);
    }
});

// Nishonga tegishni tekshirish
function checkHit(e) {
    const rect = gameArea.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    for (let i = targets.length - 1; i >= 0; i--) {
        const target = targets[i];
        const targetRect = target.getBoundingClientRect();
        const targetX = targetRect.left - rect.left + targetRect.width / 2;
        const targetY = targetRect.top - rect.top + targetRect.height / 2;
        const distance = Math.sqrt((clickX - targetX) ** 2 + (clickY - targetY) ** 2);

        if (distance < targetRect.width / 2) {
            hitTarget(target, i);
            return;
        }
    }
}

// Nishonga tegish logikasi
function hitTarget(target, index) {
    hitSound.play();
    target.classList.add('hit');
    score += getScoreForTarget(target);
    scoreDisplay.textContent = score;
    setTimeout(() => {
        target.remove();
        targets.splice(index, 1);
    }, 300);
}

// Nishondan ochko hisoblash
function getScoreForTarget(target) {
    if (target.classList.contains('target-small')) return 30;
    if (target.classList.contains('target-medium')) return 20;
    return 10; // target-large
}

// O'yinni boshlash
startButton.addEventListener('click', startGame);

function startGame() {
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameActive = true;
    score = 0;
    timeLeft = 60;
    scoreDisplay.textContent = score;
    timeLeftDisplay.textContent = timeLeft;
    bgMusic.play();
    targets = [];
    gameInterval = setInterval(gameLoop, 1000 / 60); // 60 FPS
    spawnTarget();
}

// O'yin tsikli
function gameLoop() {
    if (!gameActive) return;

    timeLeft -= 1 / 60;
    timeLeftDisplay.textContent = Math.ceil(timeLeft);

    if (timeLeft <= 0) {
        endGame();
    }

    if (Math.random() < 0.03) {
        spawnTarget();
    }

    moveTargets();
}

// Nishonlarni yaratish
function spawnTarget() {
    const target = document.createElement('div');
    target.classList.add('target');

    // Tasodifiy o'lcham
    const size = Math.random();
    if (size < 0.33) {
        target.classList.add('target-small');
    } else if (size < 0.66) {
        target.classList.add('target-medium');
    } else {
        target.classList.add('target-large');
    }

    // Tasodifiy rang varianti
    const variant = Math.floor(Math.random() * 3);
    target.classList.add(`variant-${variant + 1}`);

    // Tasodifiy joylashuv
    const rect = gameArea.getBoundingClientRect();
    const x = Math.random() * (rect.width - 60);
    const y = Math.random() * (rect.height - 60);
    target.style.left = `${x}px`;
    target.style.top = `${y}px`;

    // Tasodifiy tezlik
    target.speedX = (Math.random() - 0.5) * 4;
    target.speedY = (Math.random() - 0.5) * 4;

    gameArea.appendChild(target);
    targets.push(target);
}
// Nishonlarni harakatlantirish
function moveTargets() {
    const rect = gameArea.getBoundingClientRect();
    targets.forEach((target, index) => {
        let x = parseFloat(target.style.left) + target.speedX;
        let y = parseFloat(target.style.top) + target.speedY;

        // Chegaralarni tekshirish va teskari yo'nalish
        const size = target.classList.contains('target-small') ? 20 :
                     target.classList.contains('target-medium') ? 40 : 60;

        if (x < 0 || x > rect.width - size) {
            target.speedX = -target.speedX;
            x = Math.max(0, Math.min(x, rect.width - size));
        }
        if (y < 0 || y > rect.height - size) {
            target.speedY = -target.speedY;
            y = Math.max(0, Math.min(y, rect.height - size));
        }

        target.style.left = `${x}px`;
        target.style.top = `${y}px`;

        // Vaqt o'tishi bilan nishonlarni yo'q qilish
        if (!target.timer) target.timer = 5; // 5 soniya umr
        target.timer -= 1 / 60;
        if (target.timer <= 0) {
            target.remove();
            targets.splice(index, 1);
        }
    });
}

// O'yinni tugatish
function endGame() {
    gameActive = false;
    clearInterval(gameInterval);
    bgMusic.pause();
    bgMusic.currentTime = 0;
    gameOverScreen.classList.remove('hidden');
    finalScoreDisplay.textContent = score;

    // Barcha nishonlarni o'chirish
    targets.forEach(target => target.remove());
    targets = [];
}

// Qayta boshlash
restartButton.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    startGame();
});

// Klaviatura bilan boshqaruv (masalan, pauza uchun)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && gameActive) {
        togglePause();
    }
});

// O'yinni pauza qilish/tiklash
let isPaused = false;
function togglePause() {
    if (isPaused) {
        gameInterval = setInterval(gameLoop, 1000 / 60);
        bgMusic.play();
        isPaused = false;
    } else {
        clearInterval(gameInterval);
        bgMusic.pause();
        isPaused = true;
        showPauseMessage();
    }
}

// Pauza xabari
function showPauseMessage() {
    const pauseMsg = document.createElement('div');
    pauseMsg.id = 'pause-message';
    pauseMsg.innerHTML = '<h2>O\'yin Pauzada</h2><p>Davom etish uchun ESC bosing</p>';
    pauseMsg.style.position = 'absolute';
    pauseMsg.style.top = '50%';
    pauseMsg.style.left = '50%';
    pauseMsg.style.transform = 'translate(-50%, -50%)';
    pauseMsg.style.color = '#ffffff';
    pauseMsg.style.background = 'rgba(0, 0, 0, 0.7)';
    pauseMsg.style.padding = '20px';
    pauseMsg.style.borderRadius = '10px';
    pauseMsg.style.textAlign = 'center';
    gameArea.appendChild(pauseMsg);
}

// Pauzadan chiqishda xabarni o'chirish
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isPaused) {
        const pauseMsg = document.getElementById('pause-message');
        if (pauseMsg) pauseMsg.remove();
        togglePause();
    }
});

// Qo'shimcha effektlar: nishon paydo bo'lish animatsiyasi
function spawnTargetWithEffect() {
    spawnTarget();
    const latestTarget = targets[targets.length - 1];
    latestTarget.classList.add('pulse');
    setTimeout(() => latestTarget.classList.remove('pulse'), 1500);
}

// Har 5 soniyada maxsus nishon paydo bo'lishi
let specialTargetInterval;
function startSpecialTargets() {
    specialTargetInterval = setInterval(() => {
        if (gameActive) spawnSpecialTarget();
    }, 5000);
}

// Maxsus nishon (bonus ochko)
function spawnSpecialTarget() {
    const target = document.createElement('div');
    target.classList.add('target', 'target-medium', 'glow');
    target.style.background = 'radial-gradient(circle, #00ff00, #99ff99, transparent)';

    const rect = gameArea.getBoundingClientRect();
    const x = Math.random() * (rect.width - 40);
    const y = Math.random() * (rect.height - 40);
    target.style.left = `${x}px`;
    target.style.top = `${y}px`;

    target.speedX = (Math.random() - 0.5) * 6;
    target.speedY = (Math.random() - 0.5) * 6;
    target.timer = 3; // 3 soniya umr
    target.isSpecial = true;

    gameArea.appendChild(target);
    targets.push(target);
}

// Maxsus nishonga tegish
function checkSpecialHit(target) {
    if (target.isSpecial) {
        score += 50;
        scoreDisplay.textContent = score;
        target.classList.add('hit');
        setTimeout(() => target.remove(), 300);
    }
}
// Qiyinlik darajasini oshirish
let difficultyLevel = 1;
function increaseDifficulty() {
    if (score > 50 && difficultyLevel === 1) {
        difficultyLevel = 2;
        spawnTargetWithEffect();
    } else if (score > 100 && difficultyLevel === 2) {
        difficultyLevel = 3;
        spawnTargetWithEffect();
    } else if (score > 200 && difficultyLevel === 3) {
        difficultyLevel = 4;
    }

    adjustTargetSpeed();
}

// Nishon tezligini qiyinlikka qarab o'zgartirish
function adjustTargetSpeed() {
    targets.forEach(target => {
        if (difficultyLevel === 2) {
            target.speedX *= 1.2;
            target.speedY *= 1.2;
        } else if (difficultyLevel === 3) {
            target.speedX *= 1.5;
            target.speedY *= 1.5;
        } else if (difficultyLevel === 4) {
            target.speedX *= 2;
            target.speedY *= 2;
        }
    });
}

// O'yin statistikasini ko'rsatish
function showGameStats() {
    const stats = document.createElement('div');
    stats.id = 'game-stats';
    stats.innerHTML = `
        <h3>Statistika</h3>
        <p>Yakuniy Ochko: ${score}</p>
        <p>Qiyinlik Darajasi: ${difficultyLevel}</p>
        <p>Nishonlar Soni: ${targets.length}</p>
    `;
    stats.style.position = 'absolute';
    stats.style.bottom = '20px';
    stats.style.left = '20px';
    stats.style.color = '#ffffff';
    stats.style.background = 'rgba(0, 0, 0, 0.5)';
    stats.style.padding = '10px';
    stats.style.borderRadius = '5px';
    gameArea.appendChild(stats);

    setTimeout(() => stats.remove(), 3000);
}

// O'yin tugagach statistikani ko'rsatish
function endGameWithStats() {
    endGame();
    showGameStats();
}

// Ekran tebranish effekti (katta nishonga tekkanda)
function screenShake() {
    gameArea.style.animation = 'shake 0.3s';
    setTimeout(() => {
        gameArea.style.animation = '';
    }, 300);
}

const shakeKeyframes = `
    @keyframes shake {
        0% { transform: translate(0, 0); }
        25% { transform: translate(5px, -5px); }
        50% { transform: translate(-5px, 5px); }
        75% { transform: translate(5px, 5px); }
        100% { transform: translate(0, 0); }
    }
`;
document.head.insertAdjacentHTML('beforeend', `<style>${shakeKeyframes}</style>`);

// Nishonga tegishda effekt qo'shish
function enhancedHitTarget(target, index) {
    hitTarget(target, index);
    if (target.classList.contains('target-large')) {
        screenShake();
    }
    if (target.isSpecial) {
        checkSpecialHit(target);
    }
}

// Tasodifiy bonus paydo bo'lishi
function spawnBonus() {
    if (Math.random() < 0.05) {
        const bonus = document.createElement('div');
        bonus.classList.add('target', 'target-medium', 'pulse');
        bonus.style.background = 'radial-gradient(circle, #ffd700, #ffff99, transparent)';
        bonus.isBonus = true;

        const rect = gameArea.getBoundingClientRect();
        const x = Math.random() * (rect.width - 40);
        const y = Math.random() * (rect.height - 40);
        bonus.style.left = `${x}px`;
        bonus.style.top = `${y}px`;

        bonus.speedX = (Math.random() - 0.5) * 5;
        bonus.speedY = (Math.random() - 0.5) * 5;
        bonus.timer = 4;

        gameArea.appendChild(bonus);
        targets.push(bonus);
    }
}

// Bonusga tegish
function checkBonusHit(target) {
    if (target.isBonus) {
        score += 100;
        scoreDisplay.textContent = score;
        target.classList.add('hit');
        setTimeout(() => target.remove(), 300);
        showBonusMessage();
    }
}

// Bonus xabari
function showBonusMessage() {
    const bonusMsg = document.createElement('div');
    bonusMsg.innerHTML = '+100 Bonus!';
    bonusMsg.style.position = 'absolute';
    bonusMsg.style.top = '20%';
    bonusMsg.style.left = '50%';
    bonusMsg.style.transform = 'translateX(-50%)';
    bonusMsg.style.color = '#ffd700';
    bonusMsg.style.fontSize = '30px';
    bonusMsg.style.textShadow = '0 0 10px #ffd700';
    gameArea.appendChild(bonusMsg);

    setTimeout(() => bonusMsg.remove(), 1000);
}

// O'yin loopiga bonus qo'shish
function enhancedGameLoop() {
    gameLoop();
    increaseDifficulty();
    spawnBonus();
}

// Yangilangan startGame funksiyasi
function enhancedStartGame() {
    startGame();
    startSpecialTargets();
    gameInterval = setInterval(enhancedGameLoop, 1000 / 60);
}

startButton.removeEventListener('click', startGame);
startButton.addEventListener('click', enhancedStartGame);
// Combo tizimi (ketma-ket nishonlarga tegish)
let comboCount = 0;
let comboTimeout;
function updateCombo(target) {
    comboCount++;
    clearTimeout(comboTimeout);
    comboTimeout = setTimeout(() => {
        comboCount = 0;
        hideComboMessage();
    }, 2000);

    if (comboCount > 1) {
        showComboMessage();
        score += comboCount * 5; // Har combo uchun qo'shimcha ochko
        scoreDisplay.textContent = score;
    }

    enhancedHitTarget(target, targets.indexOf(target));
}

// Combo xabari
function showComboMessage() {
    let comboMsg = document.getElementById('combo-message');
    if (!comboMsg) {
        comboMsg = document.createElement('div');
        comboMsg.id = 'combo-message';
        comboMsg.style.position = 'absolute';
        comboMsg.style.top = '10%';
        comboMsg.style.left = '50%';
        comboMsg.style.transform = 'translateX(-50%)';
        comboMsg.style.color = '#00ff00';
        comboMsg.style.fontSize = '24px';
        comboMsg.style.textShadow = '0 0 10px #00ff00';
        gameArea.appendChild(comboMsg);
    }
    comboMsg.textContent = `Combo x${comboCount}!`;
}

function hideComboMessage() {
    const comboMsg = document.getElementById('combo-message');
    if (comboMsg) comboMsg.remove();
}

// Yangilangan checkHit funksiyasi combo bilan
function checkHitWithCombo(e) {
    const rect = gameArea.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    for (let i = targets.length - 1; i >= 0; i--) {
        const target = targets[i];
        const targetRect = target.getBoundingClientRect();
        const targetX = targetRect.left - rect.left + targetRect.width / 2;
        const targetY = targetRect.top - rect.top + targetRect.height / 2;
        const distance = Math.sqrt((clickX - targetX) ** 2 + (clickY - targetY) ** 2);

        if (distance < targetRect.width / 2) {
            updateCombo(target);
            return;
        }
    }
}

// Progress bar qo'shish
function addProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.id = 'progress-bar';
    progressBar.style.position = 'absolute';
    progressBar.style.bottom = '10px';
    progressBar.style.left = '50%';
    progressBar.style.transform = 'translateX(-50%)';
    progressBar.style.width = '300px';
    progressBar.style.height = '10px';
    progressBar.style.background = '#ffffff20';
    progressBar.style.borderRadius = '5px';
    progressBar.style.overflow = 'hidden';

    const progress = document.createElement('div');
    progress.id = 'progress';
    progress.style.width = '100%';
    progress.style.height = '100%';
    progress.style.background = 'linear-gradient(to right, #00ffff, #ff00ff)';
    progress.style.transition = 'width 0.1s linear';

    progressBar.appendChild(progress);
    gameArea.appendChild(progressBar);
}

// Progress barni yangilash
function updateProgressBar() {
    const progress = document.getElementById('progress');
    if (progress) {
        const percentage = (timeLeft / 60) * 100;
        progress.style.width = `${percentage}%`;
    }
}

// O'yin tugashida final effekt
function finalEffect() {
    const finalFlash = document.createElement('div');
    finalFlash.style.position = 'absolute';
    finalFlash.style.top = '0';
    finalFlash.style.left = '0';
    finalFlash.style.width = '100%';
    finalFlash.style.height = '100%';
    finalFlash.style.background = 'rgba(255, 255, 255, 0.5)';
    finalFlash.style.opacity = '0';
    finalFlash.style.transition = 'opacity 0.5s';
    gameArea.appendChild(finalFlash);

    setTimeout(() => {
        finalFlash.style.opacity = '1';
    }, 10);
    setTimeout(() => {
        finalFlash.style.opacity = '0';
        setTimeout(() => finalFlash.remove(), 500);
    }, 300);
}

// Yangilangan endGameWithStats bilan final effekt
function endGameWithFinalEffect() {
    endGameWithStats();
    finalEffect();
}

// O'yin loopiga progress bar va combo qo'shish
function finalGameLoop() {
    enhancedGameLoop();
    updateProgressBar();
}

// Yangilangan startGame bilan barcha funksiyalar
function finalStartGame() {
    enhancedStartGame();
    addProgressBar();
    gameInterval = setInterval(finalGameLoop, 1000 / 60);
}

// Event listenerlarni yangilash
startButton.removeEventListener('click', enhancedStartGame);
startButton.addEventListener('click', finalStartGame);
document.removeEventListener('click', checkHit);
document.addEventListener('click', (e) => {
    if (gameActive) {
        shootSound.play();
        checkHitWithCombo(e);
    }
});

// O'yin boshlanganda xush kelibsiz xabari
function showWelcomeMessage() {
    const welcomeMsg = document.createElement('div');
    welcomeMsg.innerHTML = 'Xush Kelibsiz!';
    welcomeMsg.style.position = 'absolute';
    welcomeMsg.style.top = '20%';
    welcomeMsg.style.left = '50%';
    welcomeMsg.style.transform = 'translateX(-50%)';
    welcomeMsg.style.color = '#ffffff';
    welcomeMsg.style.fontSize = '36px';
    welcomeMsg.style.textShadow = '0 0 10px #ffffff';
    gameArea.appendChild(welcomeMsg);

    setTimeout(() => welcomeMsg.remove(), 2000);
}

finalStartGame = () => {
    enhancedStartGame();
    addProgressBar();
    showWelcomeMessage();
    gameInterval = setInterval(finalGameLoop, 1000 / 60);
};

startButton.removeEventListener('click', finalStartGame);
startButton.addEventListener('click', finalStartGame);