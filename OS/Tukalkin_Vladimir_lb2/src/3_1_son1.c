#include <stdio.h>
#include <unistd.h>
#include <signal.h>

int main() {
    printf("son1 (PID: %d) ждет сигнала (реакция по умолчанию)...\n", getpid());
    pause(); // Ждёт сигнал
    return 0;
}
