// =============================================
//  The Obsidian Kingdom v17.41 - app.js
//  تمام تعاملات، صدا، کرسر، مخفی‌کاری و منطق
// =============================================

let isAdmin = false;
let loveLetter = `نیایش عزیزم،

نمی‌دونم چطور بگم ولی تو برای من فقط یه آدم نیستی… یه حسِ آروم و قشنگی که توی شلوغ‌ترین لحظه‌های زندگی هم منو نگه می‌داره تو فرشته‌می.

با تو حتی روزای بدم از بین می‌رن. یه پیام از تو می‌تونه حال منو عوض کنه و یه فکر کوچیک ازت می‌تونه بهم آرامش بده.

تو برام مهمی… بیشتر از چیزی که بشه راحت گفت.

فقط خواستم بدونی بودنِ تو توی زندگی من یه اتفاق ساده نیست، یه چیز قشنگه که قدرشو می‌دونم.

قول میدم یه زندگی برات بسازم که پر از آرامش باشه و اینو بدون همیشه کنارتم قشنگ تر از قاصدک :)

دوست دارم مال منی:)

باعشق 🫂💕🥹
Mobin`;

// ---------- 1. Magic Cursor ----------
const cursor = document.getElementById('magic-cursor');
if (cursor) {
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    // Change cursor size on clickable elements
    document.querySelectorAll('a, button, .clickable, .memory-card, .tarot-card, .hidden-rune, .jukebox-btn, .castle-window').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.width = '40px';
            cursor.style.height = '40px';
            cursor.style.background = 'radial-gradient(circle at 40% 40%, #fff, #FFC857)';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.width = '28px';
            cursor.style.height = '28px';
            cursor.style.background = 'radial-gradient(circle at 40% 40%, #fff, var(--moonlight))';
        });
    });
}

// ---------- 2. Ambient Sound ----------
let audioCtx = null;
let soundEnabled = false;
const soundBtn = document.getElementById('sound-toggle');

function initAudioEngine() {
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        // Wind
        const wind = audioCtx.createOscillator();
        wind.type = 'sawtooth';
        wind.frequency.value = 80;
        const windLfo = audioCtx.createOscillator();
        windLfo.frequency.value = 0.4;
        const windLfoGain = audioCtx.createGain();
        windLfoGain.gain.value = 25;
        windLfo.connect(windLfoGain);
        windLfoGain.connect(wind.frequency);
        windLfo.start();

        const windGain = audioCtx.createGain();
        windGain.gain.value = 0.015;
        wind.connect(windGain);
        windGain.connect(audioCtx.destination);
        wind.start();

        // Subtle whisper
        const whisper = audioCtx.createOscillator();
        whisper.type = 'sine';
        whisper.frequency.value = 220;
        const whisperGain = audioCtx.createGain();
        whisperGain.gain.setValueAtTime(0, audioCtx.currentTime);
        whisperGain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        whisperGain.gain.linearRampToValueAtTime(0.005, audioCtx.currentTime + 1.5);
        whisper.connect(whisperGain);
        whisperGain.connect(audioCtx.destination);
        whisper.start();
        whisper.stop(audioCtx.currentTime + 2);

        window.ambientWind = windGain;
        window.ambientWhisper = whisperGain;
        soundBtn.innerText = '🔊';
        soundEnabled = true;
    } catch (e) {
        console.log("Web Audio not supported");
    }
}

soundBtn.addEventListener('click', () => {
    if (!audioCtx) {
        initAudioEngine();
    } else {
        if (soundEnabled) {
            if (window.ambientWind) window.ambientWind.gain.value = 0;
            soundBtn.innerText = '🔇';
        } else {
            if (window.ambientWind) window.ambientWind.gain.value = 0.015;
            soundBtn.innerText = '🔊';
        }
        soundEnabled = !soundEnabled;
    }
});

