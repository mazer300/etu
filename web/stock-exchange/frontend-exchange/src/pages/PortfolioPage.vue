<template>
  <div class="portfolio-page">
    <!-- Header -->
    <header class="portfolio-header">
      <div class="header-content">
        <h1>Мой портфель</h1>
        <div class="portfolio-summary">
          <div class="summary-item">
            <span class="label">Общий баланс:</span>
            <span class="value">{{ formatBalance(totalPortfolioValue) }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Денежные средства:</span>
            <span class="value">{{ formatBalance(balance) }}</span>
          </div>
          <div class="summary-item" :class="totalProfit >= 0 ? 'positive' : 'negative'">
            <span class="label">Общая прибыль/убыток:</span>
            <span class="value">
              {{ totalProfit >= 0 ? '+' : '' }}{{ formatBalance(totalProfit) }}
              ({{ totalProfitPercent >= 0 ? '+' : '' }}{{ totalProfitPercent.toFixed(2) }}%)
            </span>
          </div>
          <div class="summary-item">
            <span class="label">Текущая дата:</span>
            <span class="value">{{ currentDate || 'Не установлена' }}</span>
          </div>
        </div>
        <nav class="nav-links">
          <button @click="goToTrading" class="nav-btn">📈 Торговать</button>
          <button @click="refreshData" class="nav-btn" :disabled="isRefreshing">
            {{ isRefreshing ? '🔄' : '🔄' }} Обновить
          </button>
          <button @click="handleLogout" class="nav-btn logout">🚪 Выйти</button>
        </nav>
      </div>
    </header>

    <!-- Portfolio Content -->
    <main class="portfolio-main">
      <!-- WebSocket Status -->
      <div class="connection-status" :class="isSocketConnected ? 'connected' : 'disconnected'">
        <span class="status-dot"></span>
        {{ isSocketConnected ? 'Подключено к бирже' : 'Нет подключения к бирже' }}
      </div>

      <div v-if="Object.keys(portfolioItems).length === 0" class="empty-portfolio">
        <div class="empty-content">
          <h3>Портфель пуст</h3>
          <p>Начните торговать акциями на торговой площадке</p>
          <button @click="goToTrading" class="trade-btn">
            Перейти к торгам
          </button>
        </div>
      </div>

      <div v-else class="portfolio-content">
        <div class="portfolio-grid">
          <div
              v-for="(item, symbol) in portfolioItems"
              :key="symbol"
              class="portfolio-card"
              :class="item.profit >= 0 ? 'positive' : 'negative'"
          >
            <div class="stock-header">
              <h3 class="stock-symbol">{{ symbol }}</h3>
              <span class="company-name">{{ getStockName(symbol) }}</span>
            </div>

            <div class="portfolio-details">
              <div class="detail-row">
                <span class="label">Количество:</span>
                <span class="value">{{ item.quantity }} шт.</span>
              </div>
              <div class="detail-row">
                <span class="label">Средняя цена:</span>
                <span class="value">${{ item.averagePrice.toFixed(2) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Текущая цена:</span>
                <span class="value">${{ item.currentPrice.toFixed(2) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Текущая стоимость:</span>
                <span class="value">{{ formatBalance(item.currentValue) }}</span>
              </div>
            </div>

            <div class="profit-section">
              <div class="profit-amount" :class="item.profit >= 0 ? 'positive' : 'negative'">
                {{ item.profit >= 0 ? '+' : '' }}{{ formatBalance(item.profit) }}
              </div>
              <div class="profit-percent" :class="item.profitPercent >= 0 ? 'positive' : 'negative'">
                {{ item.profitPercent >= 0 ? '+' : '' }}{{ item.profitPercent.toFixed(2) }}%
              </div>
            </div>

            <div class="portfolio-actions">
              <button
                  @click="openChart(symbol)"
                  class="action-btn chart"
              >
                📊 График
              </button>
              <button
                  @click="openTradeDialog(symbol, 'buy')"
                  class="action-btn buy"
                  :disabled="!exchangeConfig.isTrading"
              >
                Купить еще
              </button>
              <button
                  @click="openTradeDialog(symbol, 'sell')"
                  class="action-btn sell"
                  :disabled="!exchangeConfig.isTrading"
              >
                Продать
              </button>
            </div>
          </div>
        </div>

        <!-- Portfolio Summary Table -->
        <div class="portfolio-table-section">
          <h3>Сводка по портфелю</h3>
          <div class="portfolio-table">
            <div class="table-header">
              <div class="table-cell">Акция</div>
              <div class="table-cell">Количество</div>
              <div class="table-cell">Средняя цена</div>
              <div class="table-cell">Текущая цена</div>
              <div class="table-cell">Стоимость</div>
              <div class="table-cell">P&L</div>
            </div>
            <div
                v-for="(item, symbol) in portfolioItems"
                :key="symbol"
                class="table-row"
            >
              <div class="table-cell stock-info">
                <strong>{{ symbol }}</strong>
                <span class="company">{{ getStockName(symbol) }}</span>
              </div>
              <div class="table-cell">{{ item.quantity }} шт.</div>
              <div class="table-cell">${{ item.averagePrice.toFixed(2) }}</div>
              <div class="table-cell">${{ item.currentPrice.toFixed(2) }}</div>
              <div class="table-cell">{{ formatBalance(item.currentValue) }}</div>
              <div class="table-cell" :class="item.profit >= 0 ? 'positive' : 'negative'">
                {{ item.profit >= 0 ? '+' : '' }}{{ formatBalance(item.profit) }}
                ({{ item.profitPercent >= 0 ? '+' : '' }}{{ item.profitPercent.toFixed(2) }}%)
              </div>
            </div>
          </div>
        </div>
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
  name: 'PortfolioPage',
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
    portfolio() {
      return brokersStore.portfolio
    },
    stocks() {
      return brokersStore.stocks
    },
    portfolioItems() {
      return brokersStore.portfolioItems
    },
    isSocketConnected() {
      return brokersStore.isSocketConnected
    },
    totalProfit() {
      const { totalProfit } = brokersStore.getPortfolioProfit()
      return totalProfit || 0
    },
    totalProfitPercent() {
      const { totalProfit, totalPortfolioValue } = brokersStore.getPortfolioProfit()
      const invested = totalPortfolioValue - (totalProfit || 0)
      return invested > 0 ? ((totalProfit || 0) / invested) * 100 : 0
    },
    totalPortfolioValue() {
      const { totalPortfolioValue } = brokersStore.getPortfolioProfit()
      return totalPortfolioValue || this.balance
    }
  },
  async mounted() {
    console.log('📊 PortfolioPage mounted')
    await this.refreshData()
  },
  methods: {
    async refreshData() {
      this.isRefreshing = true
      try {
        await brokersStore.loadStocks()
        await brokersStore.loadExchangeConfig()
        console.log('✅ Portfolio data refreshed')
      } catch (error) {
        console.error('❌ Error refreshing portfolio:', error)
        this.showNotification('Ошибка обновления данных', 'error')
      } finally {
        this.isRefreshing = false
      }
    },

    getStockName(symbol) {
      const stock = this.stocks.find(s => s.symbol === symbol)
      return stock?.companyName || symbol
    },

    getStock(symbol) {
      return this.stocks.find(s => s.symbol === symbol)
    },

    openChart(symbol) {
      const stock = this.getStock(symbol)
      if (stock) {
        this.selectedStock = stock
        this.showChart = true
      }
    },

    closeChart() {
      this.showChart = false
      this.selectedStock = null
    },

    openTradeDialog(symbol, type) {
      const stock = this.getStock(symbol)
      if (stock) {
        this.selectedStock = stock
        this.tradeType = type
        this.showTradeDialog = true
      }
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
      this.refreshData()
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
      return new Intl.NumberFormat('ru-RU').format(Math.round(balance)) + ' $'
    },

    goToTrading() {
      this.$router.push('/trading')
    },

    handleLogout() {
      brokersStore.logout()
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.portfolio-page {
  min-height: 100vh;
  background: #121212;
  color: white;
}

.portfolio-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  max-width: 1400px;
  margin: 0 auto;
  flex-wrap: wrap;
  gap: 2rem;
}

.header-content h1 {
  margin: 0;
  font-size: 2rem;
  color: white;
  flex-shrink: 0;
}

.portfolio-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  flex-grow: 1;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1rem;
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.summary-item .label {
  font-size: 0.8rem;
  opacity: 0.8;
  margin-bottom: 0.5rem;
}

.summary-item .value {
  font-size: 1.1rem;
  font-weight: bold;
}

.summary-item.positive .value {
  color: #4CAF50;
}

.summary-item.negative .value {
  color: #f44336;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.nav-btn {
  padding: 0.75rem 1.5rem;
  background: rgba(255,255,255,0.2);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-weight: 600;
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

.portfolio-main {
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
  margin-bottom: 2rem;
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

.empty-portfolio {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.empty-content {
  max-width: 400px;
}

.empty-content h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #b0b0b0;
}

.empty-content p {
  margin-bottom: 2rem;
  color: #888;
  font-size: 1.1rem;
}

.trade-btn {
  padding: 0.75rem 2rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.trade-btn:hover {
  transform: translateY(-2px);
}

.portfolio-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.portfolio-card {
  background: #1e1e1e;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid #666;
  transition: transform 0.2s, box-shadow 0.2s;
}

.portfolio-card.positive {
  border-left-color: #4CAF50;
}

.portfolio-card.negative {
  border-left-color: #f44336;
}

.portfolio-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.stock-header {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333;
}

.stock-symbol {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
  color: #667eea;
}

.company-name {
  color: #b0b0b0;
  font-size: 0.9rem;
}

.portfolio-details {
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.detail-row .label {
  color: #b0b0b0;
}

.detail-row .value {
  font-weight: 600;
}

.profit-section {
  text-align: center;
  margin: 1.5rem 0;
  padding: 1rem;
  background: #2d2d2d;
  border-radius: 8px;
}

.profit-amount {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.profit-amount.positive {
  color: #4CAF50;
}

.profit-amount.negative {
  color: #f44336;
}

.profit-percent {
  font-size: 1.1rem;
  font-weight: 600;
}

.profit-percent.positive {
  color: #4CAF50;
}

.profit-percent.negative {
  color: #f44336;
}

.portfolio-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.8rem;
  transition: all 0.2s;
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

.action-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.portfolio-table-section {
  margin-top: 2rem;
}

.portfolio-table-section h3 {
  margin-bottom: 1rem;
  color: white;
  font-size: 1.3rem;
}

.portfolio-table {
  background: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #333;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1.5fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #2d2d2d;
  font-weight: 600;
  border-bottom: 1px solid #333;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1.5fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #333;
  align-items: center;
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  display: flex;
  align-items: center;
}

.stock-info {
  flex-direction: column;
  align-items: flex-start;
}

.stock-info .company {
  font-size: 0.8rem;
  color: #b0b0b0;
  margin-top: 0.25rem;
}

.positive {
  color: #4CAF50;
  font-weight: 600;
}

.negative {
  color: #f44336;
  font-weight: 600;
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
    align-items: stretch;
  }

  .portfolio-summary {
    grid-template-columns: 1fr;
  }

  .portfolio-grid {
    grid-template-columns: 1fr;
  }

  .portfolio-table {
    overflow-x: auto;
  }

  .table-header,
  .table-row {
    grid-template-columns: repeat(6, 150px);
    min-width: 900px;
  }

  .portfolio-main {
    padding: 1rem;
  }
}
</style>