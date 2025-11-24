import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Базовый URL для API запросов
const API_URL = 'http://localhost:3011/api';

/**
 * Асинхронный action для загрузки списка брокеров с сервера
 */
export const fetchBrokers = createAsyncThunk(
    'brokers/fetchBrokers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/brokers`);
            return response.data;
        } catch (error) {
            return rejectWithValue('Ошибка загрузки брокеров');
        }
    }
);

/**
 * Асинхронный action для добавления нового брокера
 * @param brokerData - данные нового брокера
 */
export const addBroker = createAsyncThunk(
    'brokers/addBroker',
    async (brokerData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/brokers`, brokerData);
            return response.data;
        } catch (error) {
            return rejectWithValue('Ошибка добавления брокера');
        }
    }
);

/**
 * Асинхронный action для обновления данных брокера
 * @param updateData - объект с ID брокера и новыми данными
 */
export const updateBroker = createAsyncThunk(
    'brokers/updateBroker',
    async (updateData, { rejectWithValue }) => {
        try {
            const { id, ...brokerData } = updateData;
            const response = await axios.put(`${API_URL}/brokers/${id}`, brokerData);
            return response.data;
        } catch (error) {
            return rejectWithValue('Ошибка обновления брокера');
        }
    }
);

/**
 * Асинхронный action для удаления брокера
 * @param id - ID брокера для удаления
 */
export const deleteBroker = createAsyncThunk(
    'brokers/deleteBroker',
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`${API_URL}/brokers/${id}`);
            return id; // Возвращаем ID для удаления из состояния
        } catch (error) {
            return rejectWithValue('Ошибка удаления брокера');
        }
    }
);

/**
 * Slice для управления состоянием брокеров в Redux store
 */
const brokersSlice = createSlice({
    name: 'brokers',
    initialState: {
        items: [],      // Список брокеров
        loading: false, // Флаг загрузки
        error: null,    // Ошибки
        success: null,  // Успешные сообщения
    },
    reducers: {
        /**
         * Очищает ошибки в состоянии
         */
        clearError: (state) => {
            state.error = null;
        },

        /**
         * Очищает успешные сообщения
         */
        clearSuccess: (state) => {
            state.success = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Обработка загрузки брокеров
            .addCase(fetchBrokers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBrokers.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchBrokers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Обработка добавления брокера
            .addCase(addBroker.pending, (state) => {
                state.error = null;
                state.success = null;
            })
            .addCase(addBroker.fulfilled, (state, action) => {
                state.items.push(action.payload);
                state.success = 'Брокер успешно добавлен';
            })
            .addCase(addBroker.rejected, (state, action) => {
                state.error = action.payload;
            })

            // Обработка обновления брокера
            .addCase(updateBroker.fulfilled, (state, action) => {
                const index = state.items.findIndex(b => b.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                state.success = 'Брокер успешно обновлен';
            })
            .addCase(updateBroker.rejected, (state, action) => {
                state.error = action.payload;
            })

            // Обработка удаления брокера
            .addCase(deleteBroker.fulfilled, (state, action) => {
                state.items = state.items.filter(b => b.id !== action.payload);
                state.success = 'Брокер успешно удален';
            })
            .addCase(deleteBroker.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

// Экспортируем actions и reducer
export const { clearError, clearSuccess } = brokersSlice.actions;
export default brokersSlice.reducer;