// ---------- 3. Hero Canvas Parallax ----------
const heroCanvas = document.getElementById('hero-canvas');
if (heroCanvas) {
    const hctx = heroCanvas.getContext('2d');
    let mouseX = 0.5, mouseY = 0.5;
    let scrollY = 0;

    function resizeHero() {
        heroCanvas.width = window.innerWidth;
        heroCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeHero);
    resizeHero();

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX / window.innerWidth;
        mouseY = e.clientY / window.innerHeight;
    });
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    });

    function drawHero() {
        hctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);

        // Sky gradient
        let grad = hctx.createLinearGradient(0, 0, 0, heroCanvas.height);
        grad.addColorStop(0, '#0B0F1A');
        grad.addColorStop(0.7, '#121826');
        grad.addColorStop(1, '#1A1F2E');
        hctx.fillStyle = grad;
        hctx.fillRect(0, 0, heroCanvas.width, heroCanvas.height);

        // Moon
        const moonX = heroCanvas.width * 0.8 + (mouseX - 0.5) * 40;
        const moonY = heroCanvas.height * 0.2 + (mouseY - 0.5) * 30;
        hctx.shadowColor = '#D6C7FF';
        hctx.shadowBlur = 60;
        hctx.beginPath();
        hctx.arc(moonX, moonY, 50, 0, Math.PI * 2);
        hctx.fillStyle = '#EAE6FF';
        hctx.fill();
        hctx.shadowBlur = 0;

        // Castle silhouette
        const castleBase = heroCanvas.height * 0.55 + scrollY * 0.4;
        hctx.fillStyle = '#0B0F1A';
        hctx.beginPath();
        hctx.moveTo(0, heroCanvas.height);
        hctx.lineTo(0, castleBase + 140);
        hctx.lineTo(heroCanvas.width * 0.15, castleBase + 100);
        hctx.lineTo(heroCanvas.width * 0.2, castleBase + 30);
        hctx.lineTo(heroCanvas.width * 0.3, castleBase + 80);
        hctx.lineTo(heroCanvas.width * 0.35, castleBase - 20);
        hctx.lineTo(heroCanvas.width * 0.45, castleBase + 70);
        hctx.lineTo(heroCanvas.width * 0.5, castleBase - 40);
        hctx.lineTo(heroCanvas.width * 0.6, castleBase + 50);
        hctx.lineTo(heroCanvas.width * 0.7, castleBase - 60);
        hctx.lineTo(heroCanvas.width * 0.8, castleBase + 90);
        hctx.lineTo(heroCanvas.width * 0.9, castleBase + 110);
        hctx.lineTo(heroCanvas.width, castleBase + 130);
        hctx.lineTo(heroCanvas.width, heroCanvas.height);
        hctx.closePath();
        hctx.fill();

        // Windows glow on scroll
        if (scrollY > 300) {
            hctx.fillStyle = '#FFC857';
            hctx.shadowColor = '#FFC857';
            hctx.shadowBlur = 20;
            const winY1 = castleBase + 50;
            const winY2 = castleBase - 20;
            const winY3 = castleBase - 40;
            hctx.fillRect(heroCanvas.width * 0.2, winY1, 10, 15);
            hctx.fillRect(heroCanvas.width * 0.5, winY2, 10, 15);
            hctx.fillRect(heroCanvas.width * 0.7, winY3, 10, 15);
            hctx.shadowBlur = 0;
        }

        // Bats
        const time = Date.now() * 0.002;
        const bat1X = (heroCanvas.width * 0.3 + time * 30) % heroCanvas.width;
        const bat1Y = heroCanvas.height * 0.15 + Math.sin(time) * 10;
        hctx.fillStyle = '#0B0F1A';
        hctx.beginPath();
        hctx.ellipse(bat1X, bat1Y, 6, 3, 0, 0, Math.PI * 2);
        hctx.fill();
        // wings
        hctx.beginPath();
        hctx.moveTo(bat1X - 6, bat1Y - 3);
        hctx.lineTo(bat1X - 12, bat1Y - 10);
        hctx.lineTo(bat1X - 4, bat1Y);
        hctx.fill();
        hctx.beginPath();
        hctx.moveTo(bat1X + 6, bat1Y - 3);
        hctx.lineTo(bat1X + 12, bat1Y - 10);
        hctx.lineTo(bat1X + 4, bat1Y);
        hctx.fill();

        requestAnimationFrame(drawHero);
    }
    drawHero();
}

