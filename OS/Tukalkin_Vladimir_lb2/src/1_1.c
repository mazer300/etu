/*
 * Программа: Управление процессами — создание фоновых задач
 *
 * Назначение:
 * Программа демонстрирует базовое создание процессов с использованием fork().
 * Создаются два дочерних процесса, которые засыпают на длительное время, 
 * имитируя работу фоновых задач.
 * Родительский процесс выводит список запущенных процессов с помощью команды `ps`.
 *
 * Основные понятия:
 * - fork()
 * - sleep()
 * - system()
 * - Идентификаторы процессов (PID, PPID)
 */

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    pid_t pid1, pid2;

    // Первый процесс
    pid1 = fork();
    if (pid1 == 0) {
        printf("Child 1 started (PID: %d)\n", getpid());
        sleep(25);
        exit(0);
    }

    // Второй процесс
    pid2 = fork();
    if (pid2 == 0) {
        printf("Child 2 started (PID: %d)\n", getpid());
        sleep(50);
        exit(0);
    }

    // Родитель
    printf("Parent process (PID: %d)\n", getpid());
    printf("Running jobs:\n");
    system("ps --ppid $$");

    wait(NULL);
    wait(NULL);

    return 0;
}
