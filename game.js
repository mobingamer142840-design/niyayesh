document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("tekkenCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let isPlaying = false;
    let gameLoopId = null;

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
    let gameTimer = 99;
    let timerInterval = null;

    let keys = { ArrowLeft: false, ArrowRight: false, Space: false };

    function resizeCanvas() {
        const container = document.getElementById("arcade-screen");
        if (!container) return;

        const w = container.clientWidth || 800;
        const h = Math.max(260, Math.min(380, Math.round(w * 0.475)));

        canvas.width = w;
        canvas.height = h;

        player.y = canvas.height - 150;
        niyayesh.y = canvas.height - 150;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    window.addEventListener('keydown', e => {
        if (e.code === 'ArrowLeft') keys.ArrowLeft = true;
        if (e.code === 'ArrowRight') keys.ArrowRight = true;
        if (e.code === 'Space') {
            keys.Space = true;
            triggerArcadeAttack();
            e.preventDefault();
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
        btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); keys.ArrowLeft = true; }, { passive: false });
        btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); keys.ArrowLeft = false; }, { passive: false });
        btnLeft.addEventListener('mousedown', () => { keys.ArrowLeft = true; });
        btnLeft.addEventListener('mouseup', () => { keys.ArrowLeft = false; });
        btnLeft.addEventListener('mouseleave', () => { keys.ArrowLeft = false; });
    }

    if (btnRight) {
        btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); keys.ArrowRight = true; }, { passive: false });
        btnRight.addEventListener('touchend', (e) => { e.preventDefault(); keys.ArrowRight = false; }, { passive: false });
        btnRight.addEventListener('mousedown', () => { keys.ArrowRight = true; });
        btnRight.addEventListener('mouseup', () => { keys.ArrowRight = false; });
        btnRight.addEventListener('mouseleave', () => { keys.ArrowRight = false; });
    }

    if (btnAttack) {
        btnAttack.addEventListener('touchstart', (e) => { e.preventDefault(); triggerArcadeAttack(); }, { passive: false });
        btnAttack.addEventListener('mousedown', () => { triggerArcadeAttack(); });
    }

    function createBloodSplatter(x, y) {
        for (let i = 0; i < 15; i++) {
            bloodParticles.push({
                x: x,
                y: y + 20,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 1) * 8,
                life: 1.0,
                size: Math.random() * 4 + 2
            });
        }
    }

    function updateScoreboard() {
        const scoreDisp = document.getElementById('score-display');
        if (scoreDisp) scoreDisp.innerText = `دشمنان نابود شده: ${score} / ${targetScore}`;

        const p2Health = document.getElementById('p2-health');
        if (p2Health) {
            const currentEnemyHealth = Math.max(0, 100 - (score * 6.7));
            p2Health.style.width = currentEnemyHealth + '%';
        }
    }

    function triggerArcadeAttack() {
        if (!isPlaying || gameWon || player.attacking) return;

        player.attacking = true;
        player.attackTimer = 12;

        const hitZone = {
            x: player.x + player.width,
            y: player.y,
            width: 70,
            height: player.height
        };

        for (let i = enemies.length - 1; i >= 0; i--) {
            let e = enemies[i];
            if (
                hitZone.x < e.x + e.width &&
                hitZone.x + hitZone.width > e.x &&
                hitZone.y < e.y + e.height &&
                hitZone.y + hitZone.height > e.y
            ) {
                createBloodSplatter(e.x, e.y);
                enemies.splice(i, 1);
                score++;
                updateScoreboard();

                if (score >= targetScore) {
                    gameWon = true;
                    enemies = [];
                    const scoreDisp = document.getElementById('score-display');
                    if (scoreDisp) scoreDisp.innerText = "مسیر امن شد! به آغوش نیایش برو...";
                }
            }
        }
    }

    function spawnArcadeEnemies() {
        if (!isPlaying || gameWon) return;

        const spawnY = canvas.height - 150;
        enemies.push({
            x: canvas.width + 40,
            y: spawnY,
            width: 30,
            height: 90,
            speed: 2.2 + Math.random() * 2.5
        });

        setTimeout(spawnArcadeEnemies, Math.random() * 1200 + 600);
    }

    function updateArcadePhysics() {
        if (!isPlaying) return;

        if (!gameWon) {
            if (keys.ArrowLeft && player.x > 0) player.x -= player.speed;
            if (keys.ArrowRight && player.x < canvas.width - player.width) player.x += player.speed;

            enemies.forEach(e => {
                e.x -= e.speed;

                if (
                    e.x < player.x + player.width &&
                    e.x + e.width > player.x &&
                    e.y < player.y + player.height &&
                    e.y + e.height > player.y
                ) {
                    player.x = Math.max(0, player.x - 24);
                    e.x += 20;
                    player.health = Math.max(0, player.health - 5);

                    const p1Health = document.getElementById('p1-health');
                    if (p1Health) p1Health.style.width = player.health + '%';
                }
            });

            enemies = enemies.filter(e => e.x + e.width > -50);
        } else {
            if (player.x < niyayesh.x - player.width + 5) {
                player.x += 3.5;
            } else {
                isPlaying = false;
                clearInterval(timerInterval);
                timerInterval = null;

                const gameOverlay = document.getElementById('game-overlay');
                if (gameOverlay) {
                    gameOverlay.style.display = "flex";
                    gameOverlay.innerHTML = `
                        <div style="font-size: 5.5rem; filter: drop-shadow(0 0 20px #ff1a40);">👩‍❤️‍💋‍👨</div>
                        <div class="section-title" style="margin-top:20px; font-size:2rem; text-shadow: 0 0 10px #ff1a40;">
                            تا ابد در آغوش هم...
                        </div>
                        <div style="color:#fff; font-weight:bold; font-size:1.1rem; margin-bottom:15px; text-align:center; padding:0 15px;">
                            مبین با موفقیت تمام موانع رو نابود کرد و به نیایش رسید! ❤️🩸
                        </div>
                        <button class="login-btn" onclick="startArcadeGame()" style="width:auto; padding:10px 30px;">نبرد مجدد</button>
                    `;
                }
            }
        }

        if (player.attacking) {
            player.attackTimer--;
            if (player.attackTimer <= 0) player.attacking = false;
        }

        for (let i = bloodParticles.length - 1; i >= 0; i--) {
            let p = bloodParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.5;
            p.life -= 0.03;
            if (p.life <= 0) bloodParticles.splice(i, 1);
        }
    }

    function drawCharacter(charObj, type) {
        ctx.save();
        if (type === 'player') {
            ctx.shadowColor = '#ff1a40';
            ctx.shadowBlur = 15;
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
            ctx.shadowBlur = 18;
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

        let bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGrad.addColorStop(0, '#0d0102');
        bgGrad.addColorStop(1, '#000000');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#150305";
        ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
        ctx.fillStyle = "#ff1a40";
        ctx.fillRect(0, canvas.height - 60, canvas.width, 2);

        if (score >= targetScore || gameWon) drawCharacter(niyayesh, 'niyayesh');
        drawCharacter(player, 'player');

        if (player.attacking) {
            ctx.save();
            ctx.shadowColor = "#ff1a40";
            ctx.shadowBlur = 25;
            ctx.fillStyle = "rgba(255, 26, 64, 0.4)";
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

        if (isPlaying || gameWon) {
            gameLoopId = requestAnimationFrame(loopArcade);
        } else {
            gameLoopId = null;
        }
    }

    function addTinyCelebration() {
        const screen = document.getElementById('arcade-screen');
        if (!screen) return;

        for (let i = 0; i < 8; i++) {
            const heart = document.createElement('div');
            heart.className = 'mini-heart';
            heart.textContent = ['💕', '💗', '✨', '🫶'][Math.floor(Math.random() * 4)];
            heart.style.left = `${10 + Math.random() * 80}%`;
            heart.style.top = `${15 + Math.random() * 50}%`;
            heart.style.animationDelay = `${Math.random() * 0.6}s`;
            screen.appendChild(heart);
            setTimeout(() => heart.remove(), 2400);
        }
    }

    window.startArcadeGame = function () {
        const gameOverlay = document.getElementById('game-overlay');
        if (gameOverlay) gameOverlay.style.display = "none";

        resizeCanvas();

        player.x = 80;
        player.health = 100;
        score = 0;
        enemies = [];
        bloodParticles = [];
        gameWon = false;
        isPlaying = true;
        gameTimer = 99;

        const p1Health = document.getElementById('p1-health');
        const p2Health = document.getElementById('p2-health');
        const timerUi = document.getElementById('arcade-timer-ui');
        const scoreDisp = document.getElementById('score-display');

        if (p1Health) p1Health.style.width = '100%';
        if (p2Health) p2Health.style.width = '100%';
        if (scoreDisp) scoreDisp.innerText = `دشمنان نابود شده: 0 / ${targetScore}`;
        if (timerUi) timerUi.innerText = "99";

        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (gameTimer > 0 && isPlaying) {
                gameTimer--;
                if (timerUi) timerUi.innerText = gameTimer;
            }
        }, 1000);

        spawnArcadeEnemies();
        if (!gameLoopId) loopArcade();

        addTinyCelebration();
    };

    window.addEventListener('visibilitychange', () => {
        if (document.hidden && timerInterval) {
            clearInterval(timerInterval);
        }
    });
});
