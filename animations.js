/**
 * Enhanced Alpine Bio Page - Advanced JavaScript Module
 * Version: 2024.1.0
 * Author: notso6er
 * Description: Modern, modular, and performance-optimized JavaScript for alpine bio page
 */

'use strict';

// ===== CONSTANTS & CONFIGURATION =====
const CONFIG = {
    // Animation settings
    ANIMATION: {
        SNOWFLAKE_COUNT: 30,
        SNOWFLAKE_SIZE: { min: 0.8, max: 2.0 },
        FALL_DURATION: { min: 8, max: 15 },
        WIND_EFFECT: 60,
        OPACITY_RANGE: { min: 0.3, max: 0.8 }
    },
    
    // Performance settings
    PERFORMANCE: {
        MAX_FPS: 60,
        FRAME_TIME: 16.67, // 1000ms / 60fps
        DEBOUNCE_DELAY: 250,
        THROTTLE_DELAY: 16
    },
    
    // API settings
    API: {
        VIEW_COUNTER_URL: 'https://api.countapi.xyz/hit/notso6er-github-io/visits',
        TIMEOUT: 5000,
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000
    },
    
    // Theme settings
    THEMES: {
        LIGHT: 'alpine',
        DARK: 'dark'
    },
    
    // Languages
    LANGUAGES: {
        RU: 'ru',
        EN: 'en'
    }
};

// ===== UTILITY FUNCTIONS =====
class Utils {
    // Debounce function for performance optimization
    static debounce(func, wait) {
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
    
    // Throttle function for smooth animations
    static throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }
    
    // Random number generator with better distribution
    static randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    // Generate unique ID
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Safe element query with error handling
    static safeQuery(selector, parent = document) {
        try {
            return parent.querySelector(selector);
        } catch (error) {
            console.warn(`Failed to query selector: ${selector}`, error);
            return null;
        }
    }
    
    // Safe element query all with error handling
    static safeQueryAll(selector, parent = document) {
        try {
            return Array.from(parent.querySelectorAll(selector));
        } catch (error) {
            console.warn(`Failed to query selector: ${selector}`, error);
            return [];
        }
    }
    
    // Local storage with error handling
    static getFromStorage(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.warn(`Failed to get from storage: ${key}`, error);
            return defaultValue;
        }
    }
    
    static setToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn(`Failed to set to storage: ${key}`, error);
            return false;
        }
    }
    
    // Format number with locale
    static formatNumber(number, locale = 'ru-RU') {
        try {
            return new Intl.NumberFormat(locale).format(number);
        } catch (error) {
            return number.toString();
        }
    }
    
    // Check if element is in viewport
    static isInViewport(element) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
}

// ===== ERROR HANDLER =====
class ErrorHandler {
    static log(error, context = 'Unknown') {
        console.error(`[${context}] Error:`, error);
        
        // Optionally send to analytics service
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: `${context}: ${error.message}`,
                fatal: false
            });
        }
    }
    
    static handle(error, context = 'Unknown', fallback = null) {
        this.log(error, context);
        return fallback;
    }
    
    static async handleAsync(promise, context = 'Unknown', fallback = null) {
        try {
            return await promise;
        } catch (error) {
            return this.handle(error, context, fallback);
        }
    }
}

// ===== PERFORMANCE MONITOR =====
class PerformanceMonitor {
    constructor() {
        this.fps = 0;
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.isMonitoring = false;
        this.fpsElement = Utils.safeQuery('#fps-counter');
        this.loadTimeElement = Utils.safeQuery('#load-time');
        
        this.startTime = performance.now();
    }
    
    start() {
        if (this.isMonitoring) return;
        this.isMonitoring = true;
        this.monitor();
    }
    
    stop() {
        this.isMonitoring = false;
    }
    
    monitor() {
        if (!this.isMonitoring) return;
        
        const currentTime = performance.now();
        this.frameCount++;
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            this.updateDisplay();
        }
        
