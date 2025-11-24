import React, {useState, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import io from 'socket.io-client';
import {updateStockPrice} from '../store/slices/stocksSlice';
import './ExchangePage.css';

/**
 * Страница настроек биржи и управления торгами
 * Позволяет настраивать параметры торгов, запускать/останавливать торги
 * и отслеживать цены акций в реальном времени через WebSocket
 */
const ExchangePage = () => {
    const dispatch = useDispatch();

    // Состояние конфигурации биржи
    const [config, setConfig] = useState({
        startDate: '',        // Дата начала торгов
        speed: 1,            // Скорость торгов (сек/день)
        isTrading: false,    // Статус торгов (идут/остановлены)
        currentDate: null    // Текущая дата в симуляции
    });

    // Состояние текущих цен акций
    const [currentPrices, setCurrentPrices] = useState({});

    // WebSocket соединение
    const [socket, setSocket] = useState(null);

    // Статус подключения WebSocket
    const [connectionStatus, setConnectionStatus] = useState('disconnected');

    // Состояние загрузки
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Эффект для инициализации при монтировании компонента
     * - Загружает конфигурацию
     * - Устанавливает WebSocket соединение
     * - Настраивает обработчики событий WebSocket
     */
    useEffect(() => {
        // Загружаем текущую конфигурацию с сервера
        fetchConfig();

        // Создаем новое WebSocket соединение
        const newSocket = io('http://localhost:3011', {
            transports: ['websocket', 'polling'],
            timeout: 10000,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        setSocket(newSocket);

        // Обработчик успешного подключения
        newSocket.on('connect', () => {
            console.log('WebSocket connected');
            setConnectionStatus('connected');
        });

        // Обработчик отключения
        newSocket.on('disconnect', (reason) => {
            console.log('WebSocket disconnected:', reason);
            setConnectionStatus('disconnected');
        });

        // Обработчик ошибки подключения
        newSocket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            setConnectionStatus('error');
        });

        // Обработчик переподключения
        newSocket.on('reconnect', (attemptNumber) => {
            console.log(`WebSocket reconnected after ${attemptNumber} attempts`);
            setConnectionStatus('connected');
        });

        // Обработчик обновления цен от сервера
        newSocket.on('priceUpdate', (data) => {
            const updatedPrices = {};

            // Обрабатываем каждое обновление цены
            data.prices.forEach(price => {
                updatedPrices[price.symbol] = price;

                // Диспатчим обновление в Redux store
                dispatch(updateStockPrice({
                    symbol: price.symbol,
                    price: price.price,
                    change: price.change,
                    changePercent: price.changePercent
                }));
            });

            // Обновляем локальное состояние цен
            setCurrentPrices(updatedPrices);

            // Обновляем текущую дату в конфигурации
            setConfig(prev => ({...prev, currentDate: data.date}));
        });

        // Очистка при размонтировании компонента
        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [dispatch]);

    /**
     * Загружает конфигурацию биржи с сервера
     */
    const fetchConfig = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:3011/api/exchange/config');
            if (response.ok) {
                const data = await response.json();
                setConfig({
                    ...data,
                    startDate: data.startDate || ''
                });
            }
        } catch (error) {
            console.error('Error fetching config:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Обновляет конфигурацию на сервере
     * @param updates - объект с обновлениями конфигурации
     */
    const updateConfig = async (updates) => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:3011/api/exchange/config', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            if (response.ok) {
                const data = await response.json();
                setConfig({
                    ...data,
                    startDate: data.startDate || ''
                });
                return true;
            } else {
                console.error('Failed to update config');
                return false;
            }
        } catch (error) {
            console.error('Error updating config:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Форматирует дату из ММ/ДД/ГГГГ в формат input[type="date"] (ГГГГ-ММ-ДД)
     * @param dateStr - строка даты в формате ММ/ДД/ГГГГ
     */
    const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        try {
            const [month, day, year] = dateStr.split('/');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateStr;
        }
    };

    /**
     * Обработчик запуска торгов
     */
    const handleStartTrading = async () => {
        const success = await updateConfig({isTrading: true});
        if (!success) {
            alert('Не удалось запустить торги. Проверьте подключение к серверу.');
        }
    };

    /**
     * Обработчик остановки торгов
     */
    const handleStopTrading = async () => {
        const success = await updateConfig({isTrading: false});
        if (!success) {
            alert('Не удалось остановить торги. Проверьте подключение к серверу.');
        }
    };

    /**
     * Обработчик изменения скорости торгов
     * @param newSpeed - новая скорость (1, 2, 5 секунд)
     */
    const handleSpeedChange = async (newSpeed) => {
        const success = await updateConfig({speed: newSpeed});
        if (!success) {
            alert('Не удалось изменить скорость. Проверьте подключение к серверу.');
        }
    };

    /**
     * Обработчик изменения даты начала торгов
     * Автоматически добавляет слеши при вводе
     * @param event - событие изменения input
     */
    const handleDateChange = async (event) => {
        const value = event.target.value;

        // Автоматически добавляем слеши для удобства ввода
        let formattedValue = value;
        if (value.length === 2 && !value.includes('/')) {
            formattedValue = value + '/';
        } else if (value.length === 5 && value.split('/').length === 2) {
            formattedValue = value + '/';
        }

        // Обновляем локальное состояние сразу для отзывчивости
        setConfig(prev => ({
            ...prev,
            startDate: formattedValue
        }));

        // Сохраняем на сервер только если дата полная (10 символов)
        if (formattedValue.length === 10) {
            const success = await updateConfig({ startDate: formattedValue });
            if (!success) {
                alert('Не удалось изменить дату. Проверьте подключение к серверу.');
            }
        }
    };

    /**
     * Возвращает текстовое представление статуса WebSocket подключения
     */
    const getConnectionStatusText = () => {
        switch (connectionStatus) {
            case 'connected':
                return '🟢 Подключено';
            case 'disconnected':
                return '🔴 Отключено';
            case 'error':
                return '🔴 Ошибка подключения';
            default:
                return '⚪ Неизвестно';
        }
    };

    return (
        <div className="exchange-page">
            {/* Заголовок страницы */}
            <div className="page-header">
                <h1>Настройки биржи</h1>
                <p>Управление параметрами торгов и мониторинг в реальном времени</p>
            </div>

            {/* Индикатор загрузки */}
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner">Загрузка...</div>
                </div>
            )}

            {/* Основные блоки управления */}
            <div className="exchange-controls">
                {/* Блок настроек */}
                <div className="control-section">
                    <h3>Основные настройки</h3>

                    {/* Поле ввода даты начала торгов */}
                    <div className="control-group">
                        <label>Дата начала торгов (ММ/ДД/ГГГГ):</label>
                        <input
                            type="text"
                            value={config.startDate || ''}
                            onChange={handleDateChange}
                            placeholder="01/01/2023"
                            disabled={config.isTrading || isLoading}
                            onKeyPress={(e) => {
                                // Разрешаем только цифры и слеш
                                if (!/[0-9/]/.test(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                        />
                        <small style={{color: '#b0b0b0', fontSize: '0.8rem', marginTop: '0.5rem'}}>
                            Формат: ММ/ДД/ГГГГ (например: 01/15/2023)
                        </small>
                    </div>

                    {/* Управление скоростью торгов */}
                    <div className="control-group">
                        <label>Скорость торгов (секунд на день):</label>
                        <div className="speed-controls">
                            <button
                                className={`speed-btn ${config.speed === 1 ? 'active' : ''}`}
                                onClick={() => handleSpeedChange(1)}
                                disabled={config.isTrading || isLoading}
                            >
                                1 сек
                            </button>
                            <button
                                className={`speed-btn ${config.speed === 2 ? 'active' : ''}`}
                                onClick={() => handleSpeedChange(2)}
                                disabled={config.isTrading || isLoading}
                            >
                                2 сек
                            </button>
                            <button
                                className={`speed-btn ${config.speed === 5 ? 'active' : ''}`}
                                onClick={() => handleSpeedChange(5)}
                                disabled={config.isTrading || isLoading}
                            >
                                5 сек
                            </button>
                        </div>
                    </div>

                    {/* Кнопки управления торгами */}
                    <div className="trading-controls">
                        {!config.isTrading ? (
                            <button
                                className="start-trading-btn"
                                onClick={handleStartTrading}
                                disabled={isLoading}
                            >
                                {isLoading ? '⏳ Запуск...' : '🚀 Начало торгов'}
                            </button>
                        ) : (
                            <button
                                className="stop-trading-btn"
                                onClick={handleStopTrading}
                                disabled={isLoading}
                            >
                                {isLoading ? '⏳ Остановка...' : '⏹️ Остановить торги'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Блок информации о текущем состоянии */}
                <div className="trading-info">
                    <h3>Текущее состояние торгов</h3>

                    <div className="status-display">
                        <div className="status-item">
                            <span className="status-label">Статус WebSocket:</span>
                            <span
                                className={`status-value ${connectionStatus === 'connected' ? 'connected' : 'disconnected'}`}>
                                {getConnectionStatusText()}
                            </span>
                        </div>

                        <div className="status-item">
                            <span className="status-label">Статус торгов:</span>
                            <span className={`status-value ${config.isTrading ? 'trading' : 'stopped'}`}>
                                {config.isTrading ? '🔴 Торги идут' : '🟢 Торги остановлены'}
                            </span>
                        </div>

                        <div className="status-item">
                            <span className="status-label">Текущая дата:</span>
                            <span className="status-value">
                                {config.russianDate || config.currentDate || 'Не установлена'}
                            </span>
                        </div>

                        <div className="status-item">
                            <span className="status-label">Скорость:</span>
                            <span className="status-value">
                                {config.speed} сек/день
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Блок реальных цен акций */}
            <div className="real-time-prices">
                <h3>📊 Текущие цены акций в реальном времени</h3>

                <div className="prices-grid">
                    {Object.keys(currentPrices).length > 0 ? (
                        // Отображаем карточки с ценами акций
                        Object.entries(currentPrices).map(([symbol, data]) => (
                            <div key={symbol} className="price-card">
                                <div className="stock-symbol">{symbol}</div>
                                <div className="price">${data.price.toFixed(2)}</div>
                                <div className={`change ${data.change >= 0 ? 'positive' : 'negative'}`}>
                                    {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}
                                    ({data.changePercent.toFixed(2)}%)
                                </div>
                                <div className="date">{data.russianDate || data.date}</div>
                            </div>
                        ))
                    ) : (
                        // Сообщение если данных нет
                        <div className="no-data">
                            {config.isTrading ? 'Загрузка данных...' : 'Нет данных о ценах. Запустите торги для получения информации.'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExchangePage;