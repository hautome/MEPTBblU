// animations.js

// Функция для создания снежинок
function createSnowflakes() {
    const snowflakesContainer = document.getElementById('snowflakes');
    const snowflakeCount = 50; // Количество снежинок

    for (let i = 0; i < snowflakeCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        snowflake.innerHTML = '❄'; // Или используйте другие символы
        snowflakesContainer.appendChild(snowflake);

        // Случайные стили для каждой снежинки
        const size = Math.random() * 1 + 0.5; // Размер от 0.5 до 1.5em
        const startPositionX = Math.random() * 100; // Начальная позиция по X от 0 до 100%
        const delay = Math.random() * 5; // Задержка анимации от 0 до 5s
        const duration = Math.random() * 3 + 5; // Продолжительность от 5 до 8s

        snowflake.style.left = `${startPositionX}vw`;
        snowflake.style.fontSize = `${size}em`;
        snowflake.style.opacity = Math.random();
        snowflake.style.animation = `fall ${duration}s linear ${delay}s infinite`;
    }
}

// Добавляем CSS для анимации падения снежинок
const style = document.createElement('style');
style.innerHTML = `
    @keyframes fall {
        0% {
            transform: translateY(-10vh) translateX(0) rotate(0deg);
        }
        100% {
            transform: translateY(100vh) translateX(20px) rotate(360deg);
        }
    }
`;
document.head.appendChild(style);

// Функция для имитации загрузки
function simulateLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingProgress = document.querySelector('.loading-progress');
    const mainContent = document.getElementById('main-content');

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            // Скрываем экран загрузки и показываем контент
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                loadingScreen.style.visibility = 'hidden';
                mainContent.style.opacity = '1';
            }, 300);
        }
        loadingProgress.style.width = `${progress}%`;
    }, 100);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    createSnowflakes();
    simulateLoading();
});
