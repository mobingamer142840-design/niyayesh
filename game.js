document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("tekkenCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let isPlaying = false;
    let gameLoopId;

    canvas.width = 800;
    canvas.height = 350;

    const player = { x: 80, y: 200, width: 35, height: 95, speed: 7, color: '#ff1a40', attacking: false, attackTimer: 0, health: 100 };
    const niyayesh = { x: 720, y: 200, width: 30, height: 90, color: '#ffb6c1' };
    let enemies = [];
    let bloodParticles = []; 
    let dashParticles = [];
    let score = 0;
    const targetScore = 15;
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
        btnLeft.addEventListener('mousedown', ()=> keys.ArrowLeft = true);
        btnLeft.addEventListener('mouseup', ()=> keys.ArrowLeft = false);
        btnLeft.addEventListener('touchstart', (e)=>{ e.preventDefault(); keys.ArrowLeft = true; });
        btnLeft.addEventListener('touchend', (e)=>{ e.preventDefault(); keys.ArrowLeft = false; });
    }
    if(btnRight) {
        btnRight.addEventListener('mousedown', ()=> keys.ArrowRight = true);
        btnRight.addEventListener('mouseup', ()=> keys.ArrowRight = false);
        btnRight.addEventListener('touchstart', (e)=>{ e.preventDefault(); keys.ArrowRight = true; });
        btnRight.addEventListener('touchend', (e)=>{ e.preventDefault(); keys.ArrowRight = false; });
    }
    if(btnAttack) {
        btnAttack.addEventListener('mousedown', triggerArcadeAttack);
        btnAttack.addEventListener('touchstart', (e)=>{ e.preventDefault(); triggerArcadeAttack(); });
    }

    function createBloodSplatter(x, y) {
        for(let i=0; i<20; i++) {
            bloodParticles.push({
                x: x + 15, y: y + 30,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 1) * 10,
                life: 1.0,
                size: Math.random() * 5 + 2
            });
        }
    }

    function triggerArcadeAttack() {
        if(!isPlaying || gameWon || player.attacking) return;
        player.attacking = true;
        player.attackTimer = 15; 
        
        const hitZone = { x: player.x + player.width, y: player.y - 20, width: 85, height: player.height + 40 };
        
        for(let i = enemies.length - 1; i >= 0; i--) {
            let e = enemies[i];
            if(hitZone.x < e.x + e.width && hitZone.x + hitZone.width > e.x &&
               hitZone.y < e.y + e.height && hitZone.y + hitZone.height > e.y) {
                
                createBloodSplatter(e.x, e.y); 
                enemies.splice(i, 1);
                score++;
                
                const scoreDisp = document.getElementById('score-display');
                if(scoreDisp) scoreDisp.innerText = `دشمنان نابود شده: ${score} / ${targetScore}`;
                
                let currentEnemyHealth = Math.max(0, 100 - (score * (100/targetScore)));
                const p2Health = document.getElementById('p2-health');
                if(p2Health) p2Health.style.width = currentEnemyHealth + '%';

                if(score >= targetScore) {
                    gameWon = true;
                    enemies = [];
                    if(scoreDisp) scoreDisp.innerText = "مسیر امن شد! به آغوش نیایش برو...";
                }
            }
        }
    }

    function spawnArcadeEnemies() {
        if(!isPlaying || gameWon) return;
        enemies.push({ x: 850, y: 200, width: 35, height: 95, speed: 2.5 + Math.random() * 3 });
        setTimeout(spawnArcadeEnemies, Math.random() * 1000 + 500);
    }

    function updateArcadePhysics() {
        if(!isPlaying) return;

        if(!gameWon) {
            if(keys.ArrowLeft && player.x > 0) { player.x -= player.speed; dashParticles.push({x: player.x+player.width, y: player.y+80, life: 1}); }
            if(keys.ArrowRight && player.x < 650) { player.x += player.speed; dashParticles.push({x: player.x, y: player.y+80, life: 1}); }

            enemies.forEach(e => {
                e.x -= e.speed;
                if(e.x < player.x + player.width && e.x + e.width > player.x) {
                    player.x = Math.max(0, player.x - 40);
                    e.x += 40;
                    player.health = Math.max(0, player.health - 10);
                    const p1Health = document.getElementById('p1-health');
                    if(p1Health) p1Health.style.width = player.health + '%';
                    
                    document.getElementById('arcade-screen').style.filter = "saturate(300%) contrast(1.5) hue-rotate(-20deg)";
                    setTimeout(()=> { document.getElementById('arcade-screen').style.filter = "none"; }, 150);
                }
            });
        } else {
            if(player.x < niyayesh.x - player.width + 10) {
                player.x += 3;
            } else {
                isPlaying = false;
                clearInterval(timerInterval);
                const gameOverlay = document.getElementById('game-overlay');
                if(gameOverlay) {
                    gameOverlay.style.display = "flex";
                    gameOverlay.innerHTML = `
                        <div style="font-size: 4rem; filter: drop-shadow(0 0 20px #ff1a40);">👩‍❤️‍💋‍👨</div>
                        <div class="game-title" style="margin-top:15px;">تا ابد در آغوش هم...</div>
                        <div style="color:#ddd; margin-bottom:20px;">مبین موانع رو نابود کرد و به نیایش رسید! ❤️🩸</div>
                        <button class="login-btn game-start-btn" onclick="startArcadeGame()">نبرد مجدد</button>
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
            p.x += p.vx; p.y += p.vy; p.vy += 0.6; p.life -= 0.04;
            if(p.life <= 0) bloodParticles.splice(i, 1);
        }
        for(let i = dashParticles.length - 1; i >= 0; i--) {
            let d = dashParticles[i];
            d.life -= 0.1;
            if(d.life <= 0) dashParticles.splice(i, 1);
        }
    }

    function drawCharacter(charObj, type) {
        ctx.save();
        if (type === 'player') {
            ctx.shadowColor = '#ff1a40'; ctx.shadowBlur = 20; ctx.fillStyle = '#ff1a40';
            ctx.fillRect(charObj.x, charObj.y + 15, charObj.width, charObj.height - 15);
            ctx.fillStyle = '#ffccd5'; ctx.fillRect(charObj.x + 5, charObj.y, charObj.width - 10, 20);
            
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.lineCap = "round";
            ctx.beginPath();
            if (charObj.attacking) {
                ctx.moveTo(charObj.x + charObj.width, charObj.y + 35);
                ctx.lineTo(charObj.x + charObj.width + 65, charObj.y + 5);
            } else {
                ctx.moveTo(charObj.x, charObj.y + 35);
                ctx.lineTo(charObj.x - 10, charObj.y + 15);
            }
            ctx.stroke();

        } else if (type === 'niyayesh') {
            ctx.shadowColor = '#ffb6c1'; ctx.shadowBlur = 25; ctx.fillStyle = '#ffb6c1';
            ctx.fillRect(charObj.x, charObj.y + 15, charObj.width, charObj.height - 15);
            ctx.fillStyle = '#ffe5ec'; ctx.fillRect(charObj.x + 5, charObj.y, charObj.width - 10, 20);
            ctx.fillStyle = '#111'; ctx.fillRect(charObj.x + 3, charObj.y, 8, 45); // موها

        } else if (type === 'enemy') {
            ctx.shadowColor = '#8b0000'; ctx.shadowBlur = 15; ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(charObj.x, charObj.y + 15, charObj.width, charObj.height - 15);
            ctx.fillStyle = '#333'; ctx.fillRect(charObj.x + 5, charObj.y, charObj.width - 10, 20);
            ctx.fillStyle = '#ff1a40'; ctx.beginPath(); ctx.arc(charObj.x + 10, charObj.y + 10, 3, 0, Math.PI*2); ctx.fill(); // چشم قرمز
        }
        ctx.restore();
    }

    function drawArcadeFrame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGrad.addColorStop(0, '#050001'); bgGrad.addColorStop(1, '#110003');
        ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, canvas.width, canvas.height);

        // زمین بازی
        ctx.fillStyle = "#0a0002"; ctx.fillRect(0, 290, canvas.width, 60);
        ctx.fillStyle = "rgba(255, 26, 64, 0.5)"; ctx.fillRect(0, 290, canvas.width, 3); 

        if(score >= targetScore || gameWon) drawCharacter(niyayesh, 'niyayesh');
        drawCharacter(player, 'player');

        // افکت شمشیر زدن (Swoosh)
        if(player.attacking) {
            ctx.save();
            ctx.shadowColor = "#ff1a40"; ctx.shadowBlur = 30;
            ctx.fillStyle = "rgba(255, 26, 64, 0.6)";
            ctx.beginPath();
            ctx.arc(player.x + player.width + 10, player.y + 40, 55, -Math.PI/2, Math.PI/4);
            ctx.lineTo(player.x + player.width, player.y + 40);
            ctx.fill();
            ctx.restore();
        }

        enemies.forEach(e => drawCharacter(e, 'enemy'));

        dashParticles.forEach(d => {
            ctx.fillStyle = `rgba(255, 255, 255, ${d.life * 0.5})`;
            ctx.fillRect(d.x, d.y, 10, 3);
        });

        bloodParticles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = '#ff1a40';
            ctx.shadowColor = '#ff1a40';
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
        dashParticles = [];
        gameWon = false;
        isPlaying = true;
        gameTimer = 99;
        
        const p1Health = document.getElementById('p1-health');
        const p2Health = document.getElementById('p2-health');
        const timerUi = document.getElementById('arcade-timer-ui');
        const scoreDisp = document.getElementById('score-display');
        
        if(p1Health) p1Health.style.width = '100%';
        if(p2Health) p2Health.style.width = '100%';
        if(scoreDisp) scoreDisp.innerText = `دشمنان نابود شده: 0 / ${targetScore}`;
        
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if(gameTimer > 0 && isPlaying) {
                gameTimer--;
                if(timerUi) timerUi.innerText = gameTimer;
            } else if (gameTimer <= 0) {
                isPlaying = false; // Time out
            }
        }, 1000);

        spawnArcadeEnemies();
        loopArcade();
    }
});
