<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <h1 class="login-title">Биржа акций</h1>
        <p class="login-subtitle">Войдите в систему торгов</p>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="brokerName" class="form-label">Имя брокера:</label>
            <input
                id="brokerName"
                v-model="brokerName"
                type="text"
                class="form-input"
                placeholder="Введите ваше имя"
                required
            />
          </div>

          <button
              type="submit"
              class="login-btn"
              :disabled="loading"
          >
            {{ loading ? 'Вход...' : 'Войти в систему' }}
          </button>
        </form>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="brokers-list" v-if="availableBrokers.length > 0">
          <h3>Или выберите существующего брокера:</h3>
          <div
              v-for="broker in availableBrokers"
              :key="broker.id"
              class="broker-item"
              @click="selectBroker(broker.name)"
          >
            {{ broker.name }} - {{ formatBalance(broker.currentBalance) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { brokersStore } from '../stores/brokers.js'

export default {
  name: 'LoginPage',
  data() {
    return {
      brokerName: '',
      loading: false,
      error: '',
      availableBrokers: []
    }
  },

  async mounted() {
    await this.loadBrokers()
  },

  methods: {
    formatBalance(balance) {
      return new Intl.NumberFormat('ru-RU').format(balance) + ' $'
    },

    async loadBrokers() {
      try {
        console.log('Loading brokers...')
        const response = await fetch('http://localhost:3011/api/brokers')
        if (!response.ok) throw new Error('Failed to load brokers')

        this.availableBrokers = await response.json()
        console.log('Brokers loaded:', this.availableBrokers)
      } catch (error) {
        console.error('Error loading brokers:', error)
        this.error = 'Ошибка загрузки списка брокеров'
      }
    },

    selectBroker(name) {
      this.brokerName = name
    },

    async handleLogin() {
      if (!this.brokerName.trim()) {
        this.error = 'Введите имя брокера'
        return
      }

      this.loading = true
      this.error = ''

      try {
        console.log('Starting login process...')
        await brokersStore.loginBroker(this.brokerName)
        await brokersStore.loadStocks()

        console.log('Login successful, redirecting...')
        this.$router.push('/trading')
      } catch (error) {
        console.error('Login failed:', error)
        this.error = error.message || 'Ошибка входа'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  color: #333;
}

.login-title {
  text-align: center;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-size: 2rem;
}

.login-subtitle {
  text-align: center;
  margin-bottom: 2rem;
  color: #7f8c8d;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.login-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #e74c3c;
  color: white;
  border-radius: 6px;
  text-align: center;
}

.brokers-list {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
}

.brokers-list h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1rem;
}

.broker-item {
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.broker-item:hover {
  background: #e9ecef;
}
</style>