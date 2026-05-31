// ======================== FIREBASE CONFIG ========================
const firebaseConfig = {
    apiKey: "AIzaSyDsqisH5TT77Wq1qJ8_gljRs7wnzH8h0PQ",
    authDomain: "niyayesh-universe.firebaseapp.com",
    projectId: "niyayesh-universe",
    storageBucket: "niyayesh-universe.firebasestorage.app",
    messagingSenderId: "675804346928",
    appId: "1:675804346928:web:8e8c33f7a26d2824340bf5"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// ======================== GLOBAL VARIABLES ========================
let isAdmin = false;
let loveLetter = `نیایش عزیزم،\n\nنمی‌دونم چطور بگم ولی تو برای من فقط یه آدم نیستی… یه حسِ آروم و قشنگی که توی شلوغ‌ترین لحظه‌های زندگی هم منو نگه می‌داره تو فرشته‌می.\n\nبا تو حتی روزای بدم از بین می‌رن. یه پیام از تو می‌تونه حال منو عوض کنه و یه فکر کوچیک ازت می‌تونه بهم آرامش بده.\n\nتو برام مهمی… بیشتر از چیزی که بشه راحت گفت.\n\nفقط خواستم بدونی بودنِ تو توی زندگی من یه اتفاق ساده نیست، یه چیز قشنگه که قدرشو می‌دونم.\n\nقول میدم یه زندگی برات بسازم که پر از آرامش باشه و اینو بدون همیشه کنارتم قشنگ تر از قاصدک :)\n\nدوست دارم مال منی:)\n\nباعشق 🫂💕🥹\nMobin`;

// Lovebox tracks
const tracks = [
    { title: "Sweater Weather", id: "2QjOHCTQ1Jl3zawyYOpxh6" },
    { title: "آهنگ دوم", id: "1AdIEZmXtXbxyyA5wK8Ihj" },
    { title: "آهنگ سوم", id: "18XVXZ4Yk27u10Zwl9IUUz" }
];
let currentTrack = 0;

// Memory game variables
let memoryEmojis = ['💖', '💕', '💗', '💘', '💝', '💟', '❣️', '💌'];
let memoryCards = [], flippedCards = [], matchedPairs = 0, memoryMoves = 0, memoryLocked = false;

// Fighting game variables
let fightAnimationId = null;
let playerX = 100, enemyX = 400;
let playerHealth = 100, enemyHealth = 100;
let gameActive = false;
let timer = 99;
let timerInterval = null;

// ======================== HELPER FUNCTIONS ========================
function preserveEmojiColor() {
    const emojiRegex = /([🩸🃏⏳🥹🫂💕🎮🌀🔒❤️⚔️⏰✨📸🦇🧠💗🌸🎵🌧️💒])/g;
    document.querySelectorAll('.title-main, .section-title').forEach(el => {
        if (!el.dataset.emojiFixed) {
            el.innerHTML = el.innerHTML.replace(emojiRegex, '<span class="title-emoji">$1</span>');
            el.dataset.emojiFixed = "1";
        }
    });
}

function typeWriter(text, i, elementId) {
    if (isAdmin) {
        document.getElementById(elementId).innerHTML = text.replace(/\n/g, "<br>");
        finishTypewriter();
        return;
    }
    if (i < text.length) {
        let char = text.charAt(i);
        document.getElementById(elementId).innerHTML += char === '\n' ? "<br>" : char;
        setTimeout(() => typeWriter(text, i + 1, elementId), char === '.' ? 400 : 55);
    } else finishTypewriter();
}

function finishTypewriter() {
    setTimeout(() => {
        document.getElementById("navbar").classList.add("show-nav");
        preserveEmojiColor();
    }, 600);
}

function createCrimsonParticles() {
    for (let i = 0; i < 40; i++) {
        let p = document.createElement("div");
        p.className = "particle";
        p.style.cssText = `position:fixed; top:-20px; left:${Math.random()*100}vw; width:${Math.random()*5+3}px; height:${Math.random()*5+3}px; background:#ff1a40; border-radius:50%; box-shadow:0 0 15px #ff1a40; animation:floatParticle ${Math.random()*9+5}s linear forwards;`;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 15000);
    }
}

function createSoftHearts() {
    for (let i = 0; i < 10; i++) {
        const heart = document.createElement("div");
        heart.className = "soft-heart";
        heart.textContent = ["💖", "✨", "🫶", "💕"][Math.floor(Math.random() * 4)];
        heart.style.cssText = `position:fixed; bottom:-30px; left:${Math.random()*100}vw; font-size:1.2rem; opacity:0; animation:floatHearts ${Math.random()*8+10}s linear forwards;`;
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 20000);
    }
}

