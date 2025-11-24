import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import BrokersPage from './pages/BrokersPage';
import ExchangePage from './pages/ExchangePage';
import StocksPage from './pages/StocksPage';
import './App.css';

/**
 * Главный компонент приложения React
 * Содержит навигацию и маршрутизацию между страницами
 */
function App() {
    return (
        <div className="app">
            {/* Навигационная панель */}
            <nav className="navbar">
                <div className="nav-container">
                    <h1 className="nav-title">Биржевая система - Админ</h1>
                    <div className="nav-links">
                        {/* Ссылки на основные разделы приложения */}
                        <Link to="/brokers" className="nav-link">Брокеры</Link>
                        <Link to="/stocks" className="nav-link">Акции</Link>
                        <Link to="/exchange" className="nav-link">Настройки биржи</Link>
                        {/* Внешняя ссылка на клиентскую часть биржи */}
                        <a
                            href="http://localhost:3012"
                            className="nav-link"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            📊 Биржа
                        </a>
                    </div>
                </div>
            </nav>

            {/* Основное содержимое страницы */}
            <main className="main-content">
                {/* Маршрутизация между страницами */}
                <Routes>
                    {/* Главная страница перенаправляет на брокеров */}
                    <Route path="/" element={<BrokersPage />} />
                    {/* Страница управления брокерами */}
                    <Route path="/brokers" element={<BrokersPage />} />
                    {/* Страница управления акциями с графиками */}
                    <Route path="/stocks" element={<StocksPage />} />
                    {/* Страница настроек биржи и запуска торгов */}
                    <Route path="/exchange" element={<ExchangePage />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;