        requestAnimationFrame(() => this.monitor());
    }
    
    updateDisplay() {
        if (this.fpsElement) {
            this.fpsElement.textContent = this.fps;
        }
        
        if (this.loadTimeElement && this.startTime) {
            const loadTime = Math.round(performance.now() - this.startTime);
            this.loadTimeElement.textContent = `${loadTime}ms`;
        }
    }
    
    getPerformanceData() {
        return {
            fps: this.fps,
            loadTime: Math.round(performance.now() - this.startTime),
            memory: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                total: Math.round(performance.memory.totalJSHeapSize / 1048576)
            } : null
        };
    }
}

// ===== ENHANCED SNOWFLAKE MANAGER =====
class SnowflakeManager {
    constructor() {
        this.snowflakes = new Map();
        this.container = Utils.safeQuery('#snowflakes');
        this.isActive = false;
        this.animationFrame = null;
        this.lastUpdate = 0;
        this.windDirection = 0;
        this.windStrength = 1;
        
        this.init();
    }
    
    init() {
        if (!this.container) {
            console.warn('Snowflakes container not found');
            return;
        }
        
        this.createSnowflakes();
        this.startAnimation();
        this.addEventListeners();
    }
    
    createSnowflakes() {
        for (let i = 0; i < CONFIG.ANIMATION.SNOWFLAKE_COUNT; i++) {
            this.createSnowflake();
        }
    }
    
    createSnowflake() {
        try {
            const id = Utils.generateId();
            const element = document.createElement('div');
            element.className = 'snowflake';
            element.id = `snowflake-${id}`;
            
            // Random snowflake symbols for alpine theme
            const symbols = ['❄', '❅', '❆', '❉', '❊', '❋', '•', '·', '✦', '✧', '⋄', '◊'];
            element.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            
            const snowflake = {
                element,
                x: Utils.randomBetween(0, window.innerWidth),
                y: Utils.randomBetween(-100, -10),
                size: Utils.randomBetween(CONFIG.ANIMATION.SNOWFLAKE_SIZE.min, CONFIG.ANIMATION.SNOWFLAKE_SIZE.max),
                speed: Utils.randomBetween(0.5, 2),
                wind: Utils.randomBetween(-1, 1),
                opacity: Utils.randomBetween(CONFIG.ANIMATION.OPACITY_RANGE.min, CONFIG.ANIMATION.OPACITY_RANGE.max),
                rotation: 0,
                rotationSpeed: Utils.randomBetween(-2, 2)
            };
            
            this.updateSnowflakeStyle(snowflake);
            this.container.appendChild(element);
            this.snowflakes.set(id, snowflake);
            
            return snowflake;
        } catch (error) {
            ErrorHandler.handle(error, 'SnowflakeManager.createSnowflake');
        }
    }
    