function startRosePetals() {
    setInterval(() => {
        const petal = document.createElement("div");
        petal.className = "rose-petal";
        petal.style.cssText = `position:fixed; top:-30px; left:${Math.random()*100}vw; width:18px; height:18px; background:radial-gradient(circle at 30% 30%, #ff3366, #8b0000); border-radius:50% 0 50% 0; animation:fallRose ${Math.random()*5+8}s linear forwards;`;
        document.body.appendChild(petal);
        setTimeout(() => petal.remove(), 15000);
    }, 1500);
}

function startLanterns() {
    setInterval(() => {
        const lantern = document.createElement("div");
        lantern.className = "lantern";
        lantern.textContent = "🏮";
        lantern.style.cssText = `position:fixed; bottom:-60px; left:${Math.random()*100}vw; font-size:2.5rem; opacity:0.8; filter:drop-shadow(0 0 15px #ff9900); animation:riseLantern ${Math.random()*10+15}s linear forwards;`;
        document.body.appendChild(lantern);
        setTimeout(() => lantern.remove(), 26000);
    }, 8000);
}

function playRomanticSound() {
    try {
        let ctx = new (window.AudioContext || window.webkitAudioContext)();
        let t = ctx.currentTime;
        const playTone = (freq, type, start, dur, vol) => {
            let osc = ctx.createOscillator();
            let gain = ctx.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(vol, start + 0.4);
            gain.gain.exponentialRampToValueAtTime(0.01, start + dur);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + dur);
        };
        playTone(261.63, 'sine', t, 3.2, 0.4);
        playTone(311.13, 'sine', t, 3.2, 0.4);
        playTone(392.00, 'sine', t, 3.2, 0.4);
        playTone(466.16, 'triangle', t + 0.3, 3.5, 0.12);
    } catch(e) {}
}

function revealOnScroll() {
    document.querySelectorAll('.reveal').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 80) el.classList.add('active');
    });
    document.querySelectorAll('.web-section[id]').forEach(sec => {
        const top = sec.getBoundingClientRect().top;
        if (top < window.innerHeight/2 && top > -sec.offsetHeight/2) {
            document.querySelectorAll('.navbar a').forEach(a => a.classList.remove('active'));
            const target = document.querySelector(`.navbar a[href="#${sec.id}"]`);
            if (target) target.classList.add('active');
        }
    });
}

function updateCountdown() {
    const target = new Date("Sep 15, 2026 00:00:00").getTime();
    const now = new Date().getTime();
    const dist = target - now;
    if (dist < 0) return;
    document.getElementById("cd-days").innerText = String(Math.floor(dist / (1000*60*60*24))).padStart(2,'0');
    document.getElementById("cd-hours").innerText = String(Math.floor((dist % (86400000)) / 3600000)).padStart(2,'0');
    document.getElementById("cd-mins").innerText = String(Math.floor((dist % 3600000) / 60000)).padStart(2,'0');
    document.getElementById("cd-secs").innerText = String(Math.floor((dist % 60000) / 1000)).padStart(2,'0');
}
setInterval(updateCountdown, 1000);

function enableEditableMode() {
    document.querySelectorAll('[data-key]').forEach(el => el.setAttribute('contenteditable', 'true'));
}

// ======================== PORTAL & VORTEX ========================
let vortexAnimation;
function startVortexCanvas() {
    const canvas = document.getElementById('vortexCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let particles = [];
    for(let i=0; i<300; i++) particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * Math.max(canvas.width, canvas.height),
        speed: Math.random() * 0.03 + 0.01,
        size: Math.random() * 3 + 1,
        color: Math.random() > 0.5 ? '#ff1a40' : '#4a0000'
    });
    let centerX = canvas.width/2, centerY = canvas.height/2;
    function draw() {
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        particles.forEach(p => {
            p.angle += p.speed;
            p.radius -= p.radius * 0.015;
            if(p.radius < 5) p.radius = Math.max(canvas.width, canvas.height);
            let x = centerX + Math.cos(p.angle)*p.radius;
            let y = centerY + Math.sin(p.angle)*p.radius;
            ctx.beginPath();
            ctx.arc(x,y,p.size,0,Math.PI*2);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = p.color;
            ctx.fill();
        });
        vortexAnimation = requestAnimationFrame(draw);
    }
    draw();
}

