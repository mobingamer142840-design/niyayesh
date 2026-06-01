// ================= تنظیمات Firebase و متغیرهای اصلی =================
const firebaseConfig = {
    apiKey: "AIzaSyDsqisH5TT77Wq1qJ8_gljRs7wnzH8h0PQ",
    authDomain: "niyayesh-universe.firebaseapp.com",
    projectId: "niyayesh-universe",
    storageBucket: "niyayesh-universe.firebasestorage.app",
    messagingSenderId: "675804346928",
    appId: "1:675804346928:web:8e8c33f7a26d2824340bf5"
};

let db;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
} catch(e) {
    console.warn("Firebase connection limited");
}

let activeUserRole = 'guest';
let activeUsername = 'مهمان';
let chatHistory = [];
let aiResponses = {};

// ================= توابع احراز هویت =================
function toggleAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById(`pane-${tab}`).classList.add('active');
}

function verifyKingdomAccess() {
    const username = document.getElementById('login-uid').value.trim();
    const password = document.getElementById('login-token').value.trim();
    
    if (!username || !password) {
        showAlert('لطفا نام کاربری و رمز عبور را وارد کنید', '⚠️');
        return;
    }
    
    // شبیه‌سازی احراز هویت
    if (username === 'mobin' && password === 'love' || username === 'niyayesh' && password === 'forever') {
        activeUsername = username;
        activeUserRole = 'admin';
        enterKingdom();
    } else {
        showAlert('نام کاربری یا رمز عبور نادرست است', '❌');
    }
}

function registerKingdomGuest() {
    const name = document.getElementById('reg-alias').value.trim();
    const username = document.getElementById('reg-uid').value.trim();
    
    if (!name || !username) {
        showAlert('تمام فیلدها الزامی است', '⚠️');
        return;
    }
    
    activeUsername = username;
    activeUserRole = 'guest';
    enterKingdom();
}

function enterKingdom() {
    // نمایش اینترو نتفلیکسی
    const intro = document.getElementById('netflix-intro');
    intro.style.display = 'flex';
    
    const text = document.getElementById('netflix-core');
    text.innerText = activeUsername.toUpperCase();
    text.classList.add('animate-zoom');
    
    setTimeout(() => {
        intro.style.display = 'none';
        text.classList.remove('animate-zoom');
        
        // مخفی کردن صفحه لاگین و نمایش محتوا
        document.getElementById('auth-gate').style.display = 'none';
        document.getElementById('main-kingdom').style.display = 'block';
        document.getElementById('main-navigation').classList.add('show-nav');
        document.getElementById('dm-icon-container').style.display = 'block';
        
        setTimeout(() => {
            document.getElementById('main-kingdom').style.opacity = '1';
        }, 100);
        
        showAlert(`خوش آمدید ${activeUsername} 👑`, '✨');
        setupScrollAnimations();
    }, 4000);
}

// ================= توابع رابط کاربری =================
function showAlert(message, icon = '👑') {
    const alert = document.getElementById('custom-alert');
    document.getElementById('alert-crown').innerText = icon;
    document.getElementById('alert-text-content').innerText = message;
    alert.classList.add('show');
    
    setTimeout(() => {
        alert.classList.remove('show');
    }, 3000);
}

function openSettingsModal() {
    document.getElementById('settings-modal').style.display = 'flex';
}

function closeSettingsModal() {
    document.getElementById('settings-modal').style.display = 'none';
}

function toggleSetting(element) {
    element.classList.toggle('active');
    const isActive = element.classList.contains('active');
    const label = element.parentElement.querySelector('span');
    label.innerText = isActive ? 'فعال' : 'غیرفعال';
    localStorage.setItem(element.id, isActive);
}

function toggleDMPanel() {
    // می‌تواند به یک پنل جانبی یا مدال منتقل شود
    document.getElementById('dm-sec').scrollIntoView({ behavior: 'smooth' });
}

// ================= توابع استوری‌ها =================
function openStoryViewerModal(imgUrl) {
    const modal = document.getElementById('story-viewer-gate');
    const modalImg = document.getElementById('story-modal-img-source');
    modalImg.src = imgUrl;
    modal.style.display = 'flex';
}

function closeStoryViewerModal() {
    document.getElementById('story-viewer-gate').style.display = 'none';
}

