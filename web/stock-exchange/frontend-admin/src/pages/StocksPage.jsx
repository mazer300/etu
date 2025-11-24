import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStocks } from '../store/slices/stocksSlice';
import StockCard from '../components/StockCard';
import './StocksPage.css';

/**
 * Страница управления акциями
 * Отображает список всех акций с возможностью фильтрации
 * Показывает графики и исторические данные для каждой акции
 */
const StocksPage = () => {
    const dispatch = useDispatch();

    // Получаем данные акций из Redux store
    const { items: stocks, loading, error } = useSelector((state) => state.stocks);

    // Состояние фильтра для отображения акций
    const [filter, setFilter] = useState('all'); // 'all', 'active', 'inactive'

    /**
     * Эффект для загрузки акций при монтировании компонента
     */
    useEffect(() => {
        dispatch(fetchStocks());
    }, [dispatch]);

    /**
     * Фильтрует акции по выбранному критерию
     */
    const filteredStocks = stocks.filter(stock => {
        if (filter === 'all') return true;
        if (filter === 'active') return stock.isActive;
        if (filter === 'inactive') return !stock.isActive;
        return true;
    });

    // Показываем индикатор загрузки пока данные загружаются
    if (loading) {
        return (
            <div className="stocks-page">
                <div className="page-header">
                    <h1>Акции</h1>
                    <p>Загрузка данных об акциях...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="stocks-page">
            {/* Заголовок страницы */}
            <div className="page-header">
                <h1>Управление акциями</h1>
                <p>Просмотр графиков, активация и деактивация акций для торгов</p>
            </div>

            {/* Отображение ошибок если они есть */}
            {error && (
                <div className="alert alert-error">
                    ❌ {error}
                </div>
            )}

            {/* Панель управления фильтрами и информацией */}
            <div className="stocks-controls">
                {/* Блок фильтров */}
                <div className="filter-controls">
                    <h3>Фильтр акций:</h3>
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            Все акции
                        </button>
                        <button
                            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                            onClick={() => setFilter('active')}
                        >
                            Активные
                        </button>
                        <button
                            className={`filter-btn ${filter === 'inactive' ? 'active' : ''}`}
                            onClick={() => setFilter('inactive')}
                        >
                            Неактивные
                        </button>
                    </div>
                </div>

                {/* Блок статистики */}
                <div className="stocks-info">
                    <span>Всего: {stocks.length}</span>
                    <span>Активные: {stocks.filter(s => s.isActive).length}</span>
                    <span>Неактивные: {stocks.filter(s => !s.isActive).length}</span>
                </div>
            </div>

            {/* Сетка карточек акций */}
            <div className="stocks-grid">
                {filteredStocks.map(stock => (
                    <StockCard key={stock.symbol} stock={stock} />
                ))}
            </div>

            {/* Сообщение если акции не найдены */}
            {filteredStocks.length === 0 && (
                <div className="no-stocks">
                    <h3>Акции не найдены</h3>
                    <p>Попробуйте изменить фильтр</p>
                </div>
            )}
        </div>
    );
};

export default StocksPage;