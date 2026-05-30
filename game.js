document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("tekkenCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let isPlaying = false;
    let gameLoopId = null;
    let spawnTimeout = null;

    canvas.width = 800;
    canvas.height = 380;

    const player = {
        x: 80,
        y: 230,
        width: 30,
        height: 90,
        speed: 6,
        color: '#ff1a40',
        attacking: false,
        attackTimer: 0,
        attackCooldown: 0,
        health: 100
    };

    const niyayesh = {
        x: 720,
        y: 230,
        width: 30,
        height: 90,
        color: '#ffb6c1'
    };

    let enemies = [];
    let bloodParticles = [];
    let score = 0;
    const targetScore = 15;
    let gameWon = false;
    let gameOver = false;
    let gameTimer = 99;
    let timerInterval = null;

    let keys = { ArrowLeft: false, ArrowRight: false, Space: false };

    function updateHealthBars() {
        const p1Health = document.getElementById('p1-health');
        const p2Health = document.getElementById('p2-health');
        if (p1Health) p1Health.style.width = `${player.health}%`;
        if (p2Health) {
            const enemyHealth = Math.max(0, 100 - (score * (100 / targetScore)));
            p2Health.style.width = `${enemyHealth}%`;
        }
    }

    function updateScoreText() {
        const scoreDisp = document.getElementById('score-display');
        if (!scoreDisp) return;

        if (gameWon) {
            scoreDisp.innerText = "مسیر امن شد! به آغوش نیایش برو...";
        } else if (gameOver) {
            scoreDisp.innerText = "نیروهایت کم شد... دوباره تلاش کن.";
        } else {
            scoreDisp.innerText = `دشمنان نابود شده: ${score} / ${targetScore}`;
        }
    }

    function stopGameTimers() {
        clearInterval(timerInterval);
        clearTimeout(spawnTimeout);
        timerInterval = null;
        spawnTimeout = null;
    }

    function resetOverlayToStart() {
        const gameOverlay = document.getElementById('game-overlay');
        if (!gameOverlay) return;

        gameOverlay.style.display = "flex";
        gameOverlay.innerHTML = `
            <div class="overlay-kicker">ARCADE MODE / حالت آرکید</div>
            <div class="overlay-title">Vampire Fighting Arena</div>
            <div style="color:#b7b7b7; font-size:0.95rem; margin-bottom: 22px; text-align:center; padding:0 18px;" id="score-display">
                در نقش ومپایر با شمشیر نئونی حریفان را نابود کن!
            </div>
            <button class="login-btn" onclick="startArcadeGame()" style="width:auto; padding:12px 35px; box-shadow: 0 0 15px rgba(255,26,64,0.4);">شروع مبارزه حماسی</button>
        `;
    }

    function showEndOverlay({ icon, title, subtitle, buttonText, buttonAction }) {
        const gameOverlay = document.getElementById('game-overlay');
        if (!gameOverlay) return;

        gameOverlay.style.display = "flex";
        gameOverlay.innerHTML = `
            <div style="font-size: 5rem; margin-bottom: 10px; filter: drop-shadow(0 0 18px #ff1a40);">${icon}</div>
            <div class="overlay-title" style="margin-bottom:10px;">${title}</div>
            <div style="color:#ddd; font-weight:700; font-size:1rem; margin-bottom:18px; text-align:center; padding:0 18px; line-height:1.9;">${subtitle}</div>
            <button class="login-btn" onclick="${buttonAction}" style="width:auto; padding:12px 30px;">${buttonText}</button>
        `;
    }

    function createBloodSplatter(x, y) {
        for (let i = 0; i < 14; i++) {
            bloodParticles.push({
                x: x,
                y: y + 20,
                vx: (Math.random() - 0.5) * 9,
                vy: (Math.random() - 1) * 7,
                life: 1.0,
                size: Math.random() * 3.5 + 1.8
            });
        }
    }

    function screenShake() {
        const screen = document.getElementById('arcade-screen');
        if (!screen) return;

        screen.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;
        screen.style.filter = "saturate(180%) brightness(1.12)";
        setTimeout(() => {
            screen.style.transform = "translate(0, 0)";
            screen.style.filter = "none";
        }, 120);
    }

    function triggerArcadeAttack() {
        if (!isPlaying || gameWon || gameOver || player.attacking || player.attackCooldown > 0) return;

        player.attacking = true;
        player.attackTimer = 12;
        player.attackCooldown = 16;
        screenShake();

        const hitZone = {
            x: player.x + player.width,
            y: player.y,
            width: 72,
            height: player.height
        };

        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            const intersects =
                hitZone.x < e.x + e.width &&
                hitZone.x + hitZone.width > e.x &&
                hitZone.y < e.y + e.height &&
                hitZone.y + hitZone.height > e.y;

            if (intersects) {
                createBloodSplatter(e.x, e.y);
                enemies.splice(i, 1);
                score++;
                updateScoreText();
                updateHealthBars();

                if (score >= targetScore) {
                    gameWon = true;
                    enemies = [];
                    updateScoreText();
                }
            }
        }
    }

    function scheduleEnemySpawn() {
        if (!isPlaying || gameWon || gameOver) return;

        const delay = Math.random() * 1200 + 600;
        spawnTimeout = setTimeout(() => {
            if (!isPlaying || gameWon || gameOver) return;

            enemies.push({
                x: 850,
                y: 230,
                width: 30,
                height: 90,
                speed: 2.1 + Math.random() * 2.6
            });

            scheduleEnemySpawn();
        }, delay);
    }

    function updateArcadePhysics() {
        if (!isPlaying) return;

        if (!gameWon && !gameOver) {
            if (keys.ArrowLeft && player.x > 0) player.x -= player.speed;
            if (keys.ArrowRight && player.x < 650) player.x += player.speed;

            enemies.forEach(e => {
                e.x -= e.speed;

                if (e.x < player.x + player.width && e.x + e.width > player.x) {
                    player.health = Math.max(0, player.health - 5);
                    player.x = Math.max(0, player.x - 20);
                    e.x += 26;
                    screenShake();
                    updateHealthBars();

                    if (player.health <= 0) {
                        gameOver = true;
                        isPlaying = false;
                        stopGameTimers();
                        showEndOverlay({
                            icon: "💔",
                            title: "Defeated / شکست خوردی",
                            subtitle: "نیروهایت تمام شد. دوباره شروع کن و این بار مسیر را پاک‌تر باز کن.",
                            buttonText: "نبرد دوباره",
                            buttonAction: "startArcadeGame()"
                        });
                    }
                }
            });

            enemies = enemies.filter(e => e.x > -60);
        } else if (gameWon) {
            if (player.x < niyayesh.x - player.width + 5) {
                player.x += 3.5;
            } else {
                isPlaying = false;
                stopGameTimers();
                showEndOverlay({
                    icon: "👩‍❤️‍💋‍👨",
                    title: "تا ابد در آغوش هم...",
                    subtitle: "مبین با موفقیت تمام موانع رو نابود کرد و به نیایش رسید! ❤️🩸",
                    buttonText: "نبرد مجدد",
                    buttonAction: "startArcadeGame()"
                });
            }
        }

        if (player.attacking) {
            player.attackTimer--;
            if (player.attackTimer <= 0) player.attacking = false;
        }

        if (player.attackCooldown > 0) {
            player.attackCooldown--;
        }

        for (let i = bloodParticles.length - 1; i >= 0; i--) {
            const p = bloodParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.45;
            p.life -= 0.03;

            if (p.life <= 0) {
                bloodParticles.splice(i, 1);
            }
        }
    }

    function drawCharacter(charObj, type) {
        ctx.save();

        if (type === 'player') {
            ctx.shadowColor = '#ff1a40';
            ctx.shadowBlur = 12;
            ctx.fillStyle = '#ff1a40';
            ctx.fillRect(charObj.x, charObj.y + 20, charObj.width, charObj.height - 20);

            ctx.fillStyle = '#ffccd5';
            ctx.fillRect(charObj.x + 5, charObj.y, charObj.width - 10, 20);

            ctx.shadowColor = '#ff1a40';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 4;
            ctx.beginPath();
            if (charObj.attacking) {
                ctx.moveTo(charObj.x + charObj.width, charObj.y + 40);
                ctx.lineTo(charObj.x + charObj.width + 55, charObj.y + 10);
            } else {
                ctx.moveTo(charObj.x, charObj.y + 35);
                ctx.lineTo(charObj.x - 15, charObj.y + 5);
            }
            ctx.stroke();

        } else if (type === 'niyayesh') {
            ctx.shadowColor = '#ffb6c1';
            ctx.shadowBlur = 16;
            ctx.fillStyle = '#ffb6c1';
            ctx.fillRect(charObj.x, charObj.y + 20, charObj.width, charObj.height - 20);

            ctx.fillStyle = '#ffe5ec';
            ctx.fillRect(charObj.x + 5, charObj.y, charObj.width - 10, 20);

            ctx.fillStyle = '#111';
            ctx.fillRect(charObj.x + 3, charObj.y, 6, 40);

        } else if (type === 'enemy') {
            ctx.shadowColor = '#8b0000';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#1c1c1c';
            ctx.fillRect(charObj.x, charObj.y + 20, charObj.width, charObj.height - 20);

            ctx.fillStyle = '#2d2d2d';
            ctx.fillRect(charObj.x + 4, charObj.y, charObj.width - 8, 20);

            ctx.fillStyle = '#ff1a40';
            ctx.fillRect(charObj.x + 6, charObj.y + 6, 4, 4);
        }

        ctx.restore();
    }

    function drawArcadeFrame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGrad.addColorStop(0, '#0d0102');
        bgGrad.addColorStop(1, '#000000');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#120305";
        ctx.fillRect(0, 320, canvas.width, 60);

        ctx.fillStyle = "#ff1a40";
        ctx.fillRect(0, 320, canvas.width, 2);

        if (score >= targetScore || gameWon) drawCharacter(niyayesh, 'niyayesh');
        drawCharacter(player, 'player');

        if (player.attacking) {
            ctx.save();
            ctx.shadowColor = "#ff1a40";
            ctx.shadowBlur = 20;
            ctx.fillStyle = "rgba(255, 26, 64, 0.34)";
            ctx.beginPath();
            ctx.arc(player.x + player.width + 15, player.y + 40, 45, -Math.PI / 2, Math.PI / 3);
            ctx.fill();
            ctx.restore();
        }

        enemies.forEach(e => drawCharacter(e, 'enemy'));

        bloodParticles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = '#ff1a40';
            ctx.shadowColor = '#ff1a40';
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    function loopArcade() {
        updateArcadePhysics();
        drawArcadeFrame();

        if (isPlaying || gameWon || gameOver) {
            gameLoopId = requestAnimationFrame(loopArcade);
        }
    }

    function startTimers() {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (gameTimer > 0 && isPlaying && !gameWon && !gameOver) {
                gameTimer--;
                const timerUi = document.getElementById('arcade-timer-ui');
                if (timerUi) timerUi.innerText = gameTimer < 10 ? `0${gameTimer}` : `${gameTimer}`;
            }

            if (gameTimer <= 0 && !gameWon && !gameOver) {
                gameOver = true;
                isPlaying = false;
                stopGameTimers();
                showEndOverlay({
                    icon: "⏳",
                    title: "Time Up / زمان تمام شد",
                    subtitle: "زمانت به پایان رسید. دوباره شروع کن و سریع‌تر مسیر را باز کن.",
                    buttonText: "شروع دوباره",
                    buttonAction: "startArcadeGame()"
                });
            }
        }, 1000);
    }

    window.startArcadeGame = function () {
        const gameOverlay = document.getElementById('game-overlay');
        if (gameOverlay) gameOverlay.style.display = "none";

        player.x = 80;
        player.health = 100;
        player.attacking = false;
        player.attackTimer = 0;
        player.attackCooldown = 0;

        score = 0;
        enemies = [];
        bloodParticles = [];
        gameWon = false;
        gameOver = false;
        isPlaying = true;
        gameTimer = 99;

        const timerUi = document.getElementById('arcade-timer-ui');
        const p1Health = document.getElementById('p1-health');
        const p2Health = document.getElementById('p2-health');
        const scoreDisp = document.getElementById('score-display');

        if (timerUi) timerUi.innerText = "99";
        if (p1Health) p1Health.style.width = '100%';
        if (p2Health) p2Health.style.width = '100%';
        if (scoreDisp) scoreDisp.innerText = `دشمنان نابود شده: 0 / ${targetScore}`;

        clearInterval(timerInterval);
        clearTimeout(spawnTimeout);
        startTimers();
        scheduleEnemySpawn();
        loopArcade();
    };

    window.addEventListener('keydown', e => {
        if (e.code === 'ArrowLeft') keys.ArrowLeft = true;
        if (e.code === 'ArrowRight') keys.ArrowRight = true;
        if (e.code === 'Space') {
            e.preventDefault();
            keys.Space = true;
            triggerArcadeAttack();
        }
    });

    window.addEventListener('keyup', e => {
        if (e.code === 'ArrowLeft') keys.ArrowLeft = false;
        if (e.code === 'ArrowRight') keys.ArrowRight = false;
        if (e.code === 'Space') keys.Space = false;
    });

    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnAttack = document.getElementById('btn-attack');

    if (btnLeft) {
        btnLeft.addEventListener('pointerdown', (e) => { e.preventDefault(); keys.ArrowLeft = true; });
        btnLeft.addEventListener('pointerup', (e) => { e.preventDefault(); keys.ArrowLeft = false; });
        btnLeft.addEventListener('pointerleave', () => { keys.ArrowLeft = false; });
        btnLeft.addEventListener('pointercancel', () => { keys.ArrowLeft = false; });
    }

    if (btnRight) {
        btnRight.addEventListener('pointerdown', (e) => { e.preventDefault(); keys.ArrowRight = true; });
        btnRight.addEventListener('pointerup', (e) => { e.preventDefault(); keys.ArrowRight = false; });
        btnRight.addEventListener('pointerleave', () => { keys.ArrowRight = false; });
        btnRight.addEventListener('pointercancel', () => { keys.ArrowRight = false; });
    }

    if (btnAttack) {
        btnAttack.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            triggerArcadeAttack();
        });
    }

    drawArcadeFrame();
    updateScoreText();
    updateHealthBars();
    resetOverlayToStart();
});
