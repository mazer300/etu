<template>
  <div class="trade-dialog-overlay" v-if="show" @click="close">
    <div class="trade-dialog" @click.stop>
      <div class="dialog-header">
        <h3>{{ type === 'buy' ? 'Покупка' : 'Продажа' }} {{ stock.symbol }}</h3>
        <button class="close-btn" @click="close">×</button>
      </div>

      <div class="dialog-content">
        <div class="stock-info">
          <div class="info-row">
            <span>Компания:</span>
            <span>{{ stock.companyName }}</span>
          </div>
          <div class="info-row">
            <span>Текущая цена:</span>
            <span class="price">${{ stock.price.toFixed(2) }}</span>
          </div>
          <div class="info-row" v-if="type === 'sell' && portfolioItem">
            <span>В портфеле:</span>
            <span>{{ portfolioItem.quantity }} шт.</span>
          </div>
          <div class="info-row" v-if="type === 'buy'">
            <span>Макс. можно купить:</span>
            <span>{{ maxCanBuy }} шт.</span>
          </div>
        </div>

        <div class="quantity-control">
          <label for="quantity">Количество:</label>
          <input
              id="quantity"
              type="number"
              v-model.number="quantity"
              :min="1"
              :max="type === 'buy' ? maxCanBuy : (portfolioItem?.quantity || 0)"
              class="quantity-input"
          />
        </div>

        <div class="trade-summary">
          <div class="summary-item">
            <span>Общая стоимость:</span>
            <span class="total-cost">${{ totalCost.toFixed(2) }}</span>
          </div>
          <div class="summary-item" v-if="type === 'buy'">
            <span>Баланс после покупки:</span>
            <span :class="balanceAfterTrade >= 0 ? 'positive' : 'negative'">
                            ${{ balanceAfterTrade.toFixed(2) }}
                        </span>
          </div>
        </div>

        <div class="dialog-actions">
          <button
              @click="executeTrade"
              class="confirm-btn"
              :class="type"
              :disabled="!canTrade"
          >
            {{ type === 'buy' ? 'Купить' : 'Продать' }} {{ quantity }} шт.
          </button>
          <button @click="close" class="cancel-btn">Отмена</button>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { brokersStore } from '../stores/brokers.js'

export default {
  name: 'TradeDialog',
  props: {
    show: Boolean,
    type: String, // 'buy' or 'sell'
    stock: Object
  },
  data() {
    return {
      quantity: 1,
      error: '',
      isLoading: false
    }
  },
  computed: {
    portfolioItem() {
      return brokersStore.portfolio[this.stock.symbol]
    },
    totalCost() {
      return this.stock.price * this.quantity
    },
    maxCanBuy() {
      return Math.floor(brokersStore.balance / this.stock.price)
    },
    balanceAfterTrade() {
      if (this.type === 'buy') {
        return brokersStore.balance - this.totalCost
      } else {
        return brokersStore.balance + this.totalCost
      }
    },
    canTrade() {
      if (this.quantity <= 0) return false

      if (this.type === 'buy') {
        return this.quantity <= this.maxCanBuy
      } else {
        return this.portfolioItem && this.quantity <= this.portfolioItem.quantity
      }
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.quantity = 1
        this.error = ''
        this.isLoading = false
      }
    },
    type() {
      this.quantity = 1
      this.error = ''
    }
  },
  methods: {
    async executeTrade() {
      if (!this.canTrade) return

      this.isLoading = true
      this.error = ''

      try {
        if (this.type === 'buy') {
          await brokersStore.buyStock(this.stock.symbol, this.quantity)
        } else {
          await brokersStore.sellStock(this.stock.symbol, this.quantity)
        }

        this.$emit('traded', {
          type: this.type,
          symbol: this.stock.symbol,
          quantity: this.quantity,
          price: this.stock.price,
          totalCost: this.totalCost
        })

        this.close()
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.trade-dialog-overlay {
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

.trade-dialog {
  background: #1e1e1e;
  border-radius: 12px;
  padding: 0;
  max-width: 500px;
  width: 90%;
  border: 1px solid #333;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #333;
  background: #2d2d2d;
}

.dialog-header h3 {
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

.dialog-content {
  padding: 1.5rem;
}

.stock-info {
  background: #2d2d2d;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row span:first-child {
  color: #888;
}

.info-row .price {
  font-weight: bold;
  color: #667eea;
}

.quantity-control {
  margin-bottom: 1.5rem;
}

.quantity-control label {
  display: block;
  margin-bottom: 0.5rem;
  color: #888;
  font-weight: 500;
}

.quantity-input {
  width: 100%;
  padding: 0.75rem;
  background: #2d2d2d;
  border: 2px solid #444;
  border-radius: 6px;
  color: white;
  font-size: 1rem;
}

.quantity-input:focus {
  outline: none;
  border-color: #667eea;
}

.trade-summary {
  background: #2d2d2d;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-item .total-cost {
  font-size: 1.2rem;
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

.dialog-actions {
  display: flex;
  gap: 1rem;
}

.confirm-btn, .cancel-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s;
}

.confirm-btn.buy {
  background: #4CAF50;
  color: white;
}

.confirm-btn.sell {
  background: #f44336;
  color: white;
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.confirm-btn:not(:disabled):hover {
  transform: translateY(-1px);
}

.cancel-btn {
  background: #666;
  color: white;
}

.cancel-btn:hover {
  background: #777;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #e74c3c;
  color: white;
  border-radius: 6px;
  text-align: center;
}
</style>