<template>
  <div class="trading-page">
    <!-- Header -->
    <header class="trading-header">
      <div class="header-content">
        <h1>Торговая площадка</h1>
        <div class="trading-info">
          <div class="info-item">
            <span class="label">Текущая дата:</span>
            <span class="value">{{ currentDate || 'Не установлена' }}</span>
          </div>
          <div class="info-item" v-if="currentBroker">
            <span class="label">Брокер:</span>
            <span class="value">{{ currentBroker.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">Баланс:</span>
            <span class="value balance">{{ formatBalance(balance) }}</span>
          </div>
          <div class="info-item" v-if="exchangeConfig.isTrading">
            <span class="status trading-active">Торги активны</span>
          </div>
          <div class="info-item" v-else>
            <span class="status trading-paused">Торги приостановлены</span>
          </div>
        </div>
        <nav class="nav-links">
          <button @click="refreshData" class="nav-btn" :disabled="isRefreshing">
            {{ isRefreshing ? '🔄' : '🔄' }} Обновить
          </button>
          <button @click="goToPortfolio" class="nav-btn">📊 Портфель</button>
          <button @click="handleLogout" class="nav-btn logout">🚪 Выйти</button>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="trading-main">
      <!-- WebSocket Status -->
      <div class="connection-status" :class="isSocketConnected ? 'connected' : 'disconnected'">
        <span class="status-dot"></span>
        {{ isSocketConnected ? 'Подключено к бирже' : 'Нет подключения к бирже' }}
      </div>

      <!-- Stocks Grid -->
      <div class="stocks-section">
        <h2>Доступные акции</h2>
        <div class="stocks-grid">
          <div
              v-for="stock in activeStocks"
              :key="stock.symbol"
              class="stock-card"
              :class="{ 'in-portfolio': portfolio[stock.symbol] }"
          >
            <div class="stock-header">
              <h3 class="symbol">{{ stock.symbol }}</h3>
              <div class="company">{{ stock.companyName }}</div>
              <div class="sector">{{ stock.sector }}</div>
            </div>

            <div class="price-section">
              <div class="price">${{ stock.price.toFixed(2) }}</div>
              <div class="change" :class="stock.change >= 0 ? 'positive' : 'negative'">
                {{ stock.change >= 0 ? '+' : '' }}{{ stock.change.toFixed(2) }}
                ({{ stock.changePercent.toFixed(2) }}%)
              </div>
            </div>

            <div class="stock-description">
              {{ stock.description }}
            </div>

            <div class="portfolio-info" v-if="portfolio[stock.symbol]">
              <div class="portfolio-item">
                <span>В портфеле:</span>
                <strong>{{ portfolio[stock.symbol].quantity }} шт.</strong>
              </div>
              <div class="portfolio-item">
                <span>Средняя цена:</span>
                <strong>${{ portfolio[stock.symbol].averagePrice.toFixed(2) }}</strong>
              </div>
              <div class="portfolio-item">
                <span>Текущий P&L:</span>
                <strong :class="portfolio[stock.symbol].profit >= 0 ? 'positive' : 'negative'">
                  ${{ portfolio[stock.symbol].profit.toFixed(2) }}
                  ({{ portfolio[stock.symbol].profitPercent.toFixed(2) }}%)
                </strong>
              </div>
            </div>

            <div class="stock-actions">
              <button
                  @click="openChart(stock)"
                  class="action-btn chart"
                  title="Посмотреть график"
              >
                📊 График
              </button>
              <button
                  @click="openTradeDialog(stock, 'buy')"
                  class="action-btn buy"
                  :disabled="!exchangeConfig.isTrading"
              >
                Купить
              </button>
              <button
                  @click="openTradeDialog(stock, 'sell')"
                  class="action-btn sell"
                  :disabled="!portfolio[stock.symbol] || !exchangeConfig.isTrading"
                  v-if="portfolio[stock.symbol]"
              >
                Продать
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="activeStocks.length === 0" class="empty-state">
        <h3>Нет доступных акций</h3>
        <p>Акции временно недоступны или не активированы для торгов</p>
      </div>
    </main>

    <!-- Chart Dialog -->
    <StockChart
        :show="showChart"
        :stock="selectedStock"
        :portfolio="portfolio"
        @close="closeChart"
    />

    <!-- Trade Dialog -->
    <TradeDialog
        :show="showTradeDialog"
        :type="tradeType"
        :stock="selectedStock"
        @close="closeTradeDialog"
        @traded="onTradeExecuted"
    />

    <!-- Trade Notification -->
    <div v-if="showTradeNotification" class="trade-notification" :class="tradeNotificationType">
      {{ tradeNotificationMessage }}
    </div>
  </div>
</template>

<script>
import { brokersStore } from '../stores/brokers.js'
import StockChart from '../components/StockChart.vue'
import TradeDialog from '../components/TradeDialog.vue'

export default {
  name: 'TradingPage',
  components: {
    StockChart,
    TradeDialog
  },
  data() {
    return {
      isRefreshing: false,
      showChart: false,
      showTradeDialog: false,
      selectedStock: null,
      tradeType: 'buy',
      showTradeNotification: false,
      tradeNotificationMessage: '',
      tradeNotificationType: 'success'
    }
  },
  computed: {
    currentBroker() {
      return brokersStore.currentBroker
    },
    balance() {
      return brokersStore.balance
    },
    currentDate() {
      return brokersStore.currentDate
    },
    exchangeConfig() {
      return brokersStore.exchangeConfig
    },
    activeStocks() {
      return brokersStore.activeStocks
    },
    portfolio() {
      return brokersStore.portfolio
    },
    isSocketConnected() {
      return brokersStore.isSocketConnected
    }
  },
  async mounted() {
    console.log('🚀 TradingPage mounted')
    await this.loadData()
  },
  methods: {
    async loadData() {
      try {
        await brokersStore.loadStocks()
        await brokersStore.loadExchangeConfig()
        console.log('✅ Data loaded successfully')
      } catch (error) {
        console.error('❌ Error loading data:', error)
        this.showNotification('Ошибка загрузки данных', 'error')
      }
    },

    async refreshData() {
      this.isRefreshing = true
      try {
        await brokersStore.loadStocks()
        await brokersStore.loadExchangeConfig()
        this.showNotification('Данные обновлены', 'success')
      } catch (error) {
        console.error('❌ Error refreshing data:', error)
        this.showNotification('Ошибка обновления данных', 'error')
      } finally {
        this.isRefreshing = false
      }
    },

    openChart(stock) {
      this.selectedStock = stock
      this.showChart = true
    },

    closeChart() {
      this.showChart = false
      this.selectedStock = null
    },

    openTradeDialog(stock, type) {
      this.selectedStock = stock
      this.tradeType = type
      this.showTradeDialog = true
    },

    closeTradeDialog() {
      this.showTradeDialog = false
      this.selectedStock = null
      this.tradeType = 'buy'
    },

    onTradeExecuted(tradeData) {
      console.log('✅ Trade executed:', tradeData)
      const action = tradeData.type === 'buy' ? 'куплено' : 'продано'
      this.showNotification(
          `Успешно ${action} ${tradeData.quantity} акций ${tradeData.symbol}`,
          'success'
      )
    },

    showNotification(message, type = 'success') {
      this.tradeNotificationMessage = message
      this.tradeNotificationType = type
      this.showTradeNotification = true

      setTimeout(() => {
        this.showTradeNotification = false
      }, 3000)
    },

    formatBalance(balance) {
      return new Intl.NumberFormat('ru-RU').format(Math.round(balance)) + ' ₽'
    },

    goToPortfolio() {
      this.$router.push('/portfolio')
    },

    handleLogout() {
      brokersStore.logout()
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.trading-page {
  min-height: 100vh;
  background: #121212;
  color: white;
}

.trading-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-content h1 {
  margin: 0;
  font-size: 1.8rem;
  color: white;
}

.trading-info {
  display: flex;
  gap: 2rem;
  align-items: center;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.info-item .label {
  font-size: 0.8rem;
  opacity: 0.8;
  margin-bottom: 0.25rem;
}

.info-item .value {
  font-size: 1rem;
  font-weight: 600;
}

.info-item .balance {
  font-size: 1.1rem;
  color: #4CAF50;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.trading-active {
  background: #4CAF50;
  color: white;
}

.trading-paused {
  background: #ff9800;
  color: white;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
}

.nav-btn {
  padding: 0.5rem 1rem;
  background: rgba(255,255,255,0.2);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 0.9rem;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(255,255,255,0.3);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-btn.logout {
  background: rgba(231, 76, 60, 0.8);
}

.trading-main {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.connection-status.connected {
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid #4CAF50;
  color: #4CAF50;
}

.connection-status.disconnected {
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid #f44336;
  color: #f44336;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.connected .status-dot {
  background: #4CAF50;
  animation: pulse 2s infinite;
}

.disconnected .status-dot {
  background: #f44336;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.stocks-section h2 {
  margin-bottom: 1.5rem;
  color: white;
  font-size: 1.5rem;
}

.stocks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stock-card {
  background: #1e1e1e;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #333;
  transition: all 0.3s ease;
  position: relative;
}

.stock-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  border-color: #444;
}

.stock-card.in-portfolio {
  border-left: 4px solid #4CAF50;
}

.stock-header {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333;
}

.symbol {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
  color: #667eea;
}

.company {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: white;
}

.sector {
  font-size: 0.8rem;
  color: #888;
  background: #2d2d2d;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
}

.price-section {
  margin-bottom: 1rem;
  text-align: center;
}

.price {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: white;
}

.change {
  font-size: 1rem;
  font-weight: 600;
}

.change.positive {
  color: #4CAF50;
}

.change.negative {
  color: #f44336;
}

.stock-description {
  color: #b0b0b0;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.portfolio-info {
  background: #2d2d2d;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.portfolio-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.portfolio-item:last-child {
  margin-bottom: 0;
}

.portfolio-item span:first-child {
  color: #b0b0b0;
}

.stock-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
  min-width: 80px;
}

.action-btn.chart {
  background: #667eea;
  color: white;
}

.action-btn.buy {
  background: #4CAF50;
  color: white;
}

.action-btn.sell {
  background: #f44336;
  color: white;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn:not(:disabled):hover {
  transform: translateY(-1px);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #b0b0b0;
}

.empty-state h3 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.empty-state p {
  font-size: 1.1rem;
}

.trade-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  z-index: 1001;
  animation: slideIn 0.3s ease;
}

.trade-notification.success {
  background: #4CAF50;
}

.trade-notification.error {
  background: #f44336;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .trading-info {
    gap: 1rem;
  }

  .stocks-grid {
    grid-template-columns: 1fr;
  }

  .trading-main {
    padding: 1rem;
  }
}
</style>