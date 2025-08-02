// animations.js

// Функция для создания снежинок
function createSnowflakes() {
    const snowflakesContainer = document.getElementById('snowflakes');
    const snowflakeCount = 50;

    for (let i = 0; i < snowflakeCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        snowflake.innerHTML = '❄';
        snowflakesContainer.appendChild(snowflake);

        const size = Math.random() * 1 + 0.5;
        const startPositionX = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = Math.random() * 3 + 5;

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

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    createSnowflakes();
});
