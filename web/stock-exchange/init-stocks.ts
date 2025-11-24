import * as fs from 'fs/promises';
import * as path from 'path';

// Простые исторические данные для всех акций (20 дней)
const stockData = {
    aapl: [
        {"date": "10/01/2024", "open": 170.15, "high": 172.45, "low": 169.80, "close": 171.25},
        {"date": "10/02/2024", "open": 171.50, "high": 173.20, "low": 170.75, "close": 172.80},
        {"date": "10/03/2024", "open": 172.90, "high": 174.60, "low": 172.10, "close": 173.45},
        {"date": "10/04/2024", "open": 173.60, "high": 175.30, "low": 172.90, "close": 174.20},
        {"date": "10/07/2024", "open": 174.40, "high": 176.10, "low": 173.80, "close": 175.65},
        {"date": "10/08/2024", "open": 175.80, "high": 177.25, "low": 175.20, "close": 176.40},
        {"date": "10/09/2024", "open": 176.60, "high": 178.15, "low": 176.00, "close": 177.80},
        {"date": "10/10/2024", "open": 177.90, "high": 179.45, "low": 177.30, "close": 178.95},
        {"date": "10/11/2024", "open": 179.10, "high": 180.60, "low": 178.50, "close": 180.25},
        {"date": "10/14/2024", "open": 180.40, "high": 181.90, "low": 179.80, "close": 181.45},
        {"date": "10/15/2024", "open": 181.60, "high": 183.10, "low": 181.00, "close": 182.75},
        {"date": "10/16/2024", "open": 182.90, "high": 184.30, "low": 182.30, "close": 183.95},
        {"date": "10/17/2024", "open": 184.20, "high": 185.60, "low": 183.60, "close": 185.15},
        {"date": "10/18/2024", "open": 185.40, "high": 186.80, "low": 184.80, "close": 186.35},
        {"date": "10/21/2024", "open": 186.60, "high": 188.00, "low": 186.00, "close": 187.55},
        {"date": "10/22/2024", "open": 187.80, "high": 189.20, "low": 187.20, "close": 188.75},
        {"date": "10/23/2024", "open": 189.00, "high": 190.40, "low": 188.40, "close": 189.95},
        {"date": "10/24/2024", "open": 190.20, "high": 191.60, "low": 189.60, "close": 191.15},
        {"date": "10/25/2024", "open": 191.40, "high": 192.80, "low": 190.80, "close": 192.35},
        {"date": "10/28/2024", "open": 192.60, "high": 194.00, "low": 192.00, "close": 193.55}
    ],
    msft: [
        {"date": "10/01/2024", "open": 320.15, "high": 322.45, "low": 319.80, "close": 321.25},
        {"date": "10/02/2024", "open": 321.50, "high": 323.20, "low": 320.75, "close": 322.80},
        {"date": "10/03/2024", "open": 322.90, "high": 324.60, "low": 322.10, "close": 323.45},
        {"date": "10/04/2024", "open": 323.60, "high": 325.30, "low": 322.90, "close": 324.20},
        {"date": "10/07/2024", "open": 324.40, "high": 326.10, "low": 323.80, "close": 325.65},
        {"date": "10/08/2024", "open": 325.80, "high": 327.25, "low": 325.20, "close": 326.40},
        {"date": "10/09/2024", "open": 326.60, "high": 328.15, "low": 326.00, "close": 327.80},
        {"date": "10/10/2024", "open": 327.90, "high": 329.45, "low": 327.30, "close": 328.95},
        {"date": "10/11/2024", "open": 329.10, "high": 330.60, "low": 328.50, "close": 330.25},
        {"date": "10/14/2024", "open": 330.40, "high": 331.90, "low": 329.80, "close": 331.45},
        {"date": "10/15/2024", "open": 331.60, "high": 333.10, "low": 331.00, "close": 332.75},
        {"date": "10/16/2024", "open": 332.90, "high": 334.30, "low": 332.30, "close": 333.95},
        {"date": "10/17/2024", "open": 334.20, "high": 335.60, "low": 333.60, "close": 335.15},
        {"date": "10/18/2024", "open": 335.40, "high": 336.80, "low": 334.80, "close": 336.35},
        {"date": "10/21/2024", "open": 336.60, "high": 338.00, "low": 336.00, "close": 337.55},
        {"date": "10/22/2024", "open": 337.80, "high": 339.20, "low": 337.20, "close": 338.75},
        {"date": "10/23/2024", "open": 339.00, "high": 340.40, "low": 338.40, "close": 339.95},
        {"date": "10/24/2024", "open": 340.20, "high": 341.60, "low": 339.60, "close": 341.15},
        {"date": "10/25/2024", "open": 341.40, "high": 342.80, "low": 340.80, "close": 342.35},
        {"date": "10/28/2024", "open": 342.60, "high": 344.00, "low": 342.00, "close": 343.55}
    ]
};

async function initStocks() {
    const stocksDir = path.join(__dirname, '../data/stocks');

    try {
        // Создаем папку если не существует
        await fs.mkdir(stocksDir, { recursive: true });

        // Создаем файлы для каждой акции
        for (const [symbol, data] of Object.entries(stockData)) {
            const filePath = path.join(stocksDir, `${symbol}.json`);
            await fs.writeFile(filePath, JSON.stringify(data, null, 2));
            console.log(`Created ${symbol}.json with ${data.length} records`);
        }

        console.log('All stock data initialized successfully!');
    } catch (error) {
        console.error('Error initializing stock data:', error);
    }
}

initStocks();