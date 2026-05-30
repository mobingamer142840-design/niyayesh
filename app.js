let isAdmin = false;
let loveLetter = `نیایش عزیزم،\n\nنمی‌دونم چطور بگم ولی تو برای من فقط یه آدم نیستی… یه حسِ آروم و قشنگی که توی شلوغ‌ترین لحظه‌های زندگی هم منو نگه می‌داره تو فرشته‌می.\n\nبا تو حتی روزای بدم از بین می‌رن. یه پیام از تو می‌تونه حال منو عوض کنه و یه فکر کوچیک ازت می‌تونه بهم آرامش بده.\n\nقول میدم یه زندگی برات بسازم که پر از آرامش باشه و اینو بدون همیشه کنارتم.\n\nدوست دارم مال منی:)\n\nباعشق 🫂💕🥹\nMobin`;

// --- Custom Cursor Logic ---
const cursorDot = document.getElementById('cursor-dot');
const cursorOutline = document.getElementById('cursor-outline');

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX; const posY = e.clientY;
    cursorDot.style.left = `${posX}px`; cursorDot.style.top = `${posY}px`;
    // Add slight delay for outline
    setTimeout(() => {
        cursorOutline.style.left = `${posX}px`; cursorOutline.style.top = `${posY}px`;
    }, 50);
});
document.querySelectorAll('button, a, .tarot-card, .blood-pact-container').forEach(el => {
    el.addEventListener('mouseenter', () => cursorOutline.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursorOutline.classList.remove('hover'));
});

// --- Main Flow ---
function enter(){
    let p = document.getElementById("pass").value;
    if(p === "mobinloveniyayesh" || p === "adminwiriper"){
        if(p === "adminwiriper") {
            isAdmin = true;
            document.getElementById("upload-box").style.display = "block";
            document.getElementById("admin-save-bar").style.display = "flex";
        }
        document.getElementById("login-zone").style.display = "none";
        
        const intro = document.getElementById("netflix-intro");
        intro.style.display = "flex";
        setTimeout(() => {
            intro.style.display = "none";
            const mainContent = document.getElementById("main");
            mainContent.style.display = "block";
            setTimeout(() => { 
                mainContent.style.opacity = "1"; 
                if(isAdmin) { enableEditableMode(); }
                revealOnScroll(); 
            }, 100);
            typeWriter(loveLetter, 0, "typed-text");
            loadFeed(); 
        }, 3800);
    } else { 
        alert("رمز ورود اشتباه است... دوباره تلاش کن عشق من"); 
    }
}

function typeWriter(text, i, elementId) {
    if(isAdmin) {
        document.getElementById(elementId).innerHTML = text.replace(/\n/g, "<br>");
        finishTypewriter(); return;
    }
    if (i < text.length) {
        let char = text.charAt(i);
        if(char === "\n") { document.getElementById(elementId).innerHTML += "<br>"; } 
        else { document.getElementById(elementId).innerHTML += char; }
        setTimeout(() => { typeWriter(text, i + 1, elementId); }, char === "." ? 300 : 45);
    } else { finishTypewriter(); }
}

function finishTypewriter() {
    setTimeout(() => {
        document.getElementById("music-container").classList.add("show");
        document.getElementById("navbar").classList.add("show-nav"); 
    }, 600);
}

// --- Blood Pact Logic ---
function activateBloodPact() {
    const fill = document.getElementById('blood-fill');
    const msg = document.getElementById('pact-message');
    fill.style.height = '100%';
    setTimeout(() => { msg.classList.add('show'); }, 2000);
}

// --- Voice Note Player ---
let isPlayingVoice = false;
function toggleVoicePlay(btn) {
    const wave = document.querySelector('.audio-wave');
    isPlayingVoice = !isPlayingVoice;
    if(isPlayingVoice) {
        btn.innerText = "⏸"; wave.classList.add('playing');
        // اینجا می‌تونی کد پخش فایل صوتی واقعی رو بذاری:
        // let audio = new Audio('your-voice.mp3'); audio.play();
    } else {
        btn.innerText = "▶"; wave.classList.remove('playing');
    }
}

// --- Scroll Reveal ---
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        if (elementTop < windowHeight - 100) {
            reveals[i].classList.add('active');
        }
    }
}
window.addEventListener('scroll', revealOnScroll);

// --- Countdown ---
const targetDate = new Date("Sep 15, 2026 00:00:00").getTime(); 
function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;
    if(distance < 0) return; 
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

// --- Modals & Portal ---
function openSecret() {
    const modal = document.getElementById("secret-modal");
    modal.style.display = "flex"; setTimeout(() => { modal.style.opacity = "1"; }, 10);
}
function closeSecret() {
    const modal = document.getElementById("secret-modal");
    modal.style.opacity = "0";
    setTimeout(() => { 
        modal.style.display = "none"; document.getElementById("secret-content").style.display = "none";
    }, 500);
}
function checkSecret() {
    if(document.getElementById("secret-pass").value === "niyayeshlovemobin") {
        document.getElementById("secret-content").style.display = "block";
    } else { alert("رمز اشتباه است."); }
}