function addNewStory() {
    const url = document.getElementById('story-url-input').value.trim();
    
    if (!url) {
        showAlert('لطفا لینک عکس را وارد کنید', '⚠️');
        return;
    }
    
    const wrapper = document.querySelector('.story-wrapper');
    const newStory = document.createElement('div');
    newStory.className = 'story-ring';
    newStory.innerHTML = `
        <div class="story-clip" style="background-image: url('${url}');" onclick="openStoryViewerModal('${url}')"></div>
    `;
    wrapper.appendChild(newStory);
    
    document.getElementById('story-url-input').value = '';
    showAlert('استوری جدید اضافه شد ✨', '🎉');
}

// ================= توابع موزیک =================
function loadMusic() {
    const url = document.getElementById('music-url-input').value.trim();
    
    if (!url) {
        showAlert('لطفا لینک فایل موسیقی را وارد کنید', '⚠️');
        return;
    }
    
    const player = document.getElementById('music-player');
    player.src = url;
    player.play();
    showAlert('موسیقی در حال پخش است 🎵', '🎧');
}

// ================= توابع جستجو =================
function performSearch() {
    const query = document.getElementById('search-input').value.trim();
    
    if (!query) {
        showAlert('کلمه‌ی جستجو را وارد کنید', '⚠️');
        return;
    }
    
    const resultsDiv = document.getElementById('search-results');
    resultsDiv.innerHTML = '';
    
    // شبیه‌سازی نتایج جستجو
    const results = [
        `نتیجه 1: مقاله درباره "${query}"`,
        `نتیجه 2: تصویر مرتبط با "${query}"`,
        `نتیجه 3: ویدیو درباره "${query}"`,
        `نتیجه 4: پیوند به "${query}"`
    ];
    
    results.forEach((result, index) => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.innerHTML = result;
        item.onclick = () => {
            showAlert(`انتخاب کردید: ${result}`, '🔍');
        };
        resultsDiv.appendChild(item);
    });
    
    showAlert(`${results.length} نتیجه برای "${query}" پیدا شد`, '🔎');
}

// ================= توابع هوش مصنوعی =================
function sendAIMessage() {
    const input = document.getElementById('ai-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // افزودن پیام کاربر
    addChatMessage(message, 'user');
    input.value = '';
    
    // شبیه‌سازی پاسخ AI
    setTimeout(() => {
        const responses = [
            'درباره این موضوع اطلاعات دارم! 🤖',
            'این سوال جالبی است! ✨',
            'می‌توانم کمک کنم: ...',
            'بر اساس دانش من، ...',
            'این یکی از بهترین سوالات است!'
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addChatMessage(randomResponse, 'ai');
    }, 500);
}

function addChatMessage(text, sender) {
    const messagesDiv = document.getElementById('chat-messages');
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${sender}`;
    messageEl.textContent = text;
    messagesDiv.appendChild(messageEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// ================= توابع Direct Message =================
function sendDirectMessage() {
    const username = document.getElementById('dm-username').value.trim();
    const text = document.getElementById('dm-text').value.trim();
    
    if (!username || !text) {
        showAlert('نام کاربری و پیام الزامی است', '⚠️');
        return;
    }
    
    const messagesDiv = document.getElementById('dm-messages');
    const message = document.createElement('div');
    message.style.cssText = `
        background: linear-gradient(135deg, var(--mobin-blue), #001133);
        padding: 12px 15px;
        border-radius: 12px;
        margin-bottom: 10px;
        color: white;
        border-right: 3px solid var(--royal-gold);
    `;
    message.innerHTML = `<strong>به ${username}:</strong> ${text}`;
    messagesDiv.appendChild(message);
    
    document.getElementById('dm-username').value = '';
    document.getElementById('dm-text').value = '';
    
    showAlert(`پیام برای ${username} ارسال شد 📨`, '✅');
}

// ================= انیمیشن‌های Scroll =================
function setupScrollAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });
    
    reveals.forEach(el => observer.observe(el));
}

// ================= انیمیشن ذرات طلا =================
function initGoldenParticles() {
    const canvas = document.getElementById('gold-particles');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let particles = [];
    
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.2
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
            
            ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// ================= مقدار دهی اولیه =================
document.addEventListener('DOMContentLoaded', () => {
    initGoldenParticles();
    
    // بارگذاری تنظیمات ذخیره شده
    if (localStorage.getItem('sound-toggle') === 'false') {
        document.getElementById('sound-toggle').classList.remove('active');
    }
    if (localStorage.getItem('dark-toggle') === 'false') {
        document.getElementById('dark-toggle').classList.remove('active');
    }
    if (localStorage.getItem('effects-toggle') === 'false') {
        document.getElementById('effects-toggle').classList.remove('active');
    }
});

// تنظیم اندازه canvas هنگام تغییر اندازه پنجره
window.addEventListener('resize', () => {
    const canvas = document.getElementById('gold-particles');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});
