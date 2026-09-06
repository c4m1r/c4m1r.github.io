document.addEventListener('DOMContentLoaded', function () {
    const fakePhone = document.getElementById('przemieszczalnyDiv');
    let isDragging = false;
    let offsetX, offsetY;

    document.addEventListener('keydown', function (event) {
        if (event.key === 'r' || event.key === 'R') {
            rotateFakePhone();
        }
    });

    fakePhone.addEventListener('mousedown', function (event) {
        isDragging = true;
        offsetX = event.clientX - fakePhone.getBoundingClientRect().left;
        offsetY = event.clientY - fakePhone.getBoundingClientRect().top;
    });

    document.addEventListener('mousemove', function (event) {
        if (isDragging) {
            const x = event.clientX - offsetX;
            const y = event.clientY - offsetY;

            fakePhone.style.left = x + 'px';
            fakePhone.style.top = y + 'px';
        }
    });

    document.addEventListener('mouseup', function () {
        isDragging = false;
    });

    function rotateFakePhone() {
        let currentRotation = getComputedStyle(fakePhone).getPropertyValue('--rotation') || 0;
        currentRotation = parseFloat(currentRotation);

        const newRotation = currentRotation + 90;

        fakePhone.style.setProperty('--rotation', newRotation);
        fakePhone.classList.add('rotated');
        fakePhone.style.transform = `rotate(${newRotation}deg)`;
    }
});
