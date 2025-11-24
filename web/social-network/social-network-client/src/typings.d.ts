// Типы для socket.io-client
declare module 'socket.io-client' {
    export interface Socket {
        on(event: string, callback: (data: any) => void): void;
        emit(event: string, data?: any): void;
        disconnect(): void;
    }

    export function io(url: string, options?: any): Socket;
}