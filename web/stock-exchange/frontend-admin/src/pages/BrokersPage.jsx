import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBrokers, clearError, clearSuccess } from '../store/slices/brokersSlice';
import BrokerForm from '../components/BrokerForm';
import BrokerList from '../components/BrokerList';
import './BrokersPage.css';

/**
 * Страница управления брокерами
 * Отображает форму добавления брокеров и список существующих брокеров
 * Обрабатывает загрузку данных, ошибки и успешные операции
 */
const BrokersPage = () => {
    const dispatch = useDispatch();

    // Получаем состояние брокеров из Redux store
    const { error, success, loading } = useSelector((state) => state.brokers);

    /**
     * Эффект для загрузки брокеров при монтировании компонента
     */
    useEffect(() => {
        dispatch(fetchBrokers());
    }, [dispatch]);

    /**
     * Эффект для автоматического скрытия ошибок через 5 секунд
     */
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                dispatch(clearError());
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, dispatch]);

    /**
     * Эффект для автоматического скрытия успешных сообщений через 3 секунды
     */
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                dispatch(clearSuccess());
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, dispatch]);

    return (
        <div className="brokers-page">
            {/* Заголовок страницы */}
            <div className="page-header">
                <h1>Управление брокерами</h1>
                <p>Добавляйте, редактируйте и удаляйте брокеров для участия в торгах</p>
            </div>

            {/* Отображение ошибок если они есть */}
            {error && (
                <div className="alert alert-error">
                    ❌ {error}
                    <button onClick={() => dispatch(clearError())} className="alert-close">×</button>
                </div>
            )}

            {/* Отображение успешных сообщений */}
            {success && (
                <div className="alert alert-success">
                    ✅ {success}
                    <button onClick={() => dispatch(clearSuccess())} className="alert-close">×</button>
                </div>
            )}

            {/* Основное содержимое страницы */}
            <div className="brokers-content">
                {/* Секция с формой добавления брокера */}
                <div className="content-section">
                    <BrokerForm />
                </div>

                {/* Секция со списком брокеров */}
                <div className="content-section">
                    <BrokerList />
                </div>
            </div>
        </div>
    );
};

export default BrokersPage;