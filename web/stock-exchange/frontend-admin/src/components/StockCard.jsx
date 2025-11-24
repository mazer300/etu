import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateStock } from '../store/slices/stocksSlice';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StockHistoryTable from './StockHistoryTable';
import './StockCard.css';

/**
 * Компонент карточки акции
 * Отображает информацию об акции, графики и позволяет управлять ее статусом
 */
const StockCard = ({ stock }) => {
    const dispatch = useDispatch();

    // Получаем актуальные данные акции из store
    const currentStock = useSelector((state) =>
        state.stocks.items.find(s => s.symbol === stock.symbol) || stock
    );

    // Состояния компонента
    const [showHistory, setShowHistory] = useState(false); // Показать/скрыть историю
    const [history, setHistory] = useState([]);            // Исторические данные
    const [loading, setLoading] = useState(false);         // Флаг загрузки
    const [viewMode, setViewMode] = useState('chart');     // Режим просмотра: 'chart' или 'table'
    const [timeRange, setTimeRange] = useState('1y');      // Временной диапазон: '1y', '2y', 'all'

    /**
     * Загружает исторические данные для акции с сервера
     */
    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3011/api/stocks/${currentStock.symbol}/history`);
            if (response.ok) {
                const data = await response.json();
                setHistory(data);
            }
        } catch (error) {
            console.error(`Error fetching history for ${currentStock.symbol}:`, error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Переключает статус акции (активная/неактивная)
     */
    const handleToggleActive = async () => {
        try {
            await dispatch(updateStock({
                symbol: currentStock.symbol,
                isActive: !currentStock.isActive
            }));
        } catch (error) {
            console.error(`Failed to toggle ${currentStock.symbol}:`, error);
        }
    };

    /**
     * Показывает/скрывает исторические данные
     */
    const handleShowHistory = () => {
        if (!showHistory) {
            fetchHistory();
        }
        setShowHistory(!showHistory);
    };

    /**
     * Форматирует цену для отображения
     * @param price - числовая цена
     */
    const formatPrice = (price) => {
        return price ? `$${(price).toFixed(2)}` : 'Загрузка...';
    };

    /**
     * Подготавливает данные для графика в зависимости от выбранного диапазона
     */
    const prepareChartData = () => {
        if (!history.length) return [];

        let filteredHistory = history;

        // Фильтруем исторические данные по выбранному временному диапазону
        if (timeRange === '1y') {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            filteredHistory = history.filter(item => {
                try {
                    const [month, day, year] = item.date.split('/');
                    const itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    return itemDate >= oneYearAgo;
                } catch {
                    return true;
                }
            });
        } else if (timeRange === '2y') {
            const twoYearsAgo = new Date();
            twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
            filteredHistory = history.filter(item => {
                try {
                    const [month, day, year] = item.date.split('/');
                    const itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    return itemDate >= twoYearsAgo;
                } catch {
                    return true;
                }
            });
        }
        // 'all' - все данные без фильтрации

        // Сортируем данные по дате и форматируем для графика
        return filteredHistory
            .map(item => {
                try {
                    const [month, day, year] = item.date.split('/');
                    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    return {
                        date: item.date,
                        timestamp: date.getTime(),
                        price: item.price || item.open || 0,
                        displayDate: date.toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit'
                        })
                    };
                } catch (error) {
                    return {
                        date: item.date,
                        timestamp: 0,
                        price: item.price || item.open || 0,
                        displayDate: item.date
                    };
                }
            })
            .sort((a, b) => a.timestamp - b.timestamp); // Сортировка по возрастанию даты
    };

    // Данные для графика
    const chartData = prepareChartData();

    /**
     * Рассчитывает статистику по акции
     */
    const calculateStats = () => {
        if (!history.length) return null;

        const prices = history.map(item => item.price || item.open || 0);
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);
        const current = currentStock.price || prices[prices.length - 1] || 0;

        // Находим цену год назад
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const oneYearAgoPrice = history
            .filter(item => {
                try {
                    const [month, day, year] = item.date.split('/');
                    const itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    return itemDate <= oneYearAgo;
                } catch {
                    return false;
                }
            })
            .slice(-1)[0]?.price || prices[0] || 0;

        const yearlyChange = current - oneYearAgoPrice;
        const yearlyChangePercent = oneYearAgoPrice > 0 ? (yearlyChange / oneYearAgoPrice) * 100 : 0;

        return {
            maxPrice,
            minPrice,
            yearlyChange,
            yearlyChangePercent,
            startPrice: oneYearAgoPrice,
            currentPrice: current,
            totalDays: history.length
        };
    };

    const stats = calculateStats();

    /**
     * Кастомный тултип для графика
     */
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="label">{`Дата: ${label}`}</p>
                    <p className="price">{`Цена: $${(payload[0].value || 0).toFixed(2)}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className={`stock-card ${currentStock.isActive ? 'active' : 'inactive'}`}>
            {/* Заголовок карточки с основной информацией */}
            <div className="stock-header">
                <div className="stock-symbol">
                    <h3>{currentStock.symbol}</h3>
                    <span className="company-name">{currentStock.companyName}</span>
                </div>
                <div className="price-info">
                    <span className="price">{formatPrice(currentStock.price)}</span>
                    {currentStock.price && currentStock.change !== undefined && (
                        <div className={`price-change ${currentStock.change >= 0 ? 'positive' : 'negative'}`}>
                            <span>{currentStock.change >= 0 ? '+' : ''}{currentStock.change?.toFixed(2)}</span>
                            <span>({currentStock.changePercent?.toFixed(2)}%)</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Дополнительная информация об акции */}
            <div className="stock-info">
                <p className="stock-description">{currentStock.description}</p>
                <div className="stock-meta">
                    <span className="sector">{currentStock.sector}</span>
                    <span className={`status ${currentStock.isActive ? 'active' : 'inactive'}`}>
                        {currentStock.isActive ? '✅ В торгах' : '❌ Не в торгах'}
                    </span>
                </div>
            </div>

            {/* Кнопки действий */}
            <div className="stock-actions">
                <button
                    className={`toggle-btn ${currentStock.isActive ? 'deactivate' : 'activate'}`}
                    onClick={handleToggleActive}
                    disabled={loading}
                >
                    {currentStock.isActive ? 'Исключить из торгов' : 'Включить в торги'}
                </button>

                <button
                    className="history-btn"
                    onClick={handleShowHistory}
                    disabled={loading}
                >
                    {showHistory ? 'Скрыть историю' : 'Показать историю'}
                </button>
            </div>

            {/* Секция с историческими данными (графики/таблицы) */}
            {showHistory && (
                <div className="history-section">
                    {loading ? (
                        <div className="loading">Загрузка исторических данных...</div>
                    ) : (
                        <>
                            {/* Заголовок и управление отображением */}
                            <div className="history-header">
                                <h4>Исторические данные ({history.length} торговых дней)</h4>
                                <div className="view-controls">
                                    {/* Управление временным диапазоном */}
                                    <div className="time-range-controls">
                                        <button
                                            className={`time-range-btn ${timeRange === '1y' ? 'active' : ''}`}
                                            onClick={() => setTimeRange('1y')}
                                        >
                                            1 год
                                        </button>
                                        <button
                                            className={`time-range-btn ${timeRange === '2y' ? 'active' : ''}`}
                                            onClick={() => setTimeRange('2y')}
                                        >
                                            2 года
                                        </button>
                                        <button
                                            className={`time-range-btn ${timeRange === 'all' ? 'active' : ''}`}
                                            onClick={() => setTimeRange('all')}
                                        >
                                            Все данные
                                        </button>
                                    </div>
                                    {/* Управление типом отображения */}
                                    <div className="view-type-controls">
                                        <button
                                            className={`view-btn ${viewMode === 'chart' ? 'active' : ''}`}
                                            onClick={() => setViewMode('chart')}
                                        >
                                            График
                                        </button>
                                        <button
                                            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                                            onClick={() => setViewMode('table')}
                                        >
                                            Таблица
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {history.length > 0 ? (
                                <>
                                    {viewMode === 'chart' ? (
                                        // Отображение графика
                                        <>
                                            <div className="chart-container">
                                                <ResponsiveContainer width="100%" height={400}>
                                                    <LineChart data={chartData}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                                        <XAxis
                                                            dataKey="displayDate"
                                                            tick={{ fontSize: 12, fill: '#b0b0b0' }}
                                                            angle={-45}
                                                            textAnchor="end"
                                                            height={80}
                                                            interval="preserveStartEnd"
                                                        />
                                                        <YAxis
                                                            tick={{ fontSize: 12, fill: '#b0b0b0' }}
                                                            tickFormatter={(value) => `$${value.toFixed(0)}`}
                                                        />
                                                        <Tooltip content={<CustomTooltip />} />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="price"
                                                            stroke="#FF8C00"
                                                            strokeWidth={2}
                                                            dot={false}
                                                            activeDot={{ r: 4, fill: '#FF8C00' }}
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>

                                            {/* Статистика по акции */}
                                            {stats && (
                                                <div className="history-stats">
                                                    <div className="stat">
                                                        <span className="stat-label">Текущая цена:</span>
                                                        <span className="stat-value">{formatPrice(currentStock.price)}</span>
                                                    </div>
                                                    <div className="stat">
                                                        <span className="stat-label">Год назад:</span>
                                                        <span className="stat-value">${stats.startPrice.toFixed(2)}</span>
                                                    </div>
                                                    <div className="stat">
                                                        <span className="stat-label">Максимум:</span>
                                                        <span className="stat-value">${stats.maxPrice.toFixed(2)}</span>
                                                    </div>
                                                    <div className="stat">
                                                        <span className="stat-label">Минимум:</span>
                                                        <span className="stat-value">${stats.minPrice.toFixed(2)}</span>
                                                    </div>
                                                    <div className="stat">
                                                        <span className="stat-label">Изменение за год:</span>
                                                        <span className={`stat-value ${stats.yearlyChange >= 0 ? 'positive' : 'negative'}`}>
                                                            {stats.yearlyChange >= 0 ? '+' : ''}{stats.yearlyChange.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="stat">
                                                        <span className="stat-label">% изменения:</span>
                                                        <span className={`stat-value ${stats.yearlyChangePercent >= 0 ? 'positive' : 'negative'}`}>
                                                            {stats.yearlyChangePercent >= 0 ? '+' : ''}{stats.yearlyChangePercent.toFixed(2)}%
                                                        </span>
                                                    </div>
                                                    <div className="stat">
                                                        <span className="stat-label">Всего дней:</span>
                                                        <span className="stat-value">{stats.totalDays}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Последние торговые дни */}
                                            <div className="recent-trades">
                                                <h5>Последние 10 торговых дней:</h5>
                                                <div className="trades-list">
                                                    {history.slice(-10).reverse().map((item, index) => (
                                                        <div key={index} className="trade-item">
                                                            <span className="trade-date">{item.date}</span>
                                                            <span className="trade-price">${(item.price || item.open || 0).toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        // Отображение таблицы
                                        <StockHistoryTable history={history} stockSymbol={currentStock.symbol} />
                                    )}
                                </>
                            ) : (
                                <p>Исторические данные не найдены</p>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default StockCard;