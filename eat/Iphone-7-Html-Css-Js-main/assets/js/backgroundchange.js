document.addEventListener('DOMContentLoaded', function () {
  let currentIndex = 0;

  const images = [
    'url(assets/images/background1.jpg)',
    'url(assets/images/background2.jpg)',
    'url(assets/images/background3.png)'
  ];

  function updateSlide() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach(dot => dot.classList.remove('active'));
    dots[currentIndex].classList.add('active');

    const container = document.querySelector('.faker-phone--screen');
    container.style.backgroundImage = images[currentIndex];
  }

  function changeSlide(index) {
    currentIndex = index;
    updateSlide();
  }

  setInterval(function () {
    currentIndex = (currentIndex + 1) % images.length;
    updateSlide();
  }, 5000);

  updateSlide();
});