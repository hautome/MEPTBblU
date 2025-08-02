// animations.js - Улучшенная версия

// Конфигурация анимаций
const ANIMATION_CONFIG = {
    snowflakeCount: 40,
    maxSnowflakeSize: 2.0,
    minSnowflakeSize: 0.8,
    fallDuration: { min: 10, max: 20 },
    windEffect: 80,
    opacityRange: { min: 0.4, max: 0.9 }
};

// Класс для управления снежинками
class SnowflakeManager {
    constructor() {
        this.snowflakes = [];
        this.container = null;
        this.isActive = false;
        this.animationFrame = null;
    }

    init() {
        this.container = document.getElementById('snowflakes');
        if (!this.container) return;
        
        this.createSnowflakes();
        this.startAnimation();
        this.isActive = true;
    }

    createSnowflakes() {
        for (let i = 0; i < ANIMATION_CONFIG.snowflakeCount; i++) {
            this.createSnowflake();
        }
    }

    createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        
        // Случайные символы снежинок для горной темы
        const snowflakeSymbols = ['❄', '❅', '❆', '❉', '❊', '❋', '•', '·', '✦', '✧'];
        snowflake.innerHTML = snowflakeSymbols[Math.floor(Math.random() * snowflakeSymbols.length)];
        
        // Случайные параметры
        const size = Math.random() * (ANIMATION_CONFIG.maxSnowflakeSize - ANIMATION_CONFIG.minSnowflakeSize) + ANIMATION_CONFIG.minSnowflakeSize;
        const startX = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = Math.random() * (ANIMATION_CONFIG.fallDuration.max - ANIMATION_CONFIG.fallDuration.min) + ANIMATION_CONFIG.fallDuration.min;
        const opacity = Math.random() * (ANIMATION_CONFIG.opacityRange.max - ANIMATION_CONFIG.opacityRange.min) + ANIMATION_CONFIG.opacityRange.min;
        const wind = (Math.random() - 0.5) * ANIMATION_CONFIG.windEffect;

        // Устанавливаем стили
        snowflake.style.cssText = `
            left: ${startX}vw;
            font-size: ${size}em;
            opacity: ${opacity};
            animation: fall ${duration}s linear ${delay}s infinite;
            transform: translateX(${wind}px);
        `;

        // Добавляем данные для анимации
        snowflake.dataset.wind = wind;
        snowflake.dataset.speed = duration;
        