// ---------- 4. Section Parallax on Scroll ----------
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('.web-section');
    sections.forEach((sec) => {
        const speed = 0.08;
        const yPos = (window.scrollY - sec.offsetTop) * speed;
        // Limit parallax for performance
        if (Math.abs(yPos) < 100) {
            sec.style.transform = `translateY(${yPos}px)`;
        }
    });
});

// ---------- 5. Hidden Runes & Easter Eggs ----------
const rune1 = document.getElementById('rune1');
if (rune1) {
    rune1.addEventListener('click', () => {
        document.body.style.transition = 'filter 0.3s';
        document.body.style.filter = 'invert(1) hue-rotate(180deg)';
        setTimeout(() => {
            document.body.style.filter = '';
        }, 400);
        alert('✨ You touched the ancient rune. The spirits bless your union.');
    });
}
const rune2 = document.getElementById('rune2');
if (rune2) {
    rune2.addEventListener('click', () => {
        document.getElementById('secret-archive').style.display = 'block';
    });
}

// Konami Code
const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
let konamiIndex = 0;
document.addEventListener('keydown', (e) => {
    if (e.keyCode === konamiSequence[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiSequence.length) {
            document.getElementById('secret-archive').style.display = 'block';
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function closeArchive() {
    document.getElementById('secret-archive').style.display = 'none';
}

// ---------- 6. Day/Night Toggle (Moon click) ----------
if (heroCanvas) {
    heroCanvas.addEventListener('click', (e) => {
        document.body.classList.toggle('day-mode');
        if (document.body.classList.contains('day-mode')) {
            // Optionally change canvas colors via a flag
        }
    });
}

// ---------- 7. Lovebox Music ----------
const tracks = [
    { title: "Sweater Weather", id: "2QjOHCTQ1Jl3zawyYOpxh6" },
    { title: "آهنگ دوم", id: "1AdIEZmXtXbxyyA5wK8Ihj" },
    { title: "آهنگ سوم", id: "18XVXZ4Yk27u10Zwl9IUUz" }
];
let currentTrack = 0;
function changeTrack(index) {
    if (index === currentTrack) return;
    currentTrack = index;
    const iframe = document.getElementById('music-iframe');
    const nowPlaying = document.getElementById('now-playing');
    if (iframe) {
        iframe.src = `https://open.spotify.com/embed/track/${tracks[index].id}?utm_source=generator&theme=0`;
    }
    if (nowPlaying) {
        nowPlaying.innerText = `🎧 ${tracks[index].title}`;
    }
    document.querySelectorAll('.jukebox-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });

    // Little heart burst
    const loveboxSec = document.getElementById('lovebox-sec');
    if (loveboxSec) {
        for (let i = 0; i < 8; i++) {
            const heart = document.createElement('span');
            heart.className = 'mini-heart';
            heart.textContent = '💖';
            heart.style.left = Math.random() * 80 + 10 + '%';
            heart.style.top = Math.random() * 60 + 20 + '%';
            loveboxSec.appendChild(heart);
            setTimeout(() => heart.remove(), 1500);
        }
    }
}

// ---------- 8. Compliment Generator ----------
const compliments = [
    "تو برام مث یه آهنگ قشنگ می‌مونی که هرگز از گوش دادنش خسته نمیشم 🎶",
    "وقتی هستی، دنیا حتی بدون رنگ هم قشنگه... 🌈",
    "هر بار نگات می‌کنم، قلبم یه ضربان جا میندازه 💓",
    "دوست دارم اندازه‌ی تموم ستاره‌های کهکشان، شاید هم بیشتر 🌌",
    "تو تنها کسی هستی که می‌تونه با یه لبخند، روزمو بسازه 😊",
    "عطر تنت قشنگ‌ترین ادکلن دنیاس برام 🌸",
    "باهات حرف زدن یه جور آرامش خاص داره که هیچ جا پیدا نمیشه 🕊️",
    "عشق تو، گرم‌ترین آتیشه تو سردترین زمستون ❄️🔥",
    "می‌دونی چرا چشمات اینقدر قشنگه؟ چون قلب منو توش می‌بینم 👀💘",
    "امروز هم مثل هر روز، اولین فکر و آخرین فکرم تویی ☀️🌙"
];
function generateCompliment() {
    const el = document.getElementById('compliment-text');
    if (!el) return;
    const randomIndex = Math.floor(Math.random() * compliments.length);
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    setTimeout(() => {
        el.innerText = compliments[randomIndex];
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    }, 300);
}

// ---------- 9. Memory Game ----------
const memoryEmojis = ['💖', '💕', '💗', '💘', '💝', '💟', '❣️', '💌'];
let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;
let memoryMoves = 0;
let memoryLocked = false;

function initMemoryGame() {
    const grid = document.getElementById('memory-grid');
    const movesEl = document.getElementById('memory-moves');
    if (!grid || !movesEl) return;
    memoryCards = [...memoryEmojis, ...memoryEmojis].sort(() => Math.random() - 0.5);
    flippedCards = [];
    matchedPairs = 0;
    memoryMoves = 0;
    memoryLocked = false;
    movesEl.innerText = 'حرکات: 0';
    grid.innerHTML = '';
    memoryCards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.dataset.emoji = emoji;
        card.onclick = () => flipMemoryCard(card);
        card.innerHTML = '<span class="memory-card-back">?</span>';
        grid.appendChild(card);
    });
}

function flipMemoryCard(card) {
    if (memoryLocked) return;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
    if (flippedCards.length === 2) return;
    card.classList.add('flipped');
    card.innerHTML = `<span class="memory-card-emoji">${card.dataset.emoji}</span>`;
    flippedCards.push(card);
    if (flippedCards.length === 2) {
        memoryMoves++;
        document.getElementById('memory-moves').innerText = `حرکات: ${memoryMoves}`;
        memoryLocked = true;
        const [card1, card2] = flippedCards;
        if (card1.dataset.emoji === card2.dataset.emoji) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            flippedCards = [];
            memoryLocked = false;
            if (matchedPairs === memoryEmojis.length) {
                setTimeout(() => alert('🎉 آفرین! تو برنده شدی! 🧠❤️'), 500);
            }
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card1.innerHTML = '<span class="memory-card-back">?</span>';
                card2.classList.remove('flipped');
                card2.innerHTML = '<span class="memory-card-back">?</span>';
                flippedCards = [];
                memoryLocked = false;
            }, 800);
        }
    }
}

// ---------- 10. Countdown ----------
const targetDate = new Date("Sep 15, 2026 00:00:00").getTime();
function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;
    if (distance < 0) return;
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    document.getElementById("cd-days").innerText = days < 10 ? "0" + days : days;
    document.getElementById("cd-hours").innerText = hours < 10 ? "0" + hours : hours;
    document.getElementById("cd-mins").innerText = minutes < 10 ? "0" + minutes : minutes;
    document.getElementById("cd-secs").innerText = seconds < 10 ? "0" + seconds : seconds;
}
setInterval(updateCountdown, 1000);

// ---------- 11. Typewriter Effect ----------
function typeWriter(text, i, elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (isAdmin) {
        el.innerHTML = text.replace(/\n/g, "<br>");
        return;
    }
    if (i < text.length) {
        let char = text.charAt(i);
        if (char === "\n") {
            el.innerHTML += "<br>";
        } else {
            el.innerHTML += char;
        }
        setTimeout(() => { typeWriter(text, i + 1, elementId); }, char === "." ? 400 : 55);
    }
}

// ---------- 12. Emoji Fix for Titles ----------
function preserveEmojiColor() {
    const targets = document.querySelectorAll('.title-main, .section-title');
    const emojiRegex = /([🩸🃏⏳🥹🫂💕🎮🌀🔒❤️⚔️⏰✨📸🦇🧠💗🌸🎵🌧️💒🔮])/g;
    targets.forEach(el => {
        if (!el || el.dataset.emojiFixed === "1") return;
        const original = el.innerHTML;
        if (!original || original.indexOf('<span class="emoji-fix">') !== -1) return;
        el.innerHTML = original.replace(emojiRegex, '<span class="emoji-fix">$1</span>');
        el.dataset.emojiFixed = "1";
    });
}

