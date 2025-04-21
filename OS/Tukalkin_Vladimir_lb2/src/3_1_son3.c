#include <stdio.h>
#include <unistd.h>
#include <signal.h>

void handler(int sig) {
    printf("son3 (PID: %d) перехватил сигнал %d\n", getpid(), sig);
}

int main() {
    signal(SIGUSR1, handler);
    printf("son3 (PID: %d) ждет сигнал SIGUSR1 для обработки...\n", getpid());
    pause(); // Ждёт сигнал
    printf("son3 завершает выполнение после обработки сигнала\n");
    return 0;
}
