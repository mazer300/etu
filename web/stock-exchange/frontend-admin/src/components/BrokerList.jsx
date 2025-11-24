import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateBroker, deleteBroker } from '../store/slices/brokersSlice';
import './BrokerList.css';

/**
 * Компонент для отображения списка брокеров
 * Поддерживает редактирование и удаление брокеров
 */
const BrokerList = () => {
    const dispatch = useDispatch();

    // Получаем данные брокеров из Redux store
    const { items: brokers, loading } = useSelector((state) => state.brokers);

    // Состояние для управления редактированием
    const [editingId, setEditingId] = useState(null);      // ID редактируемого брокера
    const [editForm, setEditForm] = useState({            // Данные формы редактирования
        name: '',
        initialBalance: ''
    });

    /**
     * Начинает редактирование брокера
     * @param broker - объект брокера для редактирования
     */
    const startEdit = (broker) => {
        setEditingId(broker.id);
        setEditForm({
            name: broker.name,
            initialBalance: broker.initialBalance.toString()
        });
    };

    /**
     * Отменяет редактирование брокера
     */
    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ name: '', initialBalance: '' });
    };

    /**
     * Обработчик обновления данных брокера
     * @param e - событие формы
     * @param id - ID брокера для обновления
     */
    const handleUpdate = (e, id) => {
        e.preventDefault();

        // Проверяем что все поля заполнены
        if (editForm.name && editForm.initialBalance) {
            // Диспатчим действие обновления брокера
            dispatch(updateBroker({
                id,
                name: editForm.name,
                initialBalance: parseFloat(editForm.initialBalance)
            }));

            // Сбрасываем состояние редактирования
            setEditingId(null);
            setEditForm({ name: '', initialBalance: '' });
        }
    };

    /**
     * Обработчик удаления брокера
     * @param id - ID брокера для удаления
     * @param name - имя брокера для подтверждения
     */
    const handleDelete = (id, name) => {
        // Запрашиваем подтверждение удаления
        if (window.confirm(`Вы уверены, что хотите удалить брокера "${name}"?`)) {
            dispatch(deleteBroker(id));
        }
    };

    // Показываем индикатор загрузки
    if (loading) {
        return <div className="loading">Загрузка брокеров...</div>;
    }

    // Сообщение если брокеров нет
    if (brokers.length === 0) {
        return (
            <div className="empty-state">
                <h3>Список брокеров</h3>
                <p>Пока нет ни одного брокера. Добавьте первого!</p>
            </div>
        );
    }

    return (
        <div className="broker-list">
            <h3>Список брокеров ({brokers.length})</h3>

            {/* Сетка карточек брокеров */}
            <div className="brokers-grid">
                {brokers.map(broker => (
                    <div key={broker.id} className="broker-card">
                        {editingId === broker.id ? (
                            // Форма редактирования брокера
                            <form onSubmit={(e) => handleUpdate(e, broker.id)} className="edit-form">
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    placeholder="Имя брокера"
                                    required
                                />
                                <input
                                    type="number"
                                    value={editForm.initialBalance}
                                    onChange={(e) => setEditForm({...editForm, initialBalance: e.target.value})}
                                    placeholder="Баланс"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                                <div className="edit-actions">
                                    <button type="submit" className="save-btn">Сохранить</button>
                                    <button type="button" onClick={cancelEdit} className="cancel-btn">Отмена</button>
                                </div>
                            </form>
                        ) : (
                            // Отображение информации о брокере
                            <>
                                <div className="broker-header">
                                    <h4>{broker.name}</h4>
                                    <div className="broker-actions">
                                        {/* Кнопка редактирования */}
                                        <button
                                            onClick={() => startEdit(broker)}
                                            className="edit-btn"
                                            title="Редактировать"
                                        >
                                            ✏️
                                        </button>
                                        {/* Кнопка удаления */}
                                        <button
                                            onClick={() => handleDelete(broker.id, broker.name)}
                                            className="delete-btn"
                                            title="Удалить"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                <div className="broker-details">
                                    {/* Информация о балансе */}
                                    <div className="balance-info">
                                        <span className="label">Текущий баланс:</span>
                                        <span className="value current">
                                            ${broker.currentBalance.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="balance-info">
                                        <span className="label">Начальный баланс:</span>
                                        <span className="value initial">
                                            ${broker.initialBalance.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>

                                    {/* Мета-информация */}
                                    <div className="broker-meta">
                                        <small>ID: {broker.id}</small>
                                        <small>Создан: {new Date(broker.createdAt).toLocaleDateString('ru-RU')}</small>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BrokerList;