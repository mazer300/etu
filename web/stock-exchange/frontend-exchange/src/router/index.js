import { createRouter, createWebHistory } from 'vue-router'
import { brokersStore } from '../stores/brokers.js'
import LoginPage from '../pages/LoginPage.vue'
import TradingPage from '../pages/TradingPage.vue'
import PortfolioPage from '../pages/PortfolioPage.vue'

const routes = [
    {
        path: '/',
        name: 'Login',
        component: LoginPage,
        meta: { requiresAuth: false }
    },
    {
        path: '/trading',
        name: 'Trading',
        component: TradingPage,
        meta: { requiresAuth: true }
    },
    {
        path: '/portfolio',
        name: 'Portfolio',
        component: PortfolioPage,
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Навигационные хуки
router.beforeEach((to, from, next) => {
    console.log('🛣️ Navigation from:', from.path, 'to:', to.path)
    console.log('🔐 Auth status:', brokersStore.isLoggedIn)

    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

    if (requiresAuth && !brokersStore.isLoggedIn) {
        // Пользователь не авторизован и пытается получить доступ к защищенному маршруту
        console.log('🚫 Access denied, redirecting to login')
        next('/')
    } else if (!requiresAuth && brokersStore.isLoggedIn) {
        // Пользователь авторизован и пытается получить доступ к странице входа
        console.log('✅ User is logged in, redirecting to trading')
        next('/trading')
    } else {
        // Все в порядке, продолжаем навигацию
        next()
    }
})

export default router