        this.container.appendChild(snowflake);
        this.snowflakes.push(snowflake);
    }

    startAnimation() {
        if (this.animationFrame) return;
        
        const animate = () => {
            this.updateSnowflakes();
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        animate();
    }

    updateSnowflakes() {
        this.snowflakes.forEach(snowflake => {
            // Добавляем легкое покачивание
            const time = Date.now() * 0.001;
            const wind = parseFloat(snowflake.dataset.wind);
            const sway = Math.sin(time + wind) * 2;
            
            snowflake.style.transform = `translateX(${wind + sway}px)`;
        });
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.isActive = false;
        this.snowflakes = [];
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Класс для управления анимациями страницы
class PageAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        this.intersectionObserver = null;
    }

    init() {
        this.setupIntersectionObserver();
        this.addScrollEffects();
        this.addHoverEffects();
        this.addTypingEffect();
    }

    setupIntersectionObserver() {
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, this.observerOptions);

        // Наблюдаем за элементами для анимации
        const animatedElements = document.querySelectorAll('.social-link, .bio-content, .views-content');
        animatedElements.forEach(el => {
            this.intersectionObserver.observe(el);
        });
    }

    addScrollEffects() {
        let ticking = false;
        
        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            const background = document.querySelector('.background-image');
            
            if (background) {
                background.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
            
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick, { passive: true });
    }

    addHoverEffects() {
        // Эффект магнитного притяжения для ссылок
        const links = document.querySelectorAll('.social-link');
        
        links.forEach(link => {
            link.addEventListener('mousemove', (e) => {
                const rect = link.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const deltaX = (x - centerX) / centerX;
                const deltaY = (y - centerY) / centerY;
                
                link.style.transform = `translateY(-3px) scale(1.02) translateX(${deltaX * 5}px) translateY(${deltaY * 5}px)`;
            });
            
            link.addEventListener('mouseleave', () => {
                link.style.transform = '';
            });
        });
    }

    addTypingEffect() {
        const nameElement = document.querySelector('.profile-name');
        if (!nameElement) return;

        const letters = nameElement.querySelectorAll('.blood-text');
        letters.forEach((letter, index) => {
            letter.style.opacity = '0';
            letter.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                letter.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                letter.style.opacity = '1';
                letter.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
}

// Класс для управления счетчиком просмотров
class ViewCounter {
    constructor() {
        this.counterElement = document.getElementById('view-count');
        this.currentValue = 0;
        this.targetValue = 0;
        this.isAnimating = false;
    }

    async updateCount() {
        try {
            const response = await fetch('https://api.countapi.xyz/hit/notso6er-github-io/visits');
            if (response.ok) {
                const data = await response.json();
                this.targetValue = data.value;
                this.animateCount();
            } else {
                this.showError();
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
            this.showError();
        }
    }

    animateCount() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        const duration = 2000; // 2 секунды
        const startTime = performance.now();
        const startValue = this.currentValue;
        const valueDifference = this.targetValue - startValue;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Функция плавности
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            
            this.currentValue = Math.floor(startValue + (valueDifference * easeOutQuart));
            
            if (this.counterElement) {
                this.counterElement.textContent = this.currentValue.toLocaleString('ru-RU');
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
            }
        };

        requestAnimationFrame(animate);
    }

    showError() {
        if (this.counterElement) {
            this.counterElement.textContent = 'Ошибка';
            this.counterElement.style.color = 'var(--warning-color)';
        }
    }
}

// Класс для управления интерактивностью
class InteractiveManager {
    constructor() {
        this.friendsToggle = document.getElementById('friends-toggle');
        this.friendsList = document.getElementById('friends-list');
        this.toggleIcon = document.getElementById('toggle-icon');
        this.isExpanded = false;
    }

    init() {
        this.setupEventListeners();
        this.addKeyboardSupport();
    }

    setupEventListeners() {
        if (this.friendsToggle) {
            this.friendsToggle.addEventListener('click', () => this.toggleFriends());
            this.friendsToggle.addEventListener('mouseenter', () => this.addHoverEffect());
            this.friendsToggle.addEventListener('mouseleave', () => this.removeHoverEffect());
        }
    }

    addKeyboardSupport() {
        if (this.friendsToggle) {
            this.friendsToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleFriends();
                }
            });
        }
    }

    toggleFriends() {
        this.isExpanded = !this.isExpanded;
        
        if (this.isExpanded) {
            this.expandFriends();
        } else {
            this.collapseFriends();
        }
    }

    expandFriends() {
        if (this.friendsList) {
            this.friendsList.style.display = 'flex';
            this.friendsList.style.opacity = '0';
            this.friendsList.style.transform = 'translateY(-10px)';
            
            requestAnimationFrame(() => {
                this.friendsList.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                this.friendsList.style.opacity = '1';
                this.friendsList.style.transform = 'translateY(0)';
            });
        }
        
        if (this.toggleIcon) {
            this.toggleIcon.classList.remove('fa-chevron-down');
            this.toggleIcon.classList.add('fa-chevron-up');
        }
        
        if (this.friendsToggle) {
            this.friendsToggle.setAttribute('aria-expanded', 'true');
        }
    }

    collapseFriends() {
        if (this.friendsList) {
            this.friendsList.style.opacity = '0';
            this.friendsList.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                this.friendsList.style.display = 'none';
            }, 300);
        }
        
        if (this.toggleIcon) {
            this.toggleIcon.classList.remove('fa-chevron-up');
            this.toggleIcon.classList.add('fa-chevron-down');
        }
        
        if (this.friendsToggle) {
            this.friendsToggle.setAttribute('aria-expanded', 'false');
        }
    }

    addHoverEffect() {
        if (this.friendsToggle) {
            this.friendsToggle.style.transform = 'translateX(5px) scale(1.02)';
        }
    }

    removeHoverEffect() {
        if (this.friendsToggle) {
            this.friendsToggle.style.transform = '';
        }
    }
}

// Основной класс приложения
class BioApp {
    constructor() {
        this.snowflakeManager = new SnowflakeManager();
        this.pageAnimations = new PageAnimations();
        this.viewCounter = new ViewCounter();
        this.interactiveManager = new InteractiveManager();
    }

    init() {
        // Ждем загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    start() {
        // Инициализируем все компоненты
        this.snowflakeManager.init();
        this.pageAnimations.init();
        this.interactiveManager.init();
        
        // Обновляем счетчик просмотров
        this.viewCounter.updateCount();
        
        // Устанавливаем текущий год
        this.updateYear();
        
        // Добавляем обработчики событий
        this.addEventListeners();
        
        console.log('Bio App инициализирована успешно!');
    }

    updateYear() {
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    addEventListeners() {
        // Обработчик изменения размера окна
        window.addEventListener('resize', this.debounce(() => {
            // Пересоздаем снежинки при изменении размера
            this.snowflakeManager.destroy();
            setTimeout(() => this.snowflakeManager.init(), 100);
        }, 250));

        // Обработчик видимости страницы
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.snowflakeManager.destroy();
            } else {
                this.snowflakeManager.init();
            }
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Добавляем CSS для анимации падения снежинок
const style = document.createElement('style');
style.innerHTML = `
    @keyframes fall {
        0% {
            transform: translateY(-10vh) translateX(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) translateX(30px) rotate(720deg);
            opacity: 0;
        }
    }
    
    .animate-in {
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .snowflake {
        color: #ffffff;
        text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
        filter: drop-shadow(0 0 2px rgba(135, 206, 235, 0.5));
    }
`;
document.head.appendChild(style);

// Инициализация приложения
const app = new BioApp();
app.init();
