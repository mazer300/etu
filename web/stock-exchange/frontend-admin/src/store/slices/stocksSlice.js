import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Базовый URL для API запросов
const API_URL = 'http://localhost:3011/api';

/**
 * Асинхронный action для загрузки списка акций с сервера
 */
export const fetchStocks = createAsyncThunk(
    'stocks/fetchStocks',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/stocks`);
            return response.data;
        } catch (error) {
            return rejectWithValue('Ошибка загрузки акций');
        }
    }
);

/**
 * Асинхронный action для обновления статуса акции (активная/неактивная)
 */
export const updateStock = createAsyncThunk(
    'stocks/updateStock',
    async (updateData, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${API_URL}/stocks/${updateData.symbol}/toggle`, {
                isActive: updateData.isActive
            });
            return response.data.stock;
        } catch (error) {
            return rejectWithValue('Ошибка обновления акции');
        }
    }
);

/**
 * Slice для управления состоянием акций в Redux store
 */
const stocksSlice = createSlice({
    name: 'stocks',
    initialState: {
        items: [],      // Список акций
        loading: false, // Флаг загрузки
        error: null,    // Ошибки
    },
    reducers: {
        /**
         * Очищает ошибки в состоянии
         */
        clearError: (state) => {
            state.error = null;
        },

        /**
         * Обновляет цену акции в реальном времени (вызывается из WebSocket)
         */
        updateStockPrice: (state, action) => {
            const { symbol, price, change, changePercent } = action.payload;
            const stockIndex = state.items.findIndex(s => s.symbol === symbol);
            if (stockIndex !== -1) {
                state.items[stockIndex].price = price;
                state.items[stockIndex].change = change;
                state.items[stockIndex].changePercent = changePercent;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Обработка загрузки акций
            .addCase(fetchStocks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStocks.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchStocks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Обработка обновления акции
            .addCase(updateStock.fulfilled, (state, action) => {
                const index = state.items.findIndex(s => s.symbol === action.payload.symbol);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(updateStock.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

// Экспортируем actions и reducer
export const { clearError, updateStockPrice } = stocksSlice.actions;
export default stocksSlice.reducer;