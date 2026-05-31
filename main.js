const passwordInput =
document.getElementById('password');

const loginBtn =
document.getElementById('login-btn');

const intro =
document.getElementById('intro-screen');

const loginScreen =
document.getElementById('login-screen');

const main =
document.getElementById('main-content');

const themeToggle =
document.getElementById('theme-toggle');

const loveLetterText = `

نیایش عزیزم...

تو قشنگ‌ترین اتفاق زندگی منی.

کنار تو دنیا آروم‌تره،
زمان قشنگ‌تره،
و قلبم کامل‌تر می‌تپه.

دوست دارم تا بی‌نهایت...
💕
`;

function typeLetter(){

    const target =
    document.getElementById('love-letter');

    let i = 0;

    function typing(){

        if(i < loveLetterText.length){

            target.innerHTML +=
            loveLetterText.charAt(i);

            i++;

            setTimeout(typing,35);

        }

    }

    typing();

}

window.addEventListener('load',()=>{

    setTimeout(()=>{

        intro.style.display = 'none';

    },4000);

});

loginBtn.addEventListener('click',()=>{

    const value =
    passwordInput.value;

    if(
        value === 'mobinloveniyayesh'
    ){

        loginScreen.style.display = 'none';

        main.style.display = 'block';

        typeLetter();

    }
    else{

        alert('رمز اشتباهه 💔');

    }

});

// ORACLE

const quotes = [

    'تو آرامش قلب منی 🌊',

    'عشق تو واقعی‌ترین چیز دنیاست ✨',

    'کنار تو آینده قشنگه 💕',

    'تو خونه‌ی قلب منی 🫂'

];

const orb =
document.getElementById('magic-orb');

const oracleText =
document.getElementById('oracle-text');

orb.addEventListener('click',()=>{

    const random =
    quotes[
        Math.floor(
            Math.random()*quotes.length
        )
    ];

    oracleText.innerHTML = random;

});

// THEME

themeToggle.addEventListener('click',()=>{

    document.body.classList.toggle('light');

});