// ---------- 13. Particles & Soft Hearts ----------
function createCrimsonParticles() {
    for (let i = 0; i < 40; i++) {
        let p = document.createElement("div");
        p.className = "particle";
        let size = Math.random() * 5 + 3;
        p.style.width = size + "px";
        p.style.height = size + "px";
        p.style.left = Math.random() * 100 + "vw";
        p.style.background = '#C5283D';
        p.style.boxShadow = '0 0 15px #C5283D';
        p.style.animationDuration = (Math.random() * 9 + 5) + "s";
        p.style.animationDelay = Math.random() * 3 + "s";
        document.body.appendChild(p);
    }
}
function createSoftHearts() {
    for (let i = 0; i < 15; i++) {
        const heart = document.createElement("div");
        heart.className = "soft-heart";
        heart.textContent = ["💖", "✨", "🫶", "💕"][Math.floor(Math.random() * 4)];
        heart.style.left = Math.random() * 100 + "vw";
        heart.style.bottom = (-20 - Math.random() * 60) + "px";
        heart.style.animationDuration = (10 + Math.random() * 8) + "s";
        heart.style.animationDelay = (Math.random() * 2) + "s";
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 20000);
    }
}
function startRosePetals() {
    const container = document.createElement('div');
    container.className = 'rose-petals-container';
    document.body.appendChild(container);
    function createPetal() {
        const petal = document.createElement('div');
        petal.className = 'rose-petal';
        petal.style.left = Math.random() * 100 + 'vw';
        petal.style.animationDuration = (Math.random() * 5 + 8) + 's';
        petal.style.opacity = Math.random() * 0.6 + 0.2;
        container.appendChild(petal);
        setTimeout(() => petal.remove(), 15000);
    }
    for (let i = 0; i < 10; i++) {
        setTimeout(createPetal, i * 400);
    }
    setInterval(createPetal, 2000);
}

// ---------- 14. Romantic Sound on Login ----------
function playRomanticSound() {
    try {
        let ctx = new (window.AudioContext || window.webkitAudioContext)();
        let t = ctx.currentTime;
        function playTone(freq, type, start, dur, vol) {
            let osc = ctx.createOscillator();
            let gain = ctx.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(vol, start + 0.3);
            gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + dur);
        }
        playTone(261.63, 'sine', t, 2.5, 0.3);
        playTone(329.63, 'sine', t + 0.3, 2.5, 0.3);
        playTone(392.00, 'sine', t + 0.6, 2.5, 0.3);
        playTone(523.25, 'triangle', t + 0.9, 2.8, 0.15);
    } catch(e) {}
}

// ---------- 15. Login & Entry ----------
function enter() {
    let p = document.getElementById("pass").value;
    if (p === "mobinloveniyayesh" || p === "adminwiriper") {
        if (p === "adminwiriper") {
            isAdmin = true;
            document.getElementById("upload-box").style.display = "block";
            document.getElementById("admin-save-bar").style.display = "flex";
        }
        document.getElementById("login-zone").style.display = "none";
        playRomanticSound();

        // Netflix intro
        const intro = document.getElementById("netflix-intro");
        intro.style.display = "flex";
        setTimeout(() => {
            intro.style.display = "none";
            const main = document.getElementById("main");
            main.style.display = "block";
            main.style.opacity = "1";
            preserveEmojiColor();
            if (isAdmin) enableEditableMode();
            createCrimsonParticles();
            createSoftHearts();
            startRosePetals();
            typeWriter(loveLetter, 0, "typed-text");
            loadFeed();
            initMemoryGame();
            updateCountdown();
            // Auto-play ambient? Already have toggle
        }, 3800);
    } else {
        alert("رمز ورود اشتباه است... دوباره تلاش کن عشق من");
    }
}

function enableEditableMode() {
    document.querySelectorAll('[data-key]').forEach(el => {
        el.setAttribute('contenteditable', 'true');
    });
}

// ---------- 16. Firebase & Feed ----------
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

db.collection("website_data").doc("texts").onSnapshot((doc) => {
    if (doc.exists) {
        const data = doc.data();
        if (data.love_letter) { loveLetter = data.love_letter; }
        document.querySelectorAll('[data-key]').forEach(el => {
            const key = el.getAttribute('data-key');
            if (data[key] !== undefined) {
                if (key === "love_letter" && document.getElementById("main").style.display !== "block") return;
                el.innerHTML = data[key];
            }
        });
        preserveEmojiColor();
    }
});

