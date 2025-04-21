#include <stdio.h>
#include <unistd.h>
#include <signal.h>

int main() {
    signal(SIGUSR1, SIG_IGN); // Игнорировать сигнал
    printf("son2 (PID: %d) игнорирует сигнал SIGUSR1\n", getpid());
    pause(); // Ждёт сигнал
    printf("son2 выжил после сигнала и завершился\n");
    return 0;
}
