<template>
  <div id="app">
    <div v-if="loading" class="app-loading">
      <div class="loading-content">
        <div class="spinner"></div>
        <p>Загрузка приложения...</p>
      </div>
    </div>

    <div v-else-if="error" class="global-error">
      <div class="error-content">
        <h3>Ошибка приложения</h3>
        <p>{{ error }}</p>
        <button @click="reloadPage" class="reload-btn">Перезагрузить страницу</button>
      </div>
    </div>

    <router-view v-else />
  </div>
</template>

<script>
import { brokersStore } from './stores/brokers.js'

export default {
  name: 'App',
  data() {
    return {
      loading: true,
      error: null
    }
  },
  async mounted() {
    try {
      console.log('🚀 App mounted, checking authentication...')

      // Ждем инициализации хранилища
      await new Promise(resolve => setTimeout(resolve, 100))

      if (brokersStore.isLoggedIn) {
        console.log('✅ User is logged in, redirecting to trading...')
        // Пользователь авторизован, перенаправляем на торговую площадку
        if (this.$route.path === '/') {
          this.$router.push('/trading')
        }
      } else {
        console.log('❌ User is not logged in, staying on login page')
        // Пользователь не авторизован, остаемся на странице входа
        if (this.$route.path !== '/') {
          this.$router.push('/')
        }
      }

      this.loading = false
    } catch (error) {
      console.error('❌ App initialization error:', error)
      this.error = error.message
      this.loading = false
    }
  },
  methods: {
    reloadPage() {
      window.location.reload()
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', sans-serif;
  background: #121212;
  color: #ffffff;
}

#app {
  min-height: 100vh;
}

.app-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #121212;
}

.loading-content {
  text-align: center;
  color: #b0b0b0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #333;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.global-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #121212;
  padding: 20px;
}

.error-content {
  background: #1e1e1e;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #f44336;
  text-align: center;
  max-width: 500px;
}

.error-content h3 {
  color: #f44336;
  margin-bottom: 1rem;
}

.error-content p {
  margin-bottom: 1.5rem;
  color: #b0b0b0;
}

.reload-btn {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.reload-btn:hover {
  background: #5a6fd8;
}
</style>