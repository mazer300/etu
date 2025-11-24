export interface Stock {
    symbol: string;
    companyName: string;
    description: string;
    sector: string;
    isActive: boolean;
    price: number;
    change: number;
    changePercent: number;
}

export interface StockHistory {
    date: string;
    open: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
}

export interface PriceUpdate {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    date: string;
}