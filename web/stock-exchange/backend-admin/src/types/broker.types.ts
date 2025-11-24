export interface Broker {
    id: number;
    name: string;
    initialBalance: number;
    currentBalance: number;
    createdAt: string;
    portfolio?: {
        [symbol: string]: {
            quantity: number;
            averagePrice: number;
        };
    };
}