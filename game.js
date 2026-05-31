const canvas =

document.getElementById('love-game');

const ctx =

canvas.getContext('2d');

let player = {

    x:100,

    y:200,

    size:20,

    speed:5

};

let enemies = [];

let keys = {};

let won = false;

const goal = {

    x:700,

    y:220,

    active:false

};

function createEnemies(){

    enemies = [];

    for(let i=0;i<5;i++){

        enemies.push({

            x:250 + Math.random()*300,

            y:80 + Math.random()*250,

            size:20,

            hp:3,

            alive:true

        });

    }

}

createEnemies();

window.addEventListener('keydown',e=>{

    keys[e.code] = true;

});

window.addEventListener('keyup',e=>{

    keys[e.code] = false;

});

window.addEventListener('keydown',e=>{

    if(e.code === 'Space'){

        enemies.forEach(enemy=>{

            if(enemy.alive){

                const dx =

                enemy.x - player.x;

                const dy =

                enemy.y - player.y;

                const dist =

                Math.sqrt(dx*dx + dy*dy);

                if(dist < 80){

                    enemy.hp--;

                    if(enemy.hp <= 0){

                        enemy.alive = false;

                    }

                }

            }

        });

    }

});

function update(){

    if(keys['ArrowUp']) player.y -= player.speed;

    if(keys['ArrowDown']) player.y += player.speed;

    if(keys['ArrowLeft']) player.x -= player.speed;

    if(keys['ArrowRight']) player.x += player.speed;

    let allDead = true;

    enemies.forEach(enemy=>{

        if(enemy.alive){

            allDead = false;

        }

    });

    if(allDead){

        goal.active = true;

    }

    if(goal.active){

        const dx = goal.x - player.x;

        const dy = goal.y - player.y;

        const dist =

        Math.sqrt(dx*dx + dy*dy);

        if(dist < 40){

            won = true;

            document.getElementById('game-win')

            .style.display = 'flex';

        }

    }

}

function draw(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Goal

    if(goal.active){

        ctx.font = '40px Arial';

        ctx.fillText(

            '💕',

            goal.x,

            goal.y

        );

    }

    // Enemies

    enemies.forEach(enemy=>{

        if(enemy.alive){

            ctx.beginPath();

            ctx.fillStyle =

            '#ff0a54';

            ctx.arc(

                enemy.x,

                enemy.y,

                enemy.size,

                0,

                Math.PI*2

            );

            ctx.fill();

        }

    });

    // Player

    ctx.beginPath();

    ctx.fillStyle =

    '#ffffff';

    ctx.arc(

        player.x,

        player.y,

        player.size,

        0,

        Math.PI*2

    );

    ctx.fill();

}

function loop(){

    if(!won){

        update();

        draw();

    }

    requestAnimationFrame(loop);

}

loop();

document

.getElementById('restart-game')

.addEventListener('click',()=>{

    won = false;

    document.getElementById('game-win')

    .style.display = 'none';

    player.x = 100;

    player.y = 200;

    goal.active = false;

    createEnemies()

});
