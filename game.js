document.addEventListener("DOMContentLoaded", function() {
    const gCanvas = document.getElementById('love-game-canvas');
    if (!gCanvas) return;
    
    const gCtx = gCanvas.getContext('2d');
    let player = { x: 50, y: 200, size: 20, speed: 5, isAttacking: false };
    let enemies = [];
    let niyayesh = { x: 500, y: 200, size: 25, active: false };
    let keys = {};
    let gameWon = false;

    function initEnemies() {
        enemies = [];
        for(let i=0; i<5; i++) {
            enemies.push({ x: 200 + Math.random() * 300, y: 50 + Math.random() * 300, size: 20, speed: 1 + Math.random() * 1.5, hp: 3, alive: true });
        }
    }

    window.addEventListener('keydown', e => keys[e.code] = true);
    window.addEventListener('keyup', e => keys[e.code] = false);
    window.addEventListener('keydown', e => {
        if(e.code === 'Space' && !player.isAttacking && !gameWon) {
            player.isAttacking = true;
            enemies.forEach(en => {
                if(en.alive && Math.hypot(en.x - player.x, en.y - player.y) < 60) {
                    en.hp -= 1; if(en.hp <= 0) en.alive = false;
                }
            });
            setTimeout(() => player.isAttacking = false, 200);
        }
    });

    function runGame() {
        if(gameWon) return;
        // لاجیک آپدیت و رسم بازی (بخش drawGame و updateGame رو از کد خودت اینجا قرار بده)
        // این ساختار باعث میشه بازی فوق‌العاده روان (Smooth) اجرا بشه.
        requestAnimationFrame(runGame);
    }
    
    window.resetGame = function() {
        player.x = 50; player.y = 200; niyayesh.active = false; gameWon = false;
        document.getElementById('game-win-screen').style.display = 'none';
        initEnemies(); runGame();
    }

    initEnemies(); runGame();
});
