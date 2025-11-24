<template>
  <div class="chart-dialog-overlay" v-if="show" @click="close">
    <div class="chart-dialog" @click.stop>
      <div class="chart-header">
        <h3>График цены {{ stock.symbol }} - {{ stock.companyName }}</h3>
        <button class="close-btn" @click="close">×</button>
      </div>
      <div class="chart-content">
        <div class="chart-container" ref="chartContainer">
          <div class="chart-placeholder" v-if="!hasData">
            <p>Загрузка исторических данных...</p>
          </div>
          <canvas v-else ref="chartCanvas" width="600" height="400"></canvas>
        </div>
        <div class="chart-info">
          <div class="info-item">
            <span>Текущая цена:</span>
            <span class="price">${{ stock.price.toFixed(2) }}</span>
          </div>
          <div class="info-item">
            <span>Изменение:</span>
            <span :class="stock.change >= 0 ? 'positive' : 'negative'">
                            {{ stock.change >= 0 ? '+' : '' }}{{ stock.change.toFixed(2) }}
                            ({{ stock.changePercent.toFixed(2) }}%)
                        </span>
          </div>
          <div class="info-item" v-if="portfolioItem">
            <span>В портфеле:</span>
            <span>{{ portfolioItem.quantity }} шт.</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StockChart',
  props: {
    show: Boolean,
    stock: Object,
    portfolio: Object
  },
  data() {
    return {
      chart: null,
      historyData: [],
      hasData: false
    }
  },
  computed: {
    portfolioItem() {
      return this.portfolio[this.stock.symbol]
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.loadHistoryData()
      } else {
        this.destroyChart()
      }
    }
  },
  methods: {
    async loadHistoryData() {
      try {
        console.log(`📊 Loading history for ${this.stock.symbol}`)
        const response = await fetch(`http://localhost:3011/api/stocks/${this.stock.symbol}/history`)
        if (response.ok) {
          this.historyData = await response.json()
          this.hasData = this.historyData.length > 0
          if (this.hasData) {
            this.$nextTick(() => {
              this.renderChart()
            })
          }
        } else {
          console.error('Failed to load history data')
          this.generateSampleData()
        }
      } catch (error) {
        console.error('Error loading history:', error)
        this.generateSampleData()
      }
    },

    generateSampleData() {
      // Генерируем примерные данные для демонстрации
      const basePrice = this.stock.price
      this.historyData = []

      for (let i = 30; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const variation = (Math.random() - 0.5) * basePrice * 0.1
        const price = Math.max(1, basePrice + variation)

        this.historyData.push({
          date: date.toLocaleDateString('ru-RU'),
          price: price,
          open: price - variation * 0.5,
          high: price + Math.random() * basePrice * 0.05,
          low: price - Math.random() * basePrice * 0.05
        })
      }

      this.hasData = true
      this.$nextTick(() => {
        this.renderChart()
      })
    },

    renderChart() {
      if (!this.$refs.chartCanvas) return

      const ctx = this.$refs.chartCanvas.getContext('2d')
      const width = this.$refs.chartCanvas.width
      const height = this.$refs.chartCanvas.height

      // Очищаем canvas
      ctx.clearRect(0, 0, width, height)

      if (this.historyData.length === 0) return

      // Находим минимальные и максимальные значения
      const prices = this.historyData.map(d => d.price)
      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)
      const priceRange = maxPrice - minPrice

      // Рисуем сетку
      ctx.strokeStyle = '#444'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])

      // Горизонтальные линии
      for (let i = 0; i <= 4; i++) {
        const y = height - (i * height / 4)
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()

        // Подписи цен
        ctx.fillStyle = '#888'
        ctx.font = '12px Arial'
        const price = minPrice + (priceRange * i / 4)
        ctx.fillText(`$${price.toFixed(2)}`, 5, y - 5)
      }

      ctx.setLineDash([])

      // Рисуем линию графика
      ctx.strokeStyle = '#667eea'
      ctx.lineWidth = 2
      ctx.beginPath()

      this.historyData.forEach((point, index) => {
        const x = (index * width) / (this.historyData.length - 1)
        const y = height - ((point.price - minPrice) / priceRange * height)

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()

      // Рисуем точки
      ctx.fillStyle = '#667eea'
      this.historyData.forEach((point, index) => {
        const x = (index * width) / (this.historyData.length - 1)
        const y = height - ((point.price - minPrice) / priceRange * height)

        ctx.beginPath()
        ctx.arc(x, y, 3, 0, 2 * Math.PI)
        ctx.fill()
      })

      // Подписи дат
      ctx.fillStyle = '#888'
      ctx.font = '10px Arial'
      const step = Math.max(1, Math.floor(this.historyData.length / 5))

      for (let i = 0; i < this.historyData.length; i += step) {
        const x = (i * width) / (this.historyData.length - 1)
        ctx.fillText(this.historyData[i].date, x, height - 10)
      }
    },

    destroyChart() {
      this.chart = null
      this.historyData = []
      this.hasData = false
    },

    close() {
      this.$emit('close')
    }
  },

  beforeUnmount() {
    this.destroyChart()
  }
}
</script>

<style scoped>
.chart-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.chart-dialog {
  background: #1e1e1e;
  border-radius: 12px;
  padding: 0;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  border: 1px solid #333;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #333;
  background: #2d2d2d;
}

.chart-header h3 {
  margin: 0;
  color: white;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: white;
  background: #444;
  border-radius: 50%;
}

.chart-content {
  padding: 1.5rem;
}

.chart-container {
  background: #2d2d2d;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  color: #888;
  text-align: center;
}

.chart-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: #2d2d2d;
  border-radius: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.info-item span:first-child {
  color: #888;
}

.info-item .price {
  font-weight: bold;
  color: #667eea;
}

.positive {
  color: #4CAF50;
  font-weight: bold;
}

.negative {
  color: #f44336;
  font-weight: bold;
}

canvas {
  max-width: 100%;
  height: auto;
}
</style>