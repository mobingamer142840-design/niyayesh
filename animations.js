const reveals = document.querySelectorAll('.reveal');

function revealSections(){

    reveals.forEach(el=>{

        const top = el.getBoundingClientRect().top;

        if(top < window.innerHeight - 100){

            el.classList.add('active');

        }

    });

}

window.addEventListener('scroll', revealSections);

revealSections();


// Floating Hearts

document.addEventListener('click', e=>{

    if(
        e.target.closest('button') ||
        e.target.closest('a') ||
        e.target.closest('input')
    ) return;

    const heart = document.createElement('div');

    heart.innerHTML = '💕';

    heart.style.position = 'fixed';

    heart.style.left = e.clientX + 'px';

    heart.style.top = e.clientY + 'px';

    heart.style.pointerEvents = 'none';

    heart.style.fontSize = '1.5rem';

    heart.style.zIndex = '999999';

    heart.style.transition = '1.2s ease';

    document.body.appendChild(heart);

    requestAnimationFrame(()=>{

        heart.style.transform =
        'translateY(-120px) scale(1.8)';

        heart.style.opacity = '0';

    });

    setTimeout(()=>{

        heart.remove();

    },1200);

});