    updateSnowflakeStyle(snowflake) {
        const { element, x, y, size, opacity, rotation } = snowflake;
        element.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            font-size: ${size}em;
            opacity: ${opacity};
            transform: rotate(${rotation}deg);
            pointer-events: none;
            user-select: none;
            will-change: transform;
            color: rgba(255, 255, 255, ${opacity});
            text-shadow: 0 0 ${size * 5}px rgba(255, 255, 255, 0.5);
        `;
    }
    
    startAnimation() {
        if (this.animationFrame) return;
        this.isActive = true;
        this.animate();
    }
    
    animate(currentTime = 0) {
        if (!this.isActive) return;
        
        const deltaTime = currentTime - this.lastUpdate;
        
        if (deltaTime >= CONFIG.PERFORMANCE.FRAME_TIME) {
            this.updateSnowflakes(deltaTime);
            this.lastUpdate = currentTime;
        }
        
        this.animationFrame = requestAnimationFrame((time) => this.animate(time));
    }
    
    updateSnowflakes(deltaTime) {
        const windForce = Math.sin(Date.now() * 0.001) * this.windStrength;
        
        for (const [id, snowflake] of this.snowflakes) {
            // Update position
            snowflake.y += snowflake.speed * (deltaTime / 16);
            snowflake.x += (snowflake.wind + windForce) * 0.5;
            snowflake.rotation += snowflake.rotationSpeed;
            
            // Reset if out of bounds
            if (snowflake.y > window.innerHeight + 50) {
                snowflake.y = Utils.randomBetween(-100, -10);
                snowflake.x = Utils.randomBetween(0, window.innerWidth);
            }
            
            if (snowflake.x > window.innerWidth + 50) {
                snowflake.x = -50;
            } else if (snowflake.x < -50) {
                snowflake.x = window.innerWidth + 50;
            }
            
            this.updateSnowflakeStyle(snowflake);
        }
    }
    
    addEventListeners() {
        // Mouse interaction for wind effect
        let mouseX = window.innerWidth / 2;
        
        const mouseHandler = Utils.throttle((e) => {
            const centerX = window.innerWidth / 2;
            const distance = (e.clientX - centerX) / centerX;
            this.windDirection = distance;
            this.windStrength = Math.abs(distance) * 2 + 0.5;
            mouseX = e.clientX;
        }, CONFIG.PERFORMANCE.THROTTLE_DELAY);
        
        document.addEventListener('mousemove', mouseHandler, { passive: true });
        
        // Visibility change handler
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }
    
    pause() {
        this.isActive = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
    
    resume() {
        if (!this.isActive && this.container) {
            this.startAnimation();
        }
    }
    
    destroy() {
        this.pause();
        this.snowflakes.clear();
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
    
    updateSettings(settings) {
        if (settings.count !== undefined) {
            const currentCount = this.snowflakes.size;
            if (settings.count > currentCount) {
                for (let i = 0; i < settings.count - currentCount; i++) {
                    this.createSnowflake();
                }
            } else if (settings.count < currentCount) {
                const toRemove = Array.from(this.snowflakes.keys()).slice(0, currentCount - settings.count);
                toRemove.forEach(id => {
                    const snowflake = this.snowflakes.get(id);
                    if (snowflake?.element) {
                        snowflake.element.remove();
                    }
                    this.snowflakes.delete(id);
                });
            }
        }
    }
}

// ===== PARTICLES SYSTEM =====
class ParticlesSystem {
    constructor() {
        this.canvas = Utils.safeQuery('#particles-canvas');
        this.ctx = null;
        this.particles = [];
        this.isActive = false;
        this.animationFrame = null;
        
        this.init();
    }
    
    init() {
        if (!this.canvas) {
            console.warn('Particles canvas not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.createParticles();
        this.start();
        
        window.addEventListener('resize', Utils.debounce(() => this.resize(), 250));
    }
    
    resize() {
        if (!this.canvas) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        this.particles = [];
        const particleCount = Math.min(50, Math.floor(window.innerWidth * window.innerHeight / 10000));
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                hue: Math.random() * 60 + 190 // Blue to cyan range
            });
        }
    }
    
    start() {
        if (!this.ctx) return;
        this.isActive = true;
        this.animate();
    }
    
    animate() {
        if (!this.isActive || !this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            this.updateParticle(particle);
            this.drawParticle(particle);
        });
        
        this.drawConnections();
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    
    updateParticle(particle) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
        
        // Keep in bounds
        particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
    }
    
    drawParticle(particle) {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`;
        this.ctx.fill();
    }
    
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const opacity = (100 - distance) / 100 * 0.2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(100, 200, 255, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }
    }
    
    stop() {
        this.isActive = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

// ===== ENHANCED VIEW COUNTER =====
class ViewCounter {
    constructor() {
        this.element = Utils.safeQuery('#view-count');
        this.currentValue = 0;
        this.targetValue = 0;
        this.isAnimating = false;
        this.retryCount = 0;
    }
    
    async updateCount() {
        try {
            const response = await this.fetchWithRetry();
            if (response && response.value) {
                this.targetValue = response.value;
                this.animateCount();
                this.saveToCache(response.value);
            } else {
                this.showError();
            }
        } catch (error) {
            ErrorHandler.handle(error, 'ViewCounter.updateCount');
            this.loadFromCache();
        }
    }
    
    async fetchWithRetry() {
        for (let i = 0; i < CONFIG.API.RETRY_ATTEMPTS; i++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), CONFIG.API.TIMEOUT);
                
                const response = await fetch(CONFIG.API.VIEW_COUNTER_URL, {
                    signal: controller.signal,
                    cache: 'no-cache'
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                if (i < CONFIG.API.RETRY_ATTEMPTS - 1) {
                    await new Promise(resolve => setTimeout(resolve, CONFIG.API.RETRY_DELAY * (i + 1)));
                }
            }
        }
        throw new Error('Failed to fetch view count after retries');
    }
    
    animateCount() {
        if (this.isAnimating || !this.element) return;
        
        this.isAnimating = true;
        const duration = 2000;
        const startTime = performance.now();
        const startValue = this.currentValue;
        const valueDifference = this.targetValue - startValue;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            
            this.currentValue = Math.floor(startValue + (valueDifference * easeOutQuart));
            this.element.textContent = Utils.formatNumber(this.currentValue);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    saveToCache(value) {
        Utils.setToStorage('viewCount', {
            value,
            timestamp: Date.now()
        });
    }
    
    loadFromCache() {
        const cached = Utils.getFromStorage('viewCount');
        if (cached && cached.value) {
            // Use cached value if less than 1 hour old
            const isRecent = Date.now() - cached.timestamp < 3600000;
            if (isRecent) {
                this.targetValue = cached.value;
                this.animateCount();
                return;
            }
        }
        this.showError();
    }
    
    showError() {
        if (this.element) {
            this.element.textContent = 'Ошибка';
            this.element.style.color = 'var(--error-color)';
        }
    }
}

// ===== THEME MANAGER =====
class ThemeManager {
    constructor() {
        this.currentTheme = Utils.getFromStorage('theme', CONFIG.THEMES.LIGHT);
        this.button = Utils.safeQuery('#theme-btn');
        this.body = document.body;
        
        this.init();
    }
    
    init() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
        this.detectSystemPreference();
    }
    
    setupEventListeners() {
        if (this.button) {
            this.button.addEventListener('click', () => this.toggleTheme());
        }
        
        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)')
                .addEventListener('change', (e) => this.handleSystemThemeChange(e));
        }
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === CONFIG.THEMES.LIGHT 
            ? CONFIG.THEMES.DARK 
            : CONFIG.THEMES.LIGHT;
        this.setTheme(newTheme);
    }
    
    setTheme(theme) {
        this.currentTheme = theme;
        this.applyTheme(theme);
        Utils.setToStorage('theme', theme);
        
        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    }
    
    applyTheme(theme) {
        if (this.body) {
            this.body.setAttribute('data-theme', theme);
        }
        
        if (this.button) {
            const icon = this.button.querySelector('i');
            if (icon) {
                icon.className = theme === CONFIG.THEMES.DARK ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }
    
    detectSystemPreference() {
        if (!Utils.getFromStorage('theme') && window.matchMedia) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setTheme(prefersDark ? CONFIG.THEMES.DARK : CONFIG.THEMES.LIGHT);
        }
    }
    
    handleSystemThemeChange(e) {
        // Only auto-switch if user hasn't manually set a theme
        if (!Utils.getFromStorage('theme')) {
            this.setTheme(e.matches ? CONFIG.THEMES.DARK : CONFIG.THEMES.LIGHT);
        }
    }
}

// ===== LANGUAGE MANAGER =====
class LanguageManager {
    constructor() {
        this.currentLanguage = Utils.getFromStorage('language', CONFIG.LANGUAGES.RU);
        this.selector = Utils.safeQuery('#lang-select');
        this.elements = new Map();
        
        this.init();
    }
    
    init() {
        this.scanElements();
        this.applyLanguage(this.currentLanguage);
        this.setupEventListeners();
    }
    
    scanElements() {
        const elements = Utils.safeQueryAll('[data-en][data-ru]');
        elements.forEach(element => {
            const id = Utils.generateId();
            this.elements.set(id, {
                element,
                en: element.getAttribute('data-en'),
                ru: element.getAttribute('data-ru')
            });
        });
    }
    
    setupEventListeners() {
        if (this.selector) {
            this.selector.value = this.currentLanguage;
            this.selector.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
    }
    
    setLanguage(language) {
        if (!Object.values(CONFIG.LANGUAGES).includes(language)) return;
        
        this.currentLanguage = language;
        this.applyLanguage(language);
        Utils.setToStorage('language', language);
        
        if (this.selector) {
            this.selector.value = language;
        }
        
        // Dispatch language change event
        window.dispatchEvent(new CustomEvent('languagechange', { detail: { language } }));
    }
    
    applyLanguage(language) {
        this.elements.forEach(({ element, en, ru }) => {
            const text = language === CONFIG.LANGUAGES.EN ? en : ru;
            if (text) {
                element.textContent = text;
            }
        });
    }
}

// ===== ANALYTICS MANAGER =====
class AnalyticsManager {
    constructor() {
        this.timeSpent = 0;
        this.clickCount = 0;
        this.startTime = Date.now();
        this.isActive = true;
        
        this.timeElement = Utils.safeQuery('#time-spent');
        this.clickElement = Utils.safeQuery('#click-count');
        this.statusElement = Utils.safeQuery('#online-status');
        
        this.init();
    }
    
