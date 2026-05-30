document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("tekkenCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let isPlaying = false;
    let gameLoopId;

    // ابعاد بوم بازی
    canvas.width = 800;
    canvas.height = 380;

    // کوچک‌تر کردن کاراکترها (عرض ۳۰ و ارتفاع ۹۰) برای ظرافت بیشتر و قرارگیری روی زمین (y: 230)
    const player = { x: 80, y: 230, width: 30, height: 90, speed: 6, color: '#ff1a40', attacking: false, attackTimer: 0, health: 100 };
    const niyayesh = { x: 720, y: 230, width: 30, height: 90, color: '#ffb6c1' };
    let enemies = [];
    let score = 0;
    const targetScore = 15;
    let gameWon = false;
    let gameTimer = 99;
    let timerInterval;

    let keys = { ArrowLeft: false, ArrowRight: false, Space: false };

    // هندلرهای کیبورد
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

    // هندلرهای تاچ موبایل
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

    function triggerArcadeAttack() {
        if(!isPlaying || gameWon || player.attacking) return;
        player.attacking = true;
        player.attackTimer = 10; 
        
        // محدوده اثر ضربه شمشیر مایل به جلو
        const hitZone = { x: player.x + player.width, y: player.y, width: 60, height: player.height };
        for(let i = enemies.length - 1; i >= 0; i--) {
            let e = enemies[i];
            if(hitZone.x < e.x + e.width && hitZone.x + hitZone.width > e.x &&
               hitZone.y < e.y + e.height && hitZone.y + hitZone.height > e.y) {
                enemies.splice(i, 1);
                score++;
                
                const scoreDisp = document.getElementById('score-display');
                if(scoreDisp) scoreDisp.innerText = `دشمنان نابود شده: ${score} / ${targetScore}`;
                
                let currentEnemyHealth = Math.max(0, 100 - (score * 6.7));
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
        // دشمنان هم اندازه ظریف و کوچک دارند
        enemies.push({ x: 850, y: 230, width: 30, height: 90, speed: 2.2 + Math.random() * 2 });
        setTimeout(spawnArcadeEnemies, Math.random() * 1300 + 700);
    }

    function updateArcadePhysics() {
        if(!isPlaying) return;

        if(!gameWon) {
            if(keys.ArrowLeft && player.x > 0) player.x -= player.speed;
            if(keys.ArrowRight && player.x < 650) player.x += player.speed;

            enemies.forEach(e => {
                e.x -= e.speed;
                // تشخیص برخورد فیزیکی فایترها
                if(e.x < player.x + player.width && e.x + e.width > player.x) {
                    player.x = Math.max(0, player.x - 20);
                    e.x += 20;
                    player.health = Math.max(0, player.health - 5);
                    const p1Health = document.getElementById('p1-health');
                    if(p1Health) p1Health.style.width = player.health + '%';
                }
            });
        } else {
            // انیمیشن دویدن خودکار به سمت نیایش بعد برد
            if(player.x < niyayesh.x - player.width + 5) {
                player.x += 3.5;
            } else {
                isPlaying = false;
                clearInterval(timerInterval);
                const gameOverlay = document.getElementById('game-overlay');
                if(gameOverlay) {
                    gameOverlay.style.display = "flex";
                    gameOverlay.innerHTML = `
                        <div style="font-size: 5.5rem; filter: drop-shadow(0 0 20px #ff1a40);">👩‍❤️‍💋‍👨</div>
                        <div class="section-title" style="margin-top:20px; font-size:2rem; text-shadow: 0 0 10px #ff1a40;">تا ابد در آغوش هم...</div>
                        <div style="color:#fff; font-weight:bold; font-size:1.1rem; margin-bottom:15px; text-align:center; padding:0 15px;">مبین با موفقیت تمام موانع رو نابود کرد و به نیایش رسید! ❤️🩸</div>
                        <button class="login-btn" onclick="startArcadeGame()" style="width:auto; padding:10px 30px;">نبرد مجدد</button>
                    `;
                }
            }
        }

        if(player.attacking) {
            player.attackTimer--;
            if(player.attackTimer <= 0) player.attacking = false;
        }
    }

    // طراحی و افکت‌های گرافیکی پیشرفته کاراکترها روی کانواس
    function drawCharacter(charObj, type) {
        ctx.save();
        
        if (type === 'player') {
            // افکت سایه درخشان نئون قرمز برای مبین
            ctx.shadowColor = '#ff1a40';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#ff1a40';
            // بدن اصلی (کت و شلوار گوتیک مدرن)
            ctx.fillRect(charObj.x, charObj.y + 20, charObj.width, charObj.height - 20);
            // سر
            ctx.fillStyle = '#ffccd5';
            ctx.fillRect(charObj.x + 5, charObj.y, charObj.width - 10, 20);
            
            // افکت شمشیر نئونی متصل به کاراکتر در حالت عادی یا حمله
            ctx.shadowColor = '#ff1a40';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            if (charObj.attacking) {
                // شمشیر کشیده شده رو به جلو برای ضربه زدن
                ctx.moveTo(charObj.x + charObj.width, charObj.y + 45);
                ctx.lineTo(charObj.x + charObj.width + 45, charObj.y + 20);
            } else {
                // شمشیر غلاف شده پشت کمر
                ctx.moveTo(charObj.x, charObj.y + 35);
                ctx.lineTo(charObj.x - 15, charObj.y + 5);
            }
            ctx.stroke();

        } else if (type === 'niyayesh') {
            // افکت هاله صورتی ملایم برای نیایش
            ctx.shadowColor = '#ffb6c1';
            ctx.shadowBlur = 18;
            ctx.fillStyle = '#ffb6c1';
            // لباس بلند حریر
            ctx.fillRect(charObj.x, charObj.y + 20, charObj.width, charObj.height - 20);
            // سر کاراکتر نیایش
            ctx.fillStyle = '#ffe5ec';
            ctx.fillRect(charObj.x + 5, charObj.y, charObj.width - 10, 20);
            // موهای بلند مشکی فانتزی
            ctx.fillStyle = '#111';
            ctx.fillRect(charObj.x + 3, charObj.y, 6, 40);

        } else if (type === 'enemy') {
            // دشمنان حالت سایه‌های تاریک با چشم‌های قرمز درخشان
            ctx.shadowColor = '#8b0000';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#1c1c1c';
            ctx.fillRect(charObj.x, charObj.y + 20, charObj.width, charObj.height - 20);
            ctx.fillStyle = '#2d2d2d';
            ctx.fillRect(charObj.x + 4, charObj.y, charObj.width - 8, 20);
            // چشمان درخشان قرمز ومپایری دشمن
            ctx.fillStyle = '#ff1a40';
            ctx.fillRect(charObj.x + 6, charObj.y + 6, 4, 4);
        }
        
        ctx.restore();
    }

    function drawArcadeFrame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // بک‌گراند دارک اتمسفریک آرکید
        let bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGrad.addColorStop(0, '#0d0102');
        bgGrad.addColorStop(1, '#000000');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // خط افق و زمین بازی (باند فایت کلوپی)
        ctx.fillStyle = "#150305";
        ctx.fillRect(0, 320, canvas.width, 60);
        ctx.fillStyle = "#ff1a40";
        ctx.fillRect(0, 320, canvas.width, 2); // نوار جداکننده نئونی قرمز زمین

        // رندر کردن نیایش (فقط موقع برد یا نزدیک شدن به پایان)
        if(score >= targetScore || gameWon) {
            drawCharacter(niyayesh, 'niyayesh');
        }

        // رندر کردن پلیر (مبین)
        drawCharacter(player, 'player');

        // افکت موج ضربه شمشیر هنگام اتک
        if(player.attacking) {
            ctx.save();
            ctx.shadowColor = "#ff1a40";
            ctx.shadowBlur = 20;
            ctx.fillStyle = "rgba(255, 26, 64, 0.35)";
            ctx.beginPath();
            ctx.arc(player.x + player.width + 15, player.y + 40, 35, -Math.PI/3, Math.PI/3);
            ctx.fill();
            ctx.restore();
        }

        // رندر کردن تک‌تک دشمنان
        enemies.forEach(e => {
            drawCharacter(e, 'enemy');
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
            }
        }, 1000);

        spawnArcadeEnemies();
        loopArcade();
    }
});
