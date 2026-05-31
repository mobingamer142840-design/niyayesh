let isAdmin = false;
let loveLetter = `نیایش عزیزم،\n\nنمی‌دونم چطور بگم ولی تو برای من فقط یه آدم نیستی… یه حسِ آروم و قشنگی که توی شلوغ‌ترین لحظه‌های زندگی هم منو نگه می‌داره.\n\nبا تو حتی روزای بدم از بین می‌رن. یه پیام از تو می‌تونه حال منو عوض کنه...\n\nباعشق 🫂💕\nMobin`;

// ورود و انیمیشن اولیه
function enter(){
    let p = document.getElementById("pass").value;
    if(p === "mobinloveniyayesh" || p === "adminwiriper"){
        if(p === "adminwiriper") isAdmin = true;
        document.getElementById("login-zone").style.display = "none";
        const intro = document.getElementById("netflix-intro");
        intro.style.display = "flex";
        setTimeout(() => {
            intro.style.display = "none";
            const mainContent = document.getElementById("main");
            mainContent.style.display = "block";
            setTimeout(() => { 
                mainContent.style.opacity = "1"; 
                revealOnScroll();
            }, 100);
            createSoftHearts();
            typeWriter(loveLetter, 0, "typed-text");
        }, 3800);
    } else { alert("رمز ورود اشتباه است... دوباره تلاش کن عشق من"); }
}

// افکت تایپ
function typeWriter(text, i, elementId) {
    if (i < text.length) {
        let char = text.charAt(i);
        if(char === "\n") document.getElementById(elementId).innerHTML += "<br>";
        else document.getElementById(elementId).innerHTML += char;
        setTimeout(() => typeWriter(text, i + 1, elementId), char === "." ? 400 : 55);
    } else {
        setTimeout(() => {
            document.getElementById("music-container").classList.add("show");
            document.getElementById("navbar").classList.add("show-nav"); 
        }, 600);
    }
}

// تغییر تم با ترانزیشن نرم
function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    const btn = document.getElementById("theme-toggle");
    btn.innerHTML = document.body.classList.contains("dark-mode") ? "🍷" : "🌙";
    btn.style.transform = "scale(0.8) rotate(180deg)";
    setTimeout(() => btn.style.transform = "scale(1) rotate(0)", 300);
}

// اسکرول و نمایش آیتم‌ها
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(reveal => {
        if (reveal.getBoundingClientRect().top < window.innerHeight - 50) {
            reveal.classList.add('active');
        }
    });
}
window.addEventListener('scroll', revealOnScroll);

// بقیه توابع مثل createSoftHearts, Firebase Config, Countdown و... رو دقیقا مثل فایل قبلیت اینجا پیست کن.
// هیچکدوم از اون منطق‌ها رو تغییر ندادم که دیتابیسِ فایربیسِت به هم نریزه.
