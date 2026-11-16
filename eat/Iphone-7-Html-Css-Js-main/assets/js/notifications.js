let container = document.getElementById('container');
let divTexts = ['Nowa Wiadomość!', 'Wiadomość Mail!', 'Powiadomienie Ig!'];
let divIcons = ['fa-solid fa-message', 'fa-solid fa-envelope', 'fa-brands fa-square-instagram']
let currentIndex = 0;

function changeDivText() {
    let newText = divTexts[currentIndex];
    let iconClass = divIcons[currentIndex];

    let div = document.createElement('div');
    div.classList.add('new-div');

    let messageIcon = document.createElement('i');
    messageIcon.classList.add('fa', ...iconClass.split(' '));

    div.appendChild(messageIcon);

    let p = document.createElement('p');
    p.textContent = newText;

    div.appendChild(p);

    gsap.set(div, { opacity: 0, y: 20 });

    container.insertBefore(div, container.firstChild);

    gsap.to(div, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' });

    gsap.to(div, { opacity: 0, y: -20, duration: 1, ease: 'power2.in', delay: 3 });

    currentIndex = (currentIndex + 1) % divTexts.length;

    setTimeout(() => {
        while (container.children.length > 1) {
            container.removeChild(container.lastChild);
        }
    }, 4000);
}

setInterval(changeDivText, 5000);
setInterval(changeDivText, 8000);
