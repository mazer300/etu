import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App';

/**
 * Точка входа в React приложение
 * Настраивает рендеринг корневого компонента
 */
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

// Создаем корневой элемент React 18
const root = ReactDOM.createRoot(rootElement);

// Рендерим приложение с обертками провайдеров
root.render(
    <React.StrictMode>
        {/* Redux Provider для доступа к store */}
        <Provider store={store}>
            {/* BrowserRouter для маршрутизации */}
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
);