window.openPortal = function() {
    const portal = document.getElementById("vampire-portal");
    portal.style.display = "flex";
    startVortexCanvas();
    setTimeout(() => {
        document.getElementById("portal-dim").style.opacity = "1";
        document.getElementById("pt-q").style.opacity = "1";
        document.getElementById("pt-st").style.opacity = "1";
        document.getElementById("pt-btn").style.opacity = "1";
    }, 2000);
};
window.closePortal = function() {
    const portal = document.getElementById("vampire-portal");
    document.getElementById("portal-dim").style.opacity = "0";
    document.getElementById("vortexCanvas").style.opacity = "0";
    setTimeout(() => {
        portal.style.display = "none";
        cancelAnimationFrame(vortexAnimation);
    }, 1500);
};

// ======================== LOGIN & AUTH ========================
window.enterSite = function() {
    let p = document.getElementById("pass").value;
    if(p === "mobinloveniyayesh" || p === "adminwiriper") {
        if(p === "adminwiriper") {
            isAdmin = true;
            document.getElementById("upload-box").style.display = "block";
            document.getElementById("admin-save-bar").style.display = "flex";
            enableEditableMode();
        }
        document.getElementById("login-zone").style.display = "none";
        playRomanticSound();
        const intro = document.getElementById("netflix-intro");
        intro.style.display = "flex";
        setTimeout(() => {
            intro.style.display = "none";
            const main = document.getElementById("main");
            main.style.display = "block";
            setTimeout(() => {
                main.style.opacity = "1";
                preserveEmojiColor();
                typeWriter(loveLetter, 0, "typed-text");
                createCrimsonParticles();
                createSoftHearts();
                startRosePetals();
                startLanterns();
                window.loadFeed();
                window.initMemoryGame();
                revealOnScroll();
            }, 100);
        }, 3800);
    } else alert("رمز ورود اشتباه است... دوباره تلاش کن عشق من");
};

// ======================== SECRET VAULT ========================
window.openSecret = function() {
    const modal = document.getElementById("secret-modal");
    modal.style.display = "flex";
    setTimeout(() => modal.style.opacity = "1", 10);
};
window.closeSecret = function() {
    const modal = document.getElementById("secret-modal");
    modal.style.opacity = "0";
    setTimeout(() => {
        modal.style.display = "none";
        document.getElementById("secret-pass").value = "";
        document.getElementById("secret-content").style.display = "none";
    }, 600);
};
window.checkSecret = function() {
    let p = document.getElementById("secret-pass").value;
    if(p === "niyayeshlovemobin") {
        document.getElementById("secret-content").style.display = "block";
    } else alert("رمز صندوقچه اشتباه است... رازها محافظت شده هستند!");
};

// ======================== LOVEBOX ========================
window.changeTrack = function(index) {
    if (index === currentTrack) return;
    currentTrack = index;
    const iframe = document.getElementById('music-iframe');
    iframe.src = `https://open.spotify.com/embed/track/${tracks[index].id}?utm_source=generator&theme=0`;
    document.getElementById('now-playing').innerText = `🎧 ${tracks[index].title}`;
    document.querySelectorAll('.jukebox-btn').forEach((btn,i) => btn.classList.toggle('active', i===index));
    const heart = document.createElement('span');
    heart.className = 'mini-heart';
    heart.textContent = '💖';
    heart.style.cssText = `position:absolute; left:${Math.random()*80+10}%; top:${Math.random()*40+30}%; font-size:1rem; animation:popHearts 1.5s ease forwards;`;
    document.getElementById('lovebox-sec').appendChild(heart);
    setTimeout(() => heart.remove(), 1500);
};
document.querySelectorAll('.jukebox-btn').forEach(btn => {
    btn.addEventListener('click', () => window.changeTrack(parseInt(btn.dataset.track)));
});

// ======================== MEMORY GAME ========================
window.initMemoryGame = function() {
    memoryCards = [...memoryEmojis, ...memoryEmojis].sort(() => Math.random() - 0.5);
    flippedCards = [];
    matchedPairs = 0;
    memoryMoves = 0;
    memoryLocked = false;
    document.getElementById('memory-moves').innerText = 'حرکات: 0';
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';
    memoryCards.forEach((emoji, idx) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = idx;
        card.dataset.emoji = emoji;
        card.onclick = () => flipMemoryCard(card);
        card.innerHTML = '<span class="memory-card-back">?</span>';
        grid.appendChild(card);
    });
};
function flipMemoryCard(card) {
    if (memoryLocked || card.classList.contains('flipped') || card.classList.contains('matched') || flippedCards.length === 2) return;
    card.classList.add('flipped');
    card.innerHTML = `<span class="memory-card-emoji">${card.dataset.emoji}</span>`;
    flippedCards.push(card);
    if (flippedCards.length === 2) {
        memoryMoves++;
        document.getElementById('memory-moves').innerText = `حرکات: ${memoryMoves}`;
        memoryLocked = true;
        const [c1, c2] = flippedCards;
        if (c1.dataset.emoji === c2.dataset.emoji) {
            c1.classList.add('matched');
            c2.classList.add('matched');
            matchedPairs++;
            flippedCards = [];
            memoryLocked = false;
            if (matchedPairs === memoryEmojis.length) setTimeout(() => alert('🎉 آفرین! تو برنده شدی! 🧠❤️'), 500);
        } else {
            setTimeout(() => {
                c1.classList.remove('flipped');
                c1.innerHTML = '<span class="memory-card-back">?</span>';
                c2.classList.remove('flipped');
                c2.innerHTML = '<span class="memory-card-back">?</span>';
                flippedCards = [];
                memoryLocked = false;
            }, 800);
        }
    }
}

// ======================== COMPLIMENT ========================
const compliments = [
    "تو زیباترین اتفاق زندگی منی 🌹",
    "هر روز با تو مثل یک رؤیای شیرینه 💭",
    "چشمانت آرامش بخش‌ترین جای دنیاست ✨",
    "عشق تو باعث میشه نفس بکشم ❤️",
    "تو معنی واقعی خوشبختی برای منی 🥰"
];
window.generateCompliment = function() {
    const random = compliments[Math.floor(Math.random() * compliments.length)];
    const el = document.getElementById('compliment-text');
    el.style.opacity = '0';
    setTimeout(() => {
        el.innerText = random;
        el.style.opacity = '1';
    }, 200);
};

// ======================== FIGHTING GAME (ARCADE) ========================
function stopGameLoop() {
    if (fightAnimationId) cancelAnimationFrame(fightAnimationId);
    if (timerInterval) clearInterval(timerInterval);
    gameActive = false;
}
function drawFightingGame() {
    if (!gameActive) return;
    const canvas = document.getElementById('tekkenCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // Player (vampire)
    ctx.fillStyle = '#2c0b0e';
    ctx.fillRect(playerX, canvas.height-120, 50, 90);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('🩸', playerX+10, canvas.height-100);
    // Enemy
    ctx.fillStyle = '#330000';
    ctx.fillRect(enemyX, canvas.height-120, 50, 90);
    ctx.fillStyle = '#ff6666';
    ctx.fillText('🧛', enemyX+10, canvas.height-100);
    // Health bars update
    document.getElementById('p1-health').style.width = `${playerHealth}%`;
    document.getElementById('p2-health').style.width = `${enemyHealth}%`;
    fightAnimationId = requestAnimationFrame(drawFightingGame);
}
function attack() {
    if (!gameActive) return;
    if (Math.abs(playerX - enemyX) < 80) {
        enemyHealth = Math.max(0, enemyHealth - 14);
        if (enemyHealth <= 0) endGame(true);
    } else {
        // whiff
    }
}
function moveLeft() { if (gameActive) playerX = Math.max(20, playerX - 25); }
function moveRight() { if (gameActive) playerX = Math.min(canvasWidth(), playerX + 25); }
function canvasWidth() { return document.getElementById('tekkenCanvas').clientWidth - 70; }
function enemyAI() {
    if (!gameActive) return;
    if (enemyX > playerX + 40) enemyX -= 12;
    else if (enemyX < playerX - 40) enemyX += 12;
    if (Math.abs(enemyX - playerX) < 70 && Math.random() < 0.3) {
        playerHealth = Math.max(0, playerHealth - 10);
        if (playerHealth <= 0) endGame(false);
    }
}
function endGame(playerWon) {
    gameActive = false;
    stopGameLoop();
    alert(playerWon ? "🔥 تو پیروز شدی! نیایش نجات یافت!" : "💀 حریف قوی‌تر بود... دوباره تلاش کن عشق من");
    document.getElementById('game-overlay').style.display = 'flex';
}
function startTimer() {
    timer = 99;
    const timerEl = document.getElementById('arcade-timer-ui');
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!gameActive) return;
        timer--;
        timerEl.innerText = timer;
        if (timer <= 0) {
            clearInterval(timerInterval);
            if (playerHealth > enemyHealth) endGame(true);
            else endGame(false);
        }
    }, 1000);
}
window.startArcadeGame = function() {
    stopGameLoop();
    playerHealth = 100;
    enemyHealth = 100;
    playerX = 100;
    enemyX = 400;
    gameActive = true;
    document.getElementById('game-overlay').style.display = 'none';
    startTimer();
    drawFightingGame();
    const aiInterval = setInterval(() => { if (gameActive) enemyAI(); }, 800);
    const attackHandler = () => attack();
    const leftHandler = () => moveLeft();
    const rightHandler = () => moveRight();
    document.getElementById('btn-attack').onclick = attackHandler;
    document.getElementById('btn-left').onclick = leftHandler;
    document.getElementById('btn-right').onclick = rightHandler;
    const cleanup = () => {
        clearInterval(aiInterval);
        document.getElementById('btn-attack').onclick = null;
        document.getElementById('btn-left').onclick = null;
        document.getElementById('btn-right').onclick = null;
    };
    setTimeout(cleanup, 100000); // fallback cleanup
};