    init() {
        this.startTimeTracking();
        this.trackClicks();
        this.trackVisibility();
        this.updateStatus();
    }
    
    startTimeTracking() {
        setInterval(() => {
            if (this.isActive && !document.hidden) {
                this.timeSpent++;
                this.updateTimeDisplay();
            }
        }, 1000);
    }
    
    trackClicks() {
        document.addEventListener('click', (e) => {
            // Only count meaningful clicks (links, buttons)
            if (e.target.closest('a, button, [role="button"]')) {
                this.clickCount++;
                this.updateClickDisplay();
                
                // Track specific interactions
                this.trackInteraction(e.target);
            }
        });
    }
    
    trackVisibility() {
        document.addEventListener('visibilitychange', () => {
            this.isActive = !document.hidden;
        });
    }
    
    trackInteraction(element) {
        const type = element.tagName.toLowerCase();
        const identifier = element.id || element.className || 'unknown';
        
        // Send to analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'click', {
                event_category: 'engagement',
                event_label: `${type}-${identifier}`,
                value: 1
            });
        }
    }
    
    updateTimeDisplay() {
        if (this.timeElement) {
            const hours = Math.floor(this.timeSpent / 3600);
            const minutes = Math.floor((this.timeSpent % 3600) / 60);
            const seconds = this.timeSpent % 60;
            
            let display = '';
            if (hours > 0) display += `${hours}h `;
            if (minutes > 0) display += `${minutes}m `;
            display += `${seconds}s`;
            
            this.timeElement.textContent = display;
        }
    }
    
    updateClickDisplay() {
        if (this.clickElement) {
            this.clickElement.textContent = this.clickCount;
        }
    }
    
    updateStatus() {
        if (this.statusElement) {
            this.statusElement.textContent = '●';
            this.statusElement.style.color = 'var(--success-color)';
            this.statusElement.title = 'Онлайн';
        }
    }
    
    getAnalyticsData() {
        return {
            timeSpent: this.timeSpent,
            clickCount: this.clickCount,
            sessionStart: this.startTime,
            isActive: this.isActive
        };
    }
}

// ===== SETTINGS MANAGER =====
class SettingsManager {
    constructor() {
        this.settings = Utils.getFromStorage('settings', {
            particles: true,
            sound: false,
            animationSpeed: 1,
            language: CONFIG.LANGUAGES.RU
        });
        
        this.panel = Utils.safeQuery('#settings-panel');
        this.toggle = Utils.safeQuery('#settings-toggle');
        this.content = Utils.safeQuery('#settings-content');
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.applySettings();
        this.bindControls();
    }
    
