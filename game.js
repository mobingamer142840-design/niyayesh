const canvas = document.getElementById("tekkenCanvas");
const ctx = canvas.getContext("2d");
let isPlaying = false;
let gameLoopId;

// ابعاد استاندارد نمایشگر آرکید
canvas.width = 800;
canvas.height = 380;

// تعریف پلیر (مبین - ومپایر سرخ) و نیایش (هدف رمانتیک)
const player = { x: 60, y: 180, width: 45, height: 140, speed: 6, color: '#ff1a40', attacking: false, attackTimer: 0, health: 100 };
const niyayesh = { x: 700, y: 180, width: 45, height: 140, color: '#ffb6c1' };
let enemies = [];
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

// تاچ پد برای گوشی
document.getElementById('btn-left').addEventListener('touchstart', (e)=>{ e.preventDefault(); keys.ArrowLeft = true; });
document.getElementById('btn-left').addEventListener('touchend', (e)=>{ e.preventDefault(); keys.ArrowLeft = false; });
document.getElementById('btn-right').addEventListener('touchstart', (e)=>{ e.preventDefault(); keys.ArrowRight = true; });
document.getElementById('btn-right').addEventListener('touchend', (e)=>{ e.preventDefault(); keys.ArrowRight = false; });
document.getElementById('btn-attack').addEventListener('touchstart', (e)=>{ e.preventDefault(); triggerArcadeAttack(); });

function triggerArcadeAttack() {
    if(!isPlaying || gameWon || player.attacking) return;
    player.attacking = true;
    player.attackTimer = 12; 
    
    // فیزیک ضربات زنجیره‌ای تکن
    const hitZone = { x: player.x + player.width, y: player.y, width: 65, height: player.height };
    for(let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        if(hitZone.x < e.x + e.width && hitZone.x + hitZone.width > e.x &&
           hitZone.y < e.y + e.height && hitZone.y + hitZone.height > e.y) {
            enemies.splice(i, 1);
            score++;
            document.getElementById('score-display').innerText = `دشمنان نابود شده: ${score} / ${targetScore}`;
            
            // کم کردن خون حریف در HUD تکنی
            let currentEnemyHealth = Math.max(0, 100 - (score * 6.7));
            document.getElementById('p2-health').style.width = currentEnemyHealth + '%';

            if(score >= targetScore) {
                gameWon = true;
                enemies = [];
                document.getElementById('score-display').innerText = "مسیر امن شد! به آغوش نیایش برو...";
            }
        }
    }
}

function spawnArcadeEnemies() {
    if(!isPlaying || gameWon) return;
    enemies.push({ x: 850, y: 180, width: 45, height: 140, speed: 2.5 + Math.random() * 2 });
    setTimeout(spawnArcadeEnemies, Math.random() * 1400 + 600);
}

function updateArcadePhysics() {
    if(!isPlaying) return;

    if(!gameWon) {
        if(keys.ArrowLeft && player.x > 0) player.x -= player.speed;
        if(keys.ArrowRight && player.x < 550) player.x += player.speed;

        enemies.forEach(e => {
            e.x -= e.speed;
            // افکت عقب راندن در صورت برخورد فیزیکی رقیب
            if(e.x < player.x + player.width && e.x + e.width > player.x) {
                player.x = Math.max(0, player.x - 15);
                e.x += 15;
                player.health = Math.max(0, player.health - 4);
                document.getElementById('p1-health').style.width = player.health + '%';
            }
        });
    } else {
        // انیمیشن رسیدن و بغل کردن پایانی رمانتیک تیکن
        if(player.x < niyayesh.x - player.width + 10) {
            player.x += 3;
        } else {
            isPlaying = false;
            clearInterval(timerInterval);
            document.getElementById('game-overlay').style.display = "flex";
            document.getElementById('game-overlay').innerHTML = `
                <div style="font-size: 5.5rem; filter: drop-shadow(0 0 20px #ff1a40);">👩‍❤️‍💋‍👨</div>
                <div class="game-title" style="margin-top:20px; font-size:2.5rem;">تا ابد در آغوش هم...</div>
                <div style="color:#fff; font-weight:bold; font-size:1.1rem;">مبین با موفقیت تمام موانع رو نابود کرد و به نیایش رسید! ❤️🩸</div>
                <button class="start-game-btn" onclick="startArcadeGame()" style="margin-top:20px;">نبرد مجدد</button>
            `;
        }
    }

    if(player.attacking) {
        player.attackTimer--;
        if(player.attackTimer <= 0) player.attacking = false;
    }
}

function drawArcadeFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // بک‌گراند تاریک استیج تیکن با سایه‌های نئونی عمیق قرمز
    let bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, '#150103');
    bgGrad.addColorStop(1, '#000000');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // کف استیج مبارزه (رندر سنگین دو بعدی قدیمی)
    ctx.fillStyle = "#220509";
    ctx.fillRect(0, 320, canvas.width, 60);
    ctx.fillStyle = "#ff1a40";
    ctx.fillRect(0, 320, canvas.width, 2); // خط افق درخشان استیج

    // رسم نیایش (سمت راست - در انتظار نجات)
    if(score >= targetScore || gameWon) {
        ctx.fillStyle = niyayesh.color;
        ctx.shadowColor = "#ffb6c1"; ctx.shadowBlur = 25;
        ctx.fillRect(niyayesh.x, niyayesh.y, niyayesh.width, niyayesh.height);
        ctx.shadowBlur = 0;
    }

    // رسم مبین (شخصیت اصلی ومپایری)
    ctx.fillStyle = player.color;
    ctx.shadowColor = player.color; ctx.shadowBlur = 20;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.shadowBlur = 0;
    
    // چشمان ومپایری درخشان تیکن
    ctx.fillStyle = "#fff"; ctx.fillRect(player.x + 30, player.y + 15, 6, 6);

    // انیمیشن افکت هاله ضربه (Combo Slash Effect)
    if(player.attacking) {
        ctx.fillStyle = "rgba(255, 26, 64, 0.7)";
        ctx.beginPath();
        ctx.arc(player.x + player.width + 10, player.y + 50, 45, -Math.PI/2, Math.PI/2);
        ctx.fill();
    }

    // رسم سایه دشمنان تکن
    ctx.fillStyle = "#3a3a3a";
    enemies.forEach(e => {
        ctx.fillRect(e.x, e.y, e.width, e.height);
        ctx.fillStyle = "#ff1a40"; ctx.fillRect(e.x + 8, e.y + 15, 5, 5); // چشم قرمز رقیب
        ctx.fillStyle = "#3a3a3a";
    });
}

function loopArcade() {
    updateArcadePhysics();
    drawArcadeFrame();
    if(isPlaying || gameWon) {
        gameLoopId = requestAnimationFrame(loopArcade);
    }
}

function startArcadeGame() {
    document.getElementById('game-overlay').style.display = "none";
    player.x = 60;
    player.health = 100;
    score = 0;
    enemies = [];
    gameWon = false;
    isPlaying = true;
    gameTimer = 99;
    
    document.getElementById('p1-health').style.width = '100%';
    document.getElementById('p2-health').style.width = '100%';
    document.getElementById('score-display').innerText = `دشمنان نابود شده: 0 / ${targetScore}`;
    
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if(gameTimer > 0 && isPlaying) {
            gameTimer--;
            document.getElementById('arcade-timer-ui').innerText = gameTimer;
        }
    }, 1000);

    spawnArcadeEnemies();
    loopArcade();
}
