document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("tekkenCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let isPlaying = false;
    let gameLoopId;

    canvas.width = 900;
    canvas.height = 420;

    const player = { x: 80, y: 250, width: 35, height: 100, speed: 7, color: '#ff0033', attacking: false, attackTimer: 0, health: 100 };
    const niyayesh = { x: 800, y: 250, width: 35, height: 100, color: '#ffb6c1' };
    let enemies = [];
    let bloodParticles = []; 
    let score = 0;
    const targetScore = 20; // طولانی‌تر و حماسی‌تر شد
    let gameWon = false;
    let gameTimer = 99;
    let timerInterval;

    let keys = { ArrowLeft: false, ArrowRight: false, Space: false };

    window.addEventListener('keydown', e => {
        if(e.code === 'ArrowLeft') keys.ArrowLeft = true;
        if(e.code === 'ArrowRight') keys.ArrowRight = true;
        if(e.code === 'Space') { keys.Space = true; triggerArcadeAttack(); }
    });
    window.addEventListener('keyup', e => {
        if(e.code === 'ArrowLeft') keys.ArrowLeft = false;
        if(e.code === 'ArrowRight') keys.ArrowRight = false;
        if(e.code === 'Space') keys.Space = false;
    });

    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnAttack = document.getElementById('btn-attack');

    if(btnLeft) {
        btnLeft.addEventListener('touchstart', (e)=>{ e.preventDefault(); keys.ArrowLeft = true; });
        btnLeft.addEventListener('touchend', (e)=>{ e.preventDefault(); keys.ArrowLeft = false; });
    }
    if(btnRight) {
        btnRight.addEventListener('touchstart', (e)=>{ e.preventDefault(); keys.ArrowRight = true; });
        btnRight.addEventListener('touchend', (e)=>{ e.preventDefault(); keys.ArrowRight = false; });
    }
    if(btnAttack) {
        btnAttack.addEventListener('touchstart', (e)=>{ e.preventDefault(); triggerArcadeAttack(); });
    }

    // افکت خونین شدن شمشیر نئونی
    function createBloodSplatter(x, y) {
        for(let i=0; i<20; i++) {
            bloodParticles.push({
                x: x, y: y + 30,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 1) * 12,
                life: 1.0,
                size: Math.random() * 5 + 2
            });
        }
    }

    // افکت فلش زدن صفحه بازی موقع ضربه خوردن به جای لرزش کل سایت
    function screenFlash() {
        const screen = document.getElementById('arcade-screen');
        if(!screen) return;
        screen.style.boxShadow = "inset 0 0 100px rgba(255, 0, 51, 0.8)";
        setTimeout(() => { screen.style.boxShadow = "none"; }, 150);
    }

    function triggerArcadeAttack() {
        if(!isPlaying || gameWon || player.attacking) return;
        player.attacking = true;
        player.attackTimer = 14; 
        
        const hitZone = { x: player.x + player.width, y: player.y - 20, width: 90, height: player.height + 40 };
        
        for(let i = enemies.length - 1; i >= 0; i--) {
            let e = enemies[i];
            if(hitZone.x < e.x + e.width && hitZone.x + hitZone.width > e.x &&
               hitZone.y < e.y + e.height && hitZone.y + hitZone.height > e.y) {
                
                createBloodSplatter(e.x, e.y); 
                enemies.splice(i, 1);
                score++;
                
                const scoreDisp = document.getElementById('score-display');
                if(scoreDisp) {
                    scoreDisp.innerHTML = `<span style="color:#ff0033; font-weight:bold; font-size:1.5rem;">COMBO ${score}!</span> شیاطین نابود شده: ${score} / ${targetScore}`;
                }
                
                let currentEnemyHealth = Math.max(0, 100 - (score * 5));
                const p2Health = document.getElementById('p2-health');
                if(p2Health) p2Health.style.width = currentEnemyHealth + '%';

                if(score >= targetScore) {
                    gameWon = true;
                    enemies = [];
                    if(scoreDisp) scoreDisp.innerText = "مسیر تاریکی شکسته شد! به آغوش ملکه برو...";
                }
            }
        }
    }

    function spawnArcadeEnemies() {
        if(!isPlaying || gameWon) return;
        enemies.push({ x: 950, y: 250, width: 35, height: 100, speed: 3 + Math.random() * 3.5 });
        setTimeout(spawnArcadeEnemies, Math.random() * 1000 + 500);
    }

    function updateArcadePhysics() {
        if(!isPlaying) return;

        if(!gameWon) {
            if(keys.ArrowLeft && player.x > 0) player.x -= player.speed;
            if(keys.ArrowRight && player.x < 700) player.x += player.speed;

            enemies.forEach(e => {
                e.x -= e.speed;
                if(e.x < player.x + player.width && e.x + e.width > player.x) {
                    player.x = Math.max(0, player.x - 40);
                    e.x += 40;
                    player.health = Math.max(0, player.health - 8);
                    const p1Health = document.getElementById('p1-health');
                    if(p1Health) p1Health.style.width = player.health + '%';
                    screenFlash(); 
                }
            });
        } else {
            if(player.x < niyayesh.x - player.width + 10) {
                player.x += 4;
            } else {
                isPlaying = false;
                clearInterval(timerInterval);
                const gameOverlay = document.getElementById('game-overlay');
                if(gameOverlay) {
                    gameOverlay.style.display = "flex";
                    gameOverlay.innerHTML = `
                        <div style="font-size: 6rem; filter: drop-shadow(0 0 30px #ff0033);">🖤🫂</div>
                        <div class="arcade-neon-title" style="font-size:2.5rem; margin-top:20px;">ETERNAL EMBRACE</div>
                        <div style="color:#fff; font-family:'Vazirmatn'; font-weight:bold; font-size:1.2rem; margin-bottom:25px; text-align:center;">مبین با شمشیر تاریکی موانع را شکافت و نیایش را نجات داد! 🩸</div>
                        <button class="arcade-start-btn" onclick="startArcadeGame()">نبرد مجدد</button>
                    `;
                }
            }
        }

        if(player.attacking) {
            player.attackTimer--;
            if(player.attackTimer <= 0) player.attacking = false;
        }

        for(let i = bloodParticles.length - 1; i >= 0; i--) {
            let p = bloodParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.6; 
            p.life -= 0.02;
            if(p.life <= 0) bloodParticles.splice(i, 1);
        }
    }

    function drawCharacter(charObj, type) {
        ctx.save();
        if (type === 'player') {
            ctx.shadowColor = '#ff0033'; ctx.shadowBlur = 20; ctx.fillStyle = '#8b0000';
            ctx.fillRect(charObj.x, charObj.y + 20, charObj.width, charObj.height - 20);
            ctx.fillStyle = '#ff0033'; ctx.fillRect(charObj.x + 5, charObj.y, charObj.width - 10, 20);
            
            // شمشیر
            ctx.shadowColor = '#ff0033'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 5;
            ctx.beginPath();
            if (charObj.attacking) {
                ctx.moveTo(charObj.x + charObj.width, charObj.y + 50);
                ctx.lineTo(charObj.x + charObj.width + 70, charObj.y + 10);
            } else {
                ctx.moveTo(charObj.x, charObj.y + 40);
                ctx.lineTo(charObj.x - 20, charObj.y + 10);
            }
            ctx.stroke();

        } else if (type === 'niyayesh') {
            ctx.shadowColor = '#fff'; ctx.shadowBlur = 25; ctx.fillStyle = '#fff';
            ctx.fillRect(charObj.x, charObj.y + 20, charObj.width, charObj.height - 20);
            ctx.fillStyle = '#ddd'; ctx.fillRect(charObj.x + 5, charObj.y, charObj.width - 10, 20);
            ctx.fillStyle = '#ff0033'; ctx.fillRect(charObj.x + 3, charObj.y, 6, 40);

        } else if (type === 'enemy') {
            ctx.shadowColor = '#111'; ctx.shadowBlur = 10; ctx.fillStyle = '#222';
            ctx.fillRect(charObj.x, charObj.y + 20, charObj.width, charObj.height - 20);
            ctx.fillStyle = '#444'; ctx.fillRect(charObj.x + 4, charObj.y, charObj.width - 8, 20);
            ctx.fillStyle = '#ff0033'; ctx.fillRect(charObj.x + 8, charObj.y + 8, 5, 5); // چشم قرمز
        }
        ctx.restore();
    }

    function drawArcadeFrame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGrad.addColorStop(0, '#050001'); bgGrad.addColorStop(1, '#000000');
        ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, canvas.width, canvas.height);

        // زمین بازی
        ctx.fillStyle = "#0a0002"; ctx.fillRect(0, 350, canvas.width, 70);
        ctx.fillStyle = "#ff0033"; ctx.fillRect(0, 350, canvas.width, 3); 

        if(score >= targetScore || gameWon) drawCharacter(niyayesh, 'niyayesh');
        drawCharacter(player, 'player');

        // افکت موج شمشیر
        if(player.attacking) {
            ctx.save();
            ctx.shadowColor = "#ff0033"; ctx.shadowBlur = 30;
            ctx.fillStyle = "rgba(255, 0, 51, 0.5)";
            ctx.beginPath();
            ctx.arc(player.x + player.width + 20, player.y + 50, 60, -Math.PI/2, Math.PI/2.5);
            ctx.fill();
            ctx.restore();
        }

        enemies.forEach(e => drawCharacter(e, 'enemy'));

        // رسم پارتیکل‌های خون
        bloodParticles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = '#ff0033';
            ctx.shadowColor = '#ff0033';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            ctx.fill();
            ctx.restore();
        });
    }

    function loopArcade() {
        updateArcadePhysics();
        drawArcadeFrame();
        if(isPlaying || gameWon) {
            gameLoopId = requestAnimationFrame(loopArcade);
        }
    }

    window.startArcadeGame = function() {
        const gameOverlay = document.getElementById('game-overlay');
        if(gameOverlay) gameOverlay.style.display = "none";
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
        
        if(p1Health) p1Health.style.width = '100%';
        if(p2Health) p2Health.style.width = '100%';
        if(scoreDisp) scoreDisp.innerText = `با شمشیر نئونی تاریکی را بشکاف و به نیایش برس!`;
        
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if(gameTimer > 0 && isPlaying) {
                gameTimer--;
                if(timerUi) timerUi.innerText = gameTimer;
            }
        }, 1000);

        spawnArcadeEnemies();
        loopArcade();
    }
});
