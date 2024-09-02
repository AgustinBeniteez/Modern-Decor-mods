document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.hero-image-slider img');
    const notification = document.querySelector('.notification');
    const notificationText = document.getElementById('notification-text');

    const notifications = [
        'Información sobre la primera imagen.',
        'Información sobre la segunda imagen.',
        'Información sobre la tercera imagen.',
        'Información sobre la cuarta imagen.',
        // Añade más mensajes si tienes más imágenes
    ];

    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
    }

    function updateNotification(index) {
        notificationText.textContent = notifications[index];
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5500); // La notificación estará visible por 2.5 segundos
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
        updateNotification(currentSlide);
    }

    showSlide(currentSlide);
    updateNotification(currentSlide);
    setInterval(nextSlide, 6000); // Cambia la imagen cada 3 segundos
});
