import React from 'react';
import './StockHistoryTable.css';

/**
 * Компонент таблицы для отображения исторических данных акции
 * Показывает даты, цены, изменения и объемы торгов
 */
const StockHistoryTable = ({ history, stockSymbol }) => {
    // Сообщение если исторических данных нет
    if (!history || history.length === 0) {
        return <div className="no-data">Нет исторических данных</div>;
    }

    /**
     * Форматирует дату в русский формат
     * @param dateStr - строка даты в формате ММ/ДД/ГГГГ
     */
    const formatDate = (dateStr) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('ru-RU');
        } catch {
            return dateStr;
        }
    };

    /**
     * Форматирует объем торгов в читаемый вид
     * @param volume - объем торгов
     */
    const formatVolume = (volume) => {
        if (!volume) return 'N/A';
        return Math.round(volume / 1000) + 'K'; // Преобразуем в тысячи
    };

    // Сортируем исторические данные по дате (от новых к старым)
    const sortedHistory = [...history].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <div className="history-table-container">
            <h4>Таблица исторических данных для {stockSymbol}</h4>

            {/* Обертка таблицы с прокруткой */}
            <div className="table-wrapper">
                <table className="history-table">
                    <thead>
                    <tr>
                        <th>Дата</th>
                        <th>Цена открытия</th>
                        <th>Изменение</th>
                        <th>Объем</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedHistory.map((item, index) => {
                        // Рассчитываем изменение цены относительно предыдущего дня
                        const prevItem = sortedHistory[index + 1];
                        const change = prevItem ? item.price - prevItem.price : 0;
                        const changePercent = prevItem ? (change / prevItem.price) * 100 : 0;

                        return (
                            <tr key={index}>
                                {/* Ячейка с датой */}
                                <td className="date-cell">{formatDate(item.date)}</td>

                                {/* Ячейка с ценой */}
                                <td className="price-cell">
                                    ${item.price?.toFixed(2) || item.open?.toFixed(2) || '0.00'}
                                </td>

                                {/* Ячейка с изменением цены */}
                                <td className={`change-cell ${change >= 0 ? 'positive' : 'negative'}`}>
                                    {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
                                </td>

                                {/* Ячейка с объемом торгов */}
                                <td className="volume-cell">
                                    {formatVolume(item.volume)}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            {/* Статистика таблицы */}
            <div className="table-stats">
                <div className="stat">
                    <span>Всего записей:</span>
                    <strong>{history.length}</strong>
                </div>
                <div className="stat">
                    <span>Период:</span>
                    <strong>
                        {formatDate(history[history.length - 1]?.date)} - {formatDate(history[0]?.date)}
                    </strong>
                </div>
            </div>
        </div>
    );
};

export default StockHistoryTable;