db.collection("website_data").doc("config").get().then((doc) => {
    if (doc.exists) {
        const data = doc.data();
        if (data.tvd_video_url) {
            const frame = document.getElementById("tvd-iframe");
            if (frame) frame.src = data.tvd_video_url;
        }
    }
});

function saveWebsiteTexts() {
    if (!isAdmin) return;
    const updatedTexts = {};
    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        let content = el.innerHTML;
        if (key === "love_letter") content = el.innerHTML.replace(/<br\s*\/?>/gi, "\n");
        updatedTexts[key] = content;
    });
    db.collection("website_data").doc("texts").set(updatedTexts, { merge: true })
        .then(() => alert("تغییرات با موفقیت برای نیایش اعمال شد! ❤️"))
        .catch(err => alert("خطا در ذخیره."));
}

function triggerUpload() {
    if (isAdmin) document.getElementById('file-input').click();
}

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const memoryText = prompt("یه متن قشنگ برای این خاطره بنویس:");
    if (memoryText === null) return;
    const uploadBox = document.getElementById("upload-box");
    uploadBox.innerHTML = "⏳ در حال آپلود...";
    uploadBox.style.pointerEvents = "none";
    const isVideo = file.type.startsWith('video');
    const storageRef = storage.ref('memories/' + Date.now() + '_' + file.name);
    try {
        const snapshot = await storageRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        await db.collection("memories").add({
            url: downloadURL,
            text: memoryText,
            type: isVideo ? 'video' : 'image',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert("خاطره ثبت شد!");
        uploadBox.innerHTML = `<span style="font-size: 2rem; display: block; margin-bottom: 10px;">📸</span> ثبت یک خاطره جدید`;
        uploadBox.style.pointerEvents = "auto";
    } catch (error) {
        console.error(error);
        alert("خطا در آپلود.");
        uploadBox.innerHTML = `<span style="font-size: 2rem; display: block; margin-bottom: 10px;">📸</span> ثبت یک خاطره جدید`;
        uploadBox.style.pointerEvents = "auto";
    }
}

function loadFeed() {
    db.collection("memories").orderBy("timestamp", "desc").onSnapshot(snapshot => {
        const postsArea = document.getElementById('posts-area');
        if (!postsArea) return;
        postsArea.innerHTML = '';
        if (snapshot.empty) {
            postsArea.innerHTML = `<p style="text-align:center; color:gray;">خاطره‌ای نیست.</p>`;
            return;
        }
        snapshot.forEach(doc => {
            const data = doc.data();
            let mediaHtml = data.type === 'video'
                ? `<video src="${data.url}" class="post-video" controls></video>`
                : `<img src="${data.url}" class="post-img" loading="lazy">`;
            postsArea.innerHTML += `<div class="post-card"><div class="post-header"><div class="avatar">M</div><div><div style="font-weight: 700;">Mobin</div><div style="font-size: 0.75rem; color: #C5283D;">عاشق‌ترین پسر دنیا</div></div></div>${mediaHtml}<div class="post-content">${data.text}</div></div>`;
        });
    });
}

// ---------- 17. Scroll Reveal ----------
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(el => {
        const windowHeight = window.innerHeight;
        const elementTop = el.getBoundingClientRect().top;
        if (elementTop < windowHeight - 80) {
            el.classList.add('active');
        }
    });
}
window.addEventListener('scroll', revealOnScroll);

// ---------- 18. Navbar Active on Scroll ----------
window.addEventListener('scroll', () => {
    document.querySelectorAll('.web-section[id]').forEach(sec => {
        const top = sec.getBoundingClientRect().top;
        if (top < window.innerHeight / 2 && top > -sec.offsetHeight / 2) {
            document.querySelectorAll('.navbar a').forEach(a => a.classList.remove('active'));
            const target = document.querySelector(`.navbar a[href="#${sec.id}"]`);
            if (target) target.classList.add('active');
        }
    });
});

// ---------- 19. Initial Calls ----------
document.addEventListener("DOMContentLoaded", () => {
    preserveEmojiColor();
    // Memory game initialized only after login
});
