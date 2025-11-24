import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addBroker } from '../store/slices/brokersSlice';
import './BrokerForm.css';

/**
 * Компонент формы для добавления нового брокера
 * Содержит поля для ввода имени и начального баланса
 */
const BrokerForm = () => {
    const dispatch = useDispatch();

    // Состояние формы
    const [formData, setFormData] = useState({
        name: '',              // Имя брокера
        initialBalance: ''     // Начальный баланс
    });

    /**
     * Обработчик отправки формы
     * @param e - событие формы
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        // Проверяем что все поля заполнены
        if (formData.name && formData.initialBalance) {
            // Диспатчим действие добавления брокера
            dispatch(addBroker({
                name: formData.name,
                initialBalance: parseFloat(formData.initialBalance)
            }));

            // Сбрасываем форму после успешной отправки
            setFormData({ name: '', initialBalance: '' });
        }
    };

    /**
     * Обработчик изменения полей формы
     * @param e - событие изменения input
     */
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="broker-form">
            <h3>Добавить нового брокера</h3>

            {/* Форма добавления брокера */}
            <form onSubmit={handleSubmit}>
                {/* Поле для имени брокера */}
                <div className="form-group">
                    <label htmlFor="name">Имя брокера:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Введите имя брокера"
                        required
                    />
                </div>

                {/* Поле для начального баланса */}
                <div className="form-group">
                    <label htmlFor="initialBalance">Начальный баланс ($):</label>
                    <input
                        type="number"
                        id="initialBalance"
                        name="initialBalance"
                        value={formData.initialBalance}
                        onChange={handleChange}
                        placeholder="100000"
                        min="0"
                        step="0.01"
                        required
                    />
                </div>

                {/* Кнопка отправки формы */}
                <button type="submit" className="submit-btn">
                    ➕ Добавить брокера
                </button>
            </form>
        </div>
    );
};

export default BrokerForm;