    setupEventListeners() {
        if (this.toggle) {
            this.toggle.addEventListener('click', () => this.togglePanel());
        }
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.panel && !this.panel.contains(e.target)) {
                this.closePanel();
            }
        });
    }
    
    bindControls() {
        // Particles toggle
        const particlesToggle = Utils.safeQuery('#particles-toggle');
        if (particlesToggle) {
            particlesToggle.checked = this.settings.particles;
            particlesToggle.addEventListener('change', (e) => {
                this.updateSetting('particles', e.target.checked);
            });
        }
        
        // Sound toggle
        const soundToggle = Utils.safeQuery('#sound-toggle');
        if (soundToggle) {
            soundToggle.checked = this.settings.sound;
            soundToggle.addEventListener('change', (e) => {
                this.updateSetting('sound', e.target.checked);
            });
        }
        
        // Animation speed
        const speedRange = Utils.safeQuery('#animation-speed');
        if (speedRange) {
            speedRange.value = this.settings.animationSpeed;
            speedRange.addEventListener('input', (e) => {
                this.updateSetting('animationSpeed', parseFloat(e.target.value));
            });
        }
    }
    
    togglePanel() {
        if (this.content) {
            this.content.classList.toggle('active');
        }
    }
    
    closePanel() {
        if (this.content) {
            this.content.classList.remove('active');
        }
    }
    
    updateSetting(key, value) {
        this.settings[key] = value;
        Utils.setToStorage('settings', this.settings);
        this.applySettings();
        
        // Dispatch settings change event
        window.dispatchEvent(new CustomEvent('settingschange', { 
            detail: { key, value, settings: this.settings } 
        }));
    }
    
    applySettings() {
        // Apply animation speed to CSS
        document.documentElement.style.setProperty(
            '--animation-speed', 
            this.settings.animationSpeed
        );
        
        // Apply particles setting
        const particlesCanvas = Utils.safeQuery('#particles-canvas');
        if (particlesCanvas) {
            particlesCanvas.style.display = this.settings.particles ? 'block' : 'none';
        }
    }
    
    getSetting(key) {
        return this.settings[key];
    }
}

// ===== INTERACTION MANAGER =====
class InteractionManager {
    constructor() {
        this.friendsToggle = Utils.safeQuery('#friends-toggle');
        this.friendsList = Utils.safeQuery('#friends-list');
        this.toggleIcon = Utils.safeQuery('#toggle-icon');
        this.isExpanded = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.addAccessibilityFeatures();
        this.enhanceHoverEffects();
    }
    
    setupEventListeners() {
        if (this.friendsToggle) {
            this.friendsToggle.addEventListener('click', () => this.toggleFriends());
            this.friendsToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleFriends();
                }
            });
        }
        
        // Contact form handling
        const contactForm = Utils.safeQuery('#contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
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
            this.friendsList.style.display = 'grid';
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
    
    addAccessibilityFeatures() {
        // Add focus indicators
        const focusableElements = Utils.safeQueryAll('a, button, [tabindex]:not([tabindex="-1"])');
        focusableElements.forEach(element => {
            element.addEventListener('focus', (e) => {
                e.target.style.outline = '2px solid var(--primary-color)';
                e.target.style.outlineOffset = '2px';
            });
            
            element.addEventListener('blur', (e) => {
                e.target.style.outline = '';
                e.target.style.outlineOffset = '';
            });
        });
    }
    
    enhanceHoverEffects() {
        // Magnetic effect for social links
        const socialLinks = Utils.safeQueryAll('.social-link');
        socialLinks.forEach(link => {
            link.addEventListener('mousemove', (e) => {
                const rect = link.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const deltaX = (x - centerX) / centerX;
                const deltaY = (y - centerY) / centerY;
                
                link.style.transform = `translateY(-3px) translateX(${deltaX * 3}px) translateY(${deltaY * 3}px)`;
            });
            
            link.addEventListener('mouseleave', () => {
                link.style.transform = '';
            });
        });
    }
    
    handleContactForm(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        // Basic validation
        if (!data.name || !data.message) {
            this.showFormMessage('Пожалуйста, заполните обязательные поля', 'error');
            return;
        }
        
        // Simulate form submission
        this.showFormMessage('Сообщение отправлено! Спасибо за обращение.', 'success');
        e.target.reset();
        
        // Track form submission
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                event_category: 'engagement',
                event_label: 'contact_form'
            });
        }
    }
    
    showFormMessage(message, type) {
        const existingMessage = Utils.safeQuery('.form-message');
        if (existingMessage) existingMessage.remove();
        
        const messageEl = document.createElement('div');
        messageEl.className = `form-message form-message--${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            padding: 1rem;
            margin-top: 1rem;
            border-radius: 0.5rem;
            font-weight: 500;
            background: ${type === 'success' ? 'var(--success-color)' : 'var(--error-color)'};
            color: white;
            animation: fadeInUp 0.3s ease-out;
        `;
        
        const form = Utils.safeQuery('#contact-form');
        if (form) {
            form.appendChild(messageEl);
            
            setTimeout(() => {
                messageEl.style.opacity = '0';
                setTimeout(() => messageEl.remove(), 300);
            }, 5000);
        }
    }
}