// ======================== FIREBASE: FEED & SAVE ========================
window.triggerUpload = function() {
    if (isAdmin) document.getElementById('file-input').click();
};
window.handleFileUpload = async function(event) {
    const file = event.target.files[0];
    if (!file) return;
    const memoryText = prompt("یه متن قشنگ برای این خاطره بنویس:");
    if (!memoryText) return;
    const uploadBox = document.getElementById("upload-box");
    uploadBox.innerHTML = "⏳ در حال آپلود...";
    uploadBox.style.pointerEvents = "none";
    const isVideo = file.type.startsWith('video');
    const storageRef = storage.ref('memories/' + Date.now() + '_' + file.name);
    try {
        const snapshot = await storageRef.put(file);
        const url = await snapshot.ref.getDownloadURL();
        await db.collection("memories").add({
            url, text: memoryText, type: isVideo ? 'video' : 'image',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert("خاطره ثبت شد!");
    } catch(e) { console.error(e); alert("خطا در آپلود."); }
    uploadBox.innerHTML = `<span style="font-size:2rem;">📸</span> ثبت یک خاطره جدید`;
    uploadBox.style.pointerEvents = "auto";
};
window.loadFeed = function() {
    db.collection("memories").orderBy("timestamp", "desc").onSnapshot(snapshot => {
        const postsArea = document.getElementById('posts-area');
        postsArea.innerHTML = '';
        if (snapshot.empty) { postsArea.innerHTML = '<p style="text-align:center; color:gray;">خاطره‌ای نیست.</p>'; return; }
        snapshot.forEach(doc => {
            const data = doc.data();
            const media = data.type === 'video' ? `<video src="${data.url}" class="post-video" controls></video>` : `<img src="${data.url}" class="post-img" loading="lazy">`;
            postsArea.innerHTML += `<div class="post-card"><div class="post-header"><div class="avatar">M</div><div><div style="font-weight:700;">Mobin</div><div style="font-size:0.75rem; color:#ff1a40;">عاشق‌ترین پسر دنیا</div></div></div>${media}<div class="post-content">${data.text}</div></div>`;
        });
    });
};
window.saveWebsiteTexts = function() {
    if (!isAdmin) return;
    const updated = {};
    document.querySelectorAll('[data-key]').forEach(el => {
        let key = el.getAttribute('data-key');
        let content = el.innerHTML;
        if (key === "love_letter") content = el.innerHTML.replace(/<br\s*\/?>/gi, "\n");
        updated[key] = content;
    });
    db.collection("website_data").doc("texts").set(updated, { merge: true })
        .then(() => alert("تغییرات با موفقیت برای نیایش اعمال شد! ❤️"))
        .catch(err => alert("خطا در ذخیره."));
};

// Real-time listener for texts
db.collection("website_data").doc("texts").onSnapshot(doc => {
    if (doc.exists) {
        const data = doc.data();
        if (data.love_letter) loveLetter = data.love_letter;
        document.querySelectorAll('[data-key]').forEach(el => {
            const key = el.getAttribute('data-key');
            if (data[key] !== undefined && document.getElementById("main").style.display === "block") {
                el.innerHTML = data[key];
            }
        });
        preserveEmojiColor();
    }
});
db.collection("website_data").doc("config").get().then(doc => {
    if (doc.exists && doc.data().tvd_video_url)
        document.getElementById("tvd-iframe").src = doc.data().tvd_video_url;
});

// ======================== INIT ON LOAD ========================
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('DOMContentLoaded', () => {
    preserveEmojiColor();
    // Attach tarot flip listeners
    document.querySelectorAll('.tarot-card').forEach(card => {
        card.addEventListener('click', () => card.classList.toggle('flipped'));
    });
});
