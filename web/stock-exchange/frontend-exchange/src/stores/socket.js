import { defineStore } from 'pinia'
import { ref } from 'vue'
import { io } from 'socket.io-client'

export const useSocketStore = defineStore('socket', () => {
  const socket = ref(null)
  const isConnected = ref(false)
  const stockUpdates = ref([])
  const initialDataLoaded = ref(false)

  const connect = () => {
    socket.value = io('http://localhost:3013', {
      transports: ['websocket', 'polling']
    })
    
    socket.value.on('connect', () => {
      console.log('✅ Connected to exchange WebSocket')
      isConnected.value = true
      
      // Запрашиваем начальные данные
      socket.value.emit('getInitialData')
    })

    socket.value.on('disconnect', () => {
      console.log('❌ Disconnected from exchange WebSocket')
      isConnected.value = false
      initialDataLoaded.value = false
    })

    // Получаем начальные данные
    socket.value.on('initialData', (data) => {
      console.log('📦 Received initial data:', data)
      initialDataLoaded.value = true
    })

    // Слушаем обновления акций в реальном времени
    socket.value.on('stockUpdate', (data) => {
      console.log('📈 Real-time stock update:', data)
      stockUpdates.value.unshift({
        ...data,
        timestamp: new Date().toLocaleTimeString()
      })
      
      // Ограничиваем историю до 50 записей
      if (stockUpdates.value.length > 50) {
        stockUpdates.value = stockUpdates.value.slice(0, 50)
      }
    })

    // Слушаем обновления биржи
    socket.value.on('exchangeUpdate', (data) => {
      console.log('⚡ Exchange status update:', data)
    })

    // Слушаем сделки
    socket.value.on('trade', (data) => {
      console.log(' Trade executed:', data)
    })

    // Обработка ошибок
    socket.value.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error)
      isConnected.value = false
    })
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
      initialDataLoaded.value = false
    }
  }

  return {
    socket,
    isConnected,
    stockUpdates,
    initialDataLoaded,
    connect,
    disconnect
  }
})