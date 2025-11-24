import { reactive, readonly } from 'vue'
import { io } from 'socket.io-client'

// Реактивное состояние
const state = reactive({
    currentBroker: null,
    brokers: [],
    stocks: [],
    portfolio: {},
    balance: 0,
    currentDate: null,
    exchangeConfig: {},
    socket: null,
    isConnected: false,
    lastUpdate: null,
    syncInterval: null
})

// Функция для получения базового URL
const getBaseUrl = () => {
    if (import.meta.env.DEV) {
        return 'http://localhost:3011'
    }
    return 'http://localhost:3011' // Относительный путь в продакшене
}

// Сохранение состояния в localStorage
const saveStateToStorage = () => {
    if (state.currentBroker) {
        const stateToSave = {
            currentBroker: state.currentBroker,
            balance: state.balance,
            portfolio: state.portfolio,
            stocks: state.stocks,
            currentDate: state.currentDate,
            exchangeConfig: state.exchangeConfig,
            lastUpdate: Date.now()
        }
        localStorage.setItem('brokerState', JSON.stringify(stateToSave))
        console.log('💾 State saved to localStorage')
    }
}

// Загрузка состояния из localStorage
const loadStateFromStorage = () => {
    try {
        const savedState = localStorage.getItem('brokerState')
        if (savedState) {
            const parsedState = JSON.parse(savedState)

            // Проверяем, не устарели ли данные (больше 5 минут)
            const isExpired = Date.now() - (parsedState.lastUpdate || 0) > 5 * 60 * 1000

            if (!isExpired && parsedState.currentBroker) {
                state.currentBroker = parsedState.currentBroker
                state.balance = parsedState.balance || 0
                state.portfolio = parsedState.portfolio || {}
                state.stocks = parsedState.stocks || []
                state.currentDate = parsedState.currentDate
                state.exchangeConfig = parsedState.exchangeConfig || {}
                console.log('💾 State loaded from localStorage')
                return true
            } else {
                console.log('🗑️ State expired or invalid, clearing...')
                localStorage.removeItem('brokerState')
            }
        }
    } catch (error) {
        console.error('❌ Error loading state from storage:', error)
        localStorage.removeItem('brokerState')
    }
    return false
}

// Основной store
const brokersStore = {
    // Getters
    get currentBroker() { return readonly(state).currentBroker },
    get brokers() { return readonly(state).brokers },
    get stocks() { return readonly(state).stocks },
    get portfolio() { return readonly(state).portfolio },
    get balance() { return readonly(state).balance },
    get currentDate() { return readonly(state).currentDate },
    get exchangeConfig() { return readonly(state).exchangeConfig },
    get isLoggedIn() { return !!state.currentBroker },
    get activeStocks() { return state.stocks.filter(stock => stock.isActive) },
    get isSocketConnected() { return state.isConnected },

    // Инициализация при загрузке приложения
    async init() {
        console.log('🔧 Initializing broker store...')

        // Пытаемся загрузить состояние из localStorage
        const hasSavedState = loadStateFromStorage()

        if (hasSavedState && state.currentBroker) {
            console.log('🔄 Restoring session for:', state.currentBroker.name)
            // Инициализируем WebSocket для синхронизации
            this.initSocket()

            // Загружаем свежие данные с сервера
            try {
                await this.syncWithServer()
                console.log('✅ Session restored successfully')
            } catch (error) {
                console.error('❌ Error syncing with server:', error)
                // Если синхронизация не удалась, очищаем состояние
                this.clearSession()
            }
        }

        // Запускаем периодическую синхронизацию
        this.startPeriodicSync()
    },

    // Периодическая синхронизация
    startPeriodicSync() {
        if (state.syncInterval) {
            clearInterval(state.syncInterval)
        }

        state.syncInterval = setInterval(() => {
            if (state.isLoggedIn && state.isConnected) {
                console.log('🔄 Periodic sync...')
                this.syncWithServer().catch(error => {
                    console.log('⚠️ Periodic sync failed:', error.message)
                })
            }
        }, 1000) // Синхронизация каждые 1 секунд
    },

    // Принудительная синхронизация
    async forceSync() {
        if (state.isLoggedIn) {
            console.log('🔄 Manual sync triggered')
            await this.syncWithServer()
        }
    },

    // Синхронизация с сервером
    async syncWithServer() {
        if (!state.currentBroker) {
            console.log('❌ No current broker for sync')
            return
        }

        try {
            console.log('🔄 Syncing with server...')
            const baseUrl = getBaseUrl()

            // Параллельно загружаем все необходимые данные
            const [brokerResponse, stocksResponse, configResponse] = await Promise.all([
                fetch(`${baseUrl}/api/brokers/${state.currentBroker.id}`),
                fetch(`${baseUrl}/api/stocks`),
                fetch(`${baseUrl}/api/exchange/config`)
            ])

            if (!brokerResponse.ok) throw new Error('Broker not found')
            if (!stocksResponse.ok) throw new Error('Stocks not found')

            const [brokerData, stocksData, configData] = await Promise.all([
                brokerResponse.json(),
                stocksResponse.json(),
                configResponse.ok ? configResponse.json() : {}
            ])

            // Обновляем состояние свежими данными с сервера
            state.balance = brokerData.currentBalance || brokerData.initialBalance
            state.portfolio = brokerData.portfolio ? { ...brokerData.portfolio } : {}
            state.stocks = [...stocksData]
            state.exchangeConfig = configData
            state.currentDate = configData.russianDate || configData.currentDate

            // Обновляем P&L для всех позиций в портфеле
            this.updateAllPortfolioPnL()

            console.log('✅ Sync completed successfully')
            saveStateToStorage()

        } catch (error) {
            console.error('❌ Sync failed:', error)
            throw error
        }
    },

    // Обновление P&L для всех позиций в портфеле
    updateAllPortfolioPnL() {
        Object.keys(state.portfolio).forEach(symbol => {
            const stock = state.stocks.find(s => s.symbol === symbol)
            if (stock) {
                this.updatePortfolioPnL(symbol, stock.price)
            }
        })
    },

    // Инициализация WebSocket соединения
    initSocket() {
        if (state.socket) {
            state.socket.disconnect()
        }

        const socketUrl = getBaseUrl()

        console.log('🔌 Connecting to WebSocket:', socketUrl)

        state.socket = io(socketUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            timeout: 20000
        })

        state.socket.on('connect', () => {
            console.log('✅ Connected to admin WebSocket')
            state.isConnected = true

            // Запрашиваем начальные данные
            state.socket.emit('getInitialData')

            // Запрашиваем актуальные данные при подключении
            this.syncWithServer().catch(console.error)
        })

        state.socket.on('disconnect', (reason) => {
            console.log('❌ Disconnected from admin WebSocket:', reason)
            state.isConnected = false
        })

        state.socket.on('priceUpdate', (data) => {
            console.log('📈 Received price update:', data)
            this.updateStockPrices(data.prices)
            if (data.date) {
                state.currentDate = data.russianDate || data.date
            }
            saveStateToStorage()
        })

        state.socket.on('exchangeConfig', (config) => {
            console.log('⚙️ Received exchange config:', config)
            state.exchangeConfig = config
            if (config.currentDate) {
                state.currentDate = config.russianDate || config.currentDate
            }
            saveStateToStorage()
        })

        state.socket.on('trade', (tradeData) => {
            console.log('💰 Received trade notification:', tradeData)
            // Если сделка относится к текущему брокеру, обновляем данные
            if (tradeData.brokerId === state.currentBroker?.id) {
                this.syncWithServer().catch(console.error)
            }
        })

        // НОВЫЙ ОБРАБОТЧИК: Обновление данных брокера в реальном времени
        state.socket.on('brokerUpdate', (brokerData) => {
            console.log('👤 Received broker update:', brokerData)
            if (brokerData.brokerId === state.currentBroker?.id) {
                state.balance = brokerData.balance
                state.portfolio = { ...brokerData.portfolio }
                console.log('✅ Broker data updated in real-time')
                saveStateToStorage()
            }
        })

        state.socket.on('initialData', (data) => {
            console.log('📦 Received initial data from server')
            if (data.stocks) {
                state.stocks = data.stocks
            }
            if (data.exchangeConfig) {
                state.exchangeConfig = data.exchangeConfig
                state.currentDate = data.exchangeConfig.russianDate || data.exchangeConfig.currentDate
            }
            this.updateAllPortfolioPnL()
            saveStateToStorage()
        })

        state.socket.on('connect_error', (error) => {
            console.error('❌ WebSocket connection error:', error)
            state.isConnected = false
        })

        state.socket.on('reconnect', (attempt) => {
            console.log(`🔁 WebSocket reconnected after ${attempt} attempts`)
            state.isConnected = true
            this.syncWithServer().catch(console.error)
        })
    },

    // Обновление цен акций
    updateStockPrices(priceUpdates) {
        console.log('🔄 Updating stock prices:', priceUpdates.length, 'stocks')
        priceUpdates.forEach(update => {
            const stockIndex = state.stocks.findIndex(s => s.symbol === update.symbol)
            if (stockIndex !== -1) {
                const oldPrice = state.stocks[stockIndex].price
                state.stocks[stockIndex].price = update.price
                state.stocks[stockIndex].change = update.change
                state.stocks[stockIndex].changePercent = update.changePercent

                console.log(`📊 ${update.symbol}: $${oldPrice.toFixed(2)} -> $${update.price.toFixed(2)}`)

                // Обновляем P&L в портфеле
                if (state.portfolio[update.symbol]) {
                    this.updatePortfolioPnL(update.symbol, update.price)
                }
            } else {
                console.log(`⚠️ Stock ${update.symbol} not found in local state`)
            }
        })
    },

    // Обновление P&L в портфеле
    updatePortfolioPnL(symbol, currentPrice) {
        if (state.portfolio[symbol]) {
            const position = state.portfolio[symbol]
            const currentValue = currentPrice * position.quantity
            const invested = position.averagePrice * position.quantity
            const oldProfit = position.profit
            position.profit = currentValue - invested
            position.profitPercent = invested > 0 ? (position.profit / invested) * 100 : 0
            position.currentValue = currentValue

            console.log(`💰 ${symbol} P&L: $${oldProfit.toFixed(2)} -> $${position.profit.toFixed(2)}`)
        }
    },

    async loginBroker(brokerName) {
        try {
            console.log('🔐 Logging in broker:', brokerName)

            const baseUrl = getBaseUrl()
            const response = await fetch(`${baseUrl}/api/brokers`)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const allBrokers = await response.json()
            console.log('📋 Available brokers:', allBrokers)

            let broker = allBrokers.find(b => b.name === brokerName)

            if (!broker) {
                console.log('➕ Creating new broker:', brokerName)
                const createResponse = await fetch(`${baseUrl}/api/brokers`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: brokerName,
                        initialBalance: 100000
                    })
                })

                if (!createResponse.ok) {
                    const errorText = await createResponse.text()
                    throw new Error(`Failed to create broker: ${errorText}`)
                }
                broker = await createResponse.json()
                console.log('✅ New broker created:', broker)
            }

            // Инициализируем состояние из данных сервера
            state.currentBroker = { ...broker }
            state.balance = broker.currentBalance || broker.initialBalance
            state.portfolio = broker.portfolio ? { ...broker.portfolio } : {}

            // Загружаем акции и конфигурацию
            await this.loadStocks()
            await this.loadExchangeConfig()

            // Инициализируем WebSocket
            this.initSocket()

            // Сохраняем состояние
            saveStateToStorage()

            console.log('✅ Logged in successfully')
            return state.currentBroker
        } catch (error) {
            console.error('❌ Login error:', error)
            throw new Error('Ошибка подключения к серверу: ' + error.message)
        }
    },

    async loadStocks() {
        try {
            console.log('📈 Loading stocks...')
            const baseUrl = getBaseUrl()
            const response = await fetch(`${baseUrl}/api/stocks`)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const stocksData = await response.json()
            state.stocks = [...stocksData]

            console.log('✅ Stocks loaded:', state.stocks.length)
            return state.stocks
        } catch (error) {
            console.error('❌ Error loading stocks:', error)
            throw error
        }
    },

    async loadExchangeConfig() {
        try {
            console.log('⚙️ Loading exchange config...')
            const baseUrl = getBaseUrl()
            const response = await fetch(`${baseUrl}/api/exchange/config`)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const config = await response.json()
            state.exchangeConfig = config
            state.currentDate = config.russianDate || config.currentDate

            console.log('✅ Exchange config loaded:', config)
            return config
        } catch (error) {
            console.error('❌ Error loading exchange config:', error)
            throw error
        }
    },

    // ИСПРАВЛЕННЫЙ МЕТОД ПОКУПКИ АКЦИЙ
    async buyStock(symbol, quantity) {
        try {
            console.log(`🛒 Buying ${quantity} of ${symbol}`)

            const stock = state.stocks.find(s => s.symbol === symbol)
            if (!stock) throw new Error('Акция не найдена')

            const totalCost = stock.price * quantity
            console.log(`💰 Total cost: $${totalCost.toFixed(2)}, Current balance: $${state.balance.toFixed(2)}`)

            if (state.balance < totalCost) {
                throw new Error(`Недостаточно средств. Нужно: $${totalCost.toFixed(2)}, Доступно: $${state.balance.toFixed(2)}`)
            }

            // ВАЖНО: Не обновляем локальное состояние сразу, ждем ответ от сервера
            console.log('🔄 Sending buy request to server...')

            const baseUrl = getBaseUrl()
            const response = await fetch(`${baseUrl}/api/trading/buy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    brokerId: state.currentBroker.id,
                    symbol: symbol,
                    quantity: quantity,
                    price: stock.price
                })
            })

            if (!response.ok) {
                const errorText = await response.text()
                console.error('❌ Server error:', errorText)
                throw new Error(`Ошибка покупки: ${errorText}`)
            }

            const result = await response.json()
            console.log('✅ Buy successful, server response:', result)

            // Обновляем локальное состояние из ответа сервера
            state.balance = result.broker.currentBalance
            state.portfolio = { ...result.broker.portfolio }

            // Отправляем информацию о сделке через WebSocket
            if (state.socket && state.socket.connected) {
                state.socket.emit('tradeExecuted', {
                    brokerId: state.currentBroker.id,
                    brokerName: state.currentBroker.name,
                    symbol: symbol,
                    quantity: quantity,
                    price: stock.price,
                    totalCost: totalCost,
                    type: 'buy',
                    timestamp: new Date().toISOString()
                })
            }

            // Сохраняем состояние
            saveStateToStorage()

            console.log(`✅ Successfully bought ${quantity} of ${symbol}`)
            console.log('💰 New balance:', state.balance)
            console.log('📊 New portfolio:', state.portfolio)

            return result

        } catch (error) {
            console.error('❌ Buy error:', error)
            throw error
        }
    },

    // ИСПРАВЛЕННЫЙ МЕТОД ПРОДАЖИ АКЦИЙ
    async sellStock(symbol, quantity) {
        try {
            console.log(`💰 Selling ${quantity} of ${symbol}`)

            const portfolioItem = state.portfolio[symbol]
            if (!portfolioItem || portfolioItem.quantity < quantity) {
                throw new Error(`Недостаточно акций. Доступно: ${portfolioItem?.quantity || 0}, Запрошено: ${quantity}`)
            }

            const stock = state.stocks.find(s => s.symbol === symbol)
            const totalRevenue = stock.price * quantity

            console.log('🔄 Sending sell request to server...')

            const baseUrl = getBaseUrl()
            const response = await fetch(`${baseUrl}/api/trading/sell`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    brokerId: state.currentBroker.id,
                    symbol: symbol,
                    quantity: quantity,
                    price: stock.price
                })
            })

            if (!response.ok) {
                const errorText = await response.text()
                console.error('❌ Server error:', errorText)
                throw new Error(`Ошибка продажи: ${errorText}`)
            }

            const result = await response.json()
            console.log('✅ Sell successful, server response:', result)

            // Обновляем локальное состояние из ответа сервера
            state.balance = result.broker.currentBalance
            state.portfolio = { ...result.broker.portfolio }

            // Отправляем информацию о сделке через WebSocket
            if (state.socket && state.socket.connected) {
                state.socket.emit('tradeExecuted', {
                    brokerId: state.currentBroker.id,
                    brokerName: state.currentBroker.name,
                    symbol: symbol,
                    quantity: quantity,
                    price: stock.price,
                    totalRevenue: totalRevenue,
                    type: 'sell',
                    timestamp: new Date().toISOString()
                })
            }

            // Сохраняем состояние
            saveStateToStorage()

            console.log(`✅ Successfully sold ${quantity} of ${symbol}`)
            console.log('💰 New balance:', state.balance)
            console.log('📊 New portfolio:', state.portfolio)

            return result

        } catch (error) {
            console.error('❌ Sell error:', error)
            throw error
        }
    },

    getPortfolioProfit() {
        const profit = {}
        let totalProfit = 0
        let totalPortfolioValue = state.balance

        Object.entries(state.portfolio).forEach(([symbol, item]) => {
            const stock = state.stocks.find(s => s.symbol === symbol)
            const currentPrice = stock?.price || 0
            const currentValue = currentPrice * item.quantity
            const stockProfit = currentValue - item.totalCost

            profit[symbol] = {
                quantity: item.quantity,
                averagePrice: item.averagePrice,
                currentPrice: currentPrice,
                currentValue: currentValue,
                profit: stockProfit,
                profitPercent: item.totalCost > 0 ? (stockProfit / item.totalCost) * 100 : 0
            }

            totalProfit += stockProfit
            totalPortfolioValue += currentValue
        })

        return { profit, totalProfit, totalPortfolioValue }
    },

    get portfolioItems() {
        const { profit } = this.getPortfolioProfit()
        return profit || {}
    },

    // Очистка сессии
    clearSession() {
        console.log('🚪 Clearing session...')
        if (state.socket) {
            state.socket.disconnect()
            state.socket = null
        }
        if (state.syncInterval) {
            clearInterval(state.syncInterval)
            state.syncInterval = null
        }
        state.currentBroker = null
        state.balance = 0
        state.portfolio = {}
        state.stocks = []
        state.currentDate = null
        state.exchangeConfig = {}
        state.isConnected = false
        localStorage.removeItem('brokerState')
        console.log('✅ Session cleared')
    },

    logout() {
        this.clearSession()
        console.log('✅ Logged out successfully')
    }
}

// Инициализация при импорте
brokersStore.init().catch(console.error)

// Экспортируем store
export { brokersStore }