// ===== MAIN APPLICATION CLASS =====
class AlpineBioApp {
    constructor() {
        this.modules = new Map();
        this.isInitialized = false;
        this.startTime = performance.now();
        
        this.bindMethods();
    }
    
    bindMethods() {
        this.init = this.init.bind(this);
        this.start = this.start.bind(this);
        this.destroy = this.destroy.bind(this);
    }
    
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve, { once: true });
                });
            }
            
            // Initialize core modules
            await this.initializeModules();
            
            // Setup global event listeners
            this.setupGlobalEvents();
            
            // Start the application
            this.start();
            
            this.isInitialized = true;
            console.log(`✅ Alpine Bio App initialized in ${Math.round(performance.now() - this.startTime)}ms`);
            
        } catch (error) {
            ErrorHandler.handle(error, 'AlpineBioApp.init');
        }
    }
    
    async initializeModules() {
        const moduleInitializers = [
            ['performanceMonitor', () => new PerformanceMonitor()],
            ['snowflakeManager', () => new SnowflakeManager()],
            ['particlesSystem', () => new ParticlesSystem()],
            ['viewCounter', () => new ViewCounter()],
            ['themeManager', () => new ThemeManager()],
            ['languageManager', () => new LanguageManager()],
            ['analyticsManager', () => new AnalyticsManager()],
            ['settingsManager', () => new SettingsManager()],
            ['interactionManager', () => new InteractionManager()]
        ];
        
        for (const [name, initializer] of moduleInitializers) {
            try {
                const module = initializer();
                this.modules.set(name, module);
                console.log(`✓ Initialized ${name}`);
            } catch (error) {
                ErrorHandler.handle(error, `AlpineBioApp.initializeModules.${name}`);
            }
        }
    }
    
    setupGlobalEvents() {
        // Handle resize events
        const resizeHandler = Utils.debounce(() => {
            this.handleResize();
        }, CONFIG.PERFORMANCE.DEBOUNCE_DELAY);
        
        window.addEventListener('resize', resizeHandler);
        
        // Handle settings changes
        window.addEventListener('settingschange', (e) => {
            this.handleSettingsChange(e.detail);
        });
        
        // Handle theme changes
        window.addEventListener('themechange', (e) => {
            this.handleThemeChange(e.detail);
        });
        
        // Handle visibility changes
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // Handle errors
        window.addEventListener('error', (e) => {
            ErrorHandler.handle(e.error, 'GlobalError');
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            ErrorHandler.handle(e.reason, 'UnhandledPromiseRejection');
        });
    }
    
    start() {
        // Start performance monitoring
        const performanceMonitor = this.modules.get('performanceMonitor');
        if (performanceMonitor) {
            performanceMonitor.start();
        }
        
        // Update view counter
        const viewCounter = this.modules.get('viewCounter');
        if (viewCounter) {
            viewCounter.updateCount();
        }
        
        // Set current year
        this.updateYear();
        
        // Hide loading screen
        this.hideLoadingScreen();
        
        // Setup Konami code easter egg
        this.setupKonamiCode();
        
        console.log('🚀 Alpine Bio App started successfully');
    }
    
    hideLoadingScreen() {
        const loadingScreen = Utils.safeQuery('#loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 1500);
        }
    }
    
    updateYear() {
        const yearElement = Utils.safeQuery('#current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
    
    setupKonamiCode() {
        let konamiCode = [];
        const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
        
        document.addEventListener('keydown', (e) => {
            konamiCode.push(e.keyCode);
            if (konamiCode.length > konamiSequence.length) {
                konamiCode.shift();
            }
            if (konamiCode.toString() === konamiSequence.toString()) {
                this.showEasterEgg();
                konamiCode = [];
            }
        });
    }
    
    showEasterEgg() {
        const easterEgg = Utils.safeQuery('#easter-egg');
        if (easterEgg) {
            easterEgg.style.display = 'flex';
            
            // Add confetti effect
            this.createConfetti();
            
            // Track easter egg discovery
            if (typeof gtag !== 'undefined') {
                gtag('event', 'easter_egg_found', {
                    event_category: 'engagement',
                    event_label: 'konami_code'
                });
            }
        }
    }
    
    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f39c12', '#6c5ce7'];
        const container = document.body;
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}vw;
                top: -10px;
                z-index: 10001;
                pointer-events: none;
                animation: confettiFall 3s linear forwards;
            `;
            
            container.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }
        
        // Add confetti animation if not exists
        if (!document.querySelector('#confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style';
            style.textContent = `
                @keyframes confettiFall {
                    to {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    handleResize() {
        // Notify modules about resize
        const snowflakeManager = this.modules.get('snowflakeManager');
        if (snowflakeManager) {
            snowflakeManager.destroy();
            setTimeout(() => {
                this.modules.set('snowflakeManager', new SnowflakeManager());
            }, 100);
        }
    }
    
    handleSettingsChange({ key, value, settings }) {
        console.log(`Setting changed: ${key} = ${value}`);
        
        switch (key) {
            case 'particles':
                const particlesSystem = this.modules.get('particlesSystem');
                if (particlesSystem) {
                    if (value) {
                        particlesSystem.start();
                    } else {
                        particlesSystem.stop();
                    }
                }
                break;
                
            case 'animationSpeed':
                // Update animation speeds globally
                document.documentElement.style.setProperty('--animation-speed', value);
                break;
        }
    }
    
    handleThemeChange({ theme }) {
        console.log(`Theme changed to: ${theme}`);
        
        // Update particles color scheme if needed
        const particlesSystem = this.modules.get('particlesSystem');
        if (particlesSystem) {
            // Restart particles with new theme
            particlesSystem.stop();
            setTimeout(() => particlesSystem.start(), 100);
        }
    }
    
    handleVisibilityChange() {
        const isHidden = document.hidden;
        
        // Pause/resume animations when tab is not visible
        const snowflakeManager = this.modules.get('snowflakeManager');
        if (snowflakeManager) {
            if (isHidden) {
                snowflakeManager.pause();
            } else {
                snowflakeManager.resume();
            }
        }
        
        const particlesSystem = this.modules.get('particlesSystem');
        if (particlesSystem) {
            if (isHidden) {
                particlesSystem.stop();
            } else {
                particlesSystem.start();
            }
        }
    }
    
    getModule(name) {
        return this.modules.get(name);
    }
    
    getPerformanceData() {
        const performanceMonitor = this.modules.get('performanceMonitor');
        const analyticsManager = this.modules.get('analyticsManager');
        
        return {
            performance: performanceMonitor?.getPerformanceData(),
            analytics: analyticsManager?.getAnalyticsData(),
            modules: Array.from(this.modules.keys()),
            initTime: Math.round(performance.now() - this.startTime)
        };
    }
    
    destroy() {
        // Cleanup all modules
        this.modules.forEach(module => {
            if (typeof module.destroy === 'function') {
                module.destroy();
            }
        });
        
        this.modules.clear();
        this.isInitialized = false;
        
        console.log('🧹 Alpine Bio App destroyed');
    }
}

// ===== GLOBAL STYLES INJECTION =====
const injectStyles = () => {
    const style = document.createElement('style');
    style.id = 'alpine-bio-animations';
    style.textContent = `
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
            will-change: transform;
        }
        
        /* Performance optimizations */
        .social-link,
        .detail-item,
        .skill-tag,
        .project-card,
        .stat-card {
            will-change: transform;
        }
        
        /* Smooth scroll for internal links */
        html {
            scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
        }
        
        ::-webkit-scrollbar-track {
            background: var(--background-secondary);
        }
        
        ::-webkit-scrollbar-thumb {
            background: var(--primary-color);
            border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: var(--primary-dark);
        }
    `;
    
    document.head.appendChild(style);
};

// ===== INITIALIZATION =====
// Inject critical styles immediately
injectStyles();

// Create and initialize the application
const app = new AlpineBioApp();

// Start the application
app.init().catch(error => {
    ErrorHandler.handle(error, 'App Initialization');
});

// Expose app to global scope for debugging
if (typeof window !== 'undefined') {
    window.AlpineBioApp = app;
    window.AppUtils = Utils;
    window.AppConfig = CONFIG;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AlpineBioApp, Utils, CONFIG };
}

console.log('🏔️ Alpine Bio Page Enhanced JavaScript Loaded');
