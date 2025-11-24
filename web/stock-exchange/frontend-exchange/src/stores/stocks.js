import { defineStore } from 'pinia'
import axios from 'axios'

export const useStocksStore = defineStore('stocks', {
  state: () => ({
    stocks: [],
    portfolio: {},
    stockHistory: {} // История цен для каждой акции
  }),

  getters: {
    activeStocks: (state) => state.stocks.filter(stock => stock.isActive),
    
    getStockHistory: (state) => (symbol) => {
      return state.stockHistory[symbol] || []
    }
  },

  actions: {
    async fetchStocks() {
      try {
        const response = await axios.get('/api/stocks')
        this.stocks = response.data
        
        // Инициализируем историю цен для всех акций
        this.stocks.forEach(stock => {
          if (!this.stockHistory[stock.symbol]) {
            this.initializeStockHistory(stock.symbol, stock.price)
          }
        })
      } catch (error) {
        console.error('Error fetching stocks:', error)
        throw error
      }
    },

    async fetchPortfolio(brokerId) {
      try {
        const response = await axios.get(`/api/brokers/${brokerId}/portfolio`)
        this.portfolio = response.data
      } catch (error) {
        console.error('Error fetching portfolio:', error)
        throw error
      }
    },

    async buyStock(brokerId, symbol, quantity) {
      try {
        // ИСПРАВЛЕНИЕ: Правильный URL для покупки
        const response = await axios.post(`/api/trading/buy`, {
          brokerId,
          symbol,
          quantity
        })
        
        // Обновляем портфель локально
        await this.fetchPortfolio(brokerId)
        
        return response.data
      } catch (error) {
        console.error('Error buying stock:', error)
        throw error
      }
    },

    async sellStock(brokerId, symbol, quantity) {
      try {
        //  Правильный URL для продажи
        const response = await axios.post(`/api/trading/sell`, {
          brokerId,
          symbol,
          quantity
        })
        
        // Обновляем портфель локально
        await this.fetchPortfolio(brokerId)
        
        return response.data
      } catch (error) {
        console.error('Error selling stock:', error)
        throw error
      }
    },

    updateStockFromSocket(updatedStock) {
      const index = this.stocks.findIndex(stock => stock.symbol === updatedStock.symbol)
      if (index !== -1) {
        // Сохраняем старую цену для расчета изменения
        const oldPrice = this.stocks[index].price
        
        // Обновляем акцию
        this.stocks[index] = { ...this.stocks[index], ...updatedStock }
        
        // Добавляем запись в историю цен
        this.addToStockHistory(updatedStock.symbol, {
          price: updatedStock.price,
          change: updatedStock.price - oldPrice,
          timestamp: new Date().toISOString()
        })
      }
    },

    // Инициализировать историю цен для акции
    initializeStockHistory(symbol, initialPrice) {
      if (!this.stockHistory[symbol]) {
        this.stockHistory[symbol] = []
      }
      
      // Добавляем начальную точку если история пуста
      if (this.stockHistory[symbol].length === 0) {
        this.stockHistory[symbol].push({
          price: initialPrice,
          change: 0,
          timestamp: new Date().toISOString()
        })
      }
    },

    // Добавить запись в историю цен
    addToStockHistory(symbol, priceData) {
      if (!this.stockHistory[symbol]) {
        this.stockHistory[symbol] = []
      }
      
      this.stockHistory[symbol].push({
        price: priceData.price,
        change: priceData.change,
        timestamp: priceData.timestamp || new Date().toISOString()
      })
      
      // Ограничиваем историю последними 100 точками чтобы не перегружать память
      if (this.stockHistory[symbol].length > 100) {
        this.stockHistory[symbol] = this.stockHistory[symbol].slice(-100)
      }
    },

    // Очистить историю цен (для тестирования)
    clearStockHistory(symbol) {
      if (this.stockHistory[symbol]) {
        this.stockHistory[symbol] = []
      }
    }
  }
})