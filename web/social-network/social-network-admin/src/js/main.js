// Основной клиентский JavaScript файл приложения
import '../less/main.less';

class SocialNetwork {
    constructor() {
        this.init();
    }

    // Инициализация приложения после загрузки DOM
    init() {
        this.bindEvents();
        this.applyRedDarkTheme();
    }

    // Применение темной темы с красными акцентами
    applyRedDarkTheme() {
        document.body.classList.add('dark-theme', 'red-theme');

        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
        }

        this.enhanceCards();
    }

    // Улучшение карточек с анимациями при наведении
    enhanceCards() {
        const cards = document.querySelectorAll('.user-card, .friend-card, .news-post');
        cards.forEach(card => {
            card.style.transition = 'all 0.4s ease';

            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
                card.style.boxShadow = '0 12px 40px rgba(220, 38, 38, 0.3)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = '';
            });
        });

        this.enhanceBadges();
    }

    // Анимация бейджей при наведении
    enhanceBadges() {
        const badges = document.querySelectorAll('.badge');
        badges.forEach(badge => {
            badge.style.transition = 'all 0.3s ease';

            badge.addEventListener('mouseenter', () => {
                badge.style.transform = 'scale(1.1)';
                badge.style.filter = 'brightness(1.2)';
            });

            badge.addEventListener('mouseleave', () => {
                badge.style.transform = 'scale(1)';
                badge.style.filter = 'brightness(1)';
            });
        });
    }

    // Привязка обработчиков событий
    bindEvents() {
        this.addSmoothAnimations();

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn')) {
                this.handleButtonClick(e.target);
            }
        });
    }

    // Плавное появление элементов при скролле
    addSmoothAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.user-card, .news-post').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });
    }

    // Анимация нажатия кнопок
    handleButtonClick(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    // Показать уведомление пользователю
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = `
            top: 20px; 
            right: 20px; 
            z-index: 1050; 
            min-width: 350px;
            background: linear-gradient(135deg, var(--bs-${type}), #b91c1c);
            color: white;
            border: none;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
            border-left: 4px solid #ff6b6b;
            font-weight: 600;
        `;
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
                <strong>${message}</strong>
            </div>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    }
}

// Инициализация приложения после полной загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    new SocialNetwork();
});

// Добавление CSS переменных для темы
const style = document.createElement('style');
style.textContent = `
    :root {
        --primary-red: #dc2626;
        --dark-bg: #0f0f0f;
        --dark-card: #1a1a1a;
        --text-white: #ffffff;
    }
    
    .red-theme {
        color-scheme: dark;
    }
`;
document.head.appendChild(style);