let vortexAnimation;
function openPortal() {
    const portal = document.getElementById("vampire-portal");
    portal.style.display = "block";
    setTimeout(() => {
        document.getElementById("vortexCanvas").style.opacity = "1";
        document.getElementById("portal-dim").style.opacity = "1";
        startVortexCanvas();
    }, 100);
}
function closePortal() {
    document.getElementById("portal-dim").style.opacity = "0";
    document.getElementById("vortexCanvas").style.opacity = "0";
    setTimeout(() => { document.getElementById("vampire-portal").style.display = "none"; cancelAnimationFrame(vortexAnimation); }, 1000);
}
function startVortexCanvas() {
    const canvas = document.getElementById('vortexCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    let particles = [];
    for(let i=0; i<300; i++) {
        particles.push({ angle: Math.random() * Math.PI * 2, radius: Math.random() * canvas.width, speed: Math.random() * 0.05 + 0.01, size: Math.random() * 3, color: Math.random() > 0.5 ? '#ff1a40' : '#8b0000' });
    }
    function drawVortex() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.angle += p.speed; p.radius -= p.radius * 0.02;
            if(p.radius < 5) { p.radius = canvas.width; }
            ctx.beginPath(); ctx.arc(canvas.width/2 + Math.cos(p.angle) * p.radius, canvas.height/2 + Math.sin(p.angle) * p.radius, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color; ctx.shadowBlur = 10; ctx.shadowColor = p.color; ctx.fill();
        });
        vortexAnimation = requestAnimationFrame(drawVortex);
    }
    drawVortex();
}

function enableEditableMode() { document.querySelectorAll('[data-key]').forEach(el => { el.setAttribute('contenteditable', 'true'); }); }

// --- Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSyDsqisH5TT77Wq1qJ8_gljRs7wnzH8h0PQ",
    authDomain: "niyayesh-universe.firebaseapp.com",
    projectId: "niyayesh-universe",
    storageBucket: "niyayesh-universe.firebasestorage.app",
    messagingSenderId: "675804346928",
    appId: "1:675804346928:web:8e8c33f7a26d2824340bf5"
};
if(!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.firestore();
const storage = firebase.storage();

db.collection("website_data").doc("texts").onSnapshot((doc) => {
    if (doc.exists) {
        const data = doc.data();
        if(data.love_letter) { loveLetter = data.love_letter; }
        document.querySelectorAll('[data-key]').forEach(el => {
            const key = el.getAttribute('data-key');
            if(data[key] !== undefined && key !== "love_letter") { el.innerHTML = data[key]; }
        });
    }
});

function saveWebsiteTexts() {
    if(!isAdmin) return;
    const updatedTexts = {};
    document.querySelectorAll('[data-key]').forEach(el => {
        let content = el.innerHTML;
        if(el.getAttribute('data-key') === "love_letter") { content = el.innerHTML.replace(/<br\s*\/?>/gi, "\n"); }
        updatedTexts[el.getAttribute('data-key')] = content;
    });
    db.collection("website_data").doc("texts").set(updatedTexts, { merge: true }).then(() => alert("تغییرات ذخیره شد! ❤️"));
}

function triggerUpload() { if(isAdmin) document.getElementById('file-input').click(); }
async function handleFileUpload(event) {
    const file = event.target.files[0]; if(!file) return;
    const memoryText = prompt("یه متن قشنگ بنویس:"); if(memoryText === null) return;
    const isVideo = file.type.startsWith('video');
    const storageRef = storage.ref('memories/' + Date.now() + '_' + file.name);
    try {
        const snapshot = await storageRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        await db.collection("memories").add({ url: downloadURL, text: memoryText, type: isVideo ? 'video' : 'image', timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        alert("آپلود شد!");
    } catch (error) { alert("خطا در آپلود."); }
}
function loadFeed() {
    db.collection("memories").orderBy("timestamp", "desc").onSnapshot(snapshot => {
        const postsArea = document.getElementById('posts-area'); postsArea.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            let media = data.type === 'video' ? `<video src="${data.url}" class="post-video" controls></video>` : `<img src="${data.url}" class="post-img" style="width:100%; border-radius:10px;">`;
            postsArea.innerHTML += `<div class="post-card" style="margin-bottom:20px; padding:15px;"><div style="color:#ff1a40; font-weight:bold; margin-bottom:10px;">Mobin</div>${media}<div style="margin-top:15px; color:#ddd;">${data.text}</div></div>`;
        });
    });
}
