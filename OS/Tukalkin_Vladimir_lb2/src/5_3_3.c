/*
 * Программа для демонстрации использования SCHED_FIFO с тремя процессами.
 * Один процесс с наивысшим приоритетом будет запущен в середине.
 *
 * Компиляция:
 * gcc 5_3_3.c -o 5_3_3
 *
 * Запуск:
 * sudo ./5_3_3
 */

#include <stdio.h>
#include <unistd.h>
#include <sched.h>
#include <sys/wait.h>
#include <stdlib.h>

int main() {
    pid_t pids[3];

    // Процесс с низким приоритетом
    pid_t pid = fork();
    if (pid == 0) {
        struct sched_param param = { .sched_priority = 5 };  // Низкий приоритет
        sched_setscheduler(0, SCHED_FIFO, &param);

        printf("Процесс с низким приоритетом 1 PID=%d стартует\n", getpid());
        sleep(2);  // Процесс завершится через 2 секунды
        printf("Процесс с низким приоритетом 1 PID=%d завершился\n", getpid());
        exit(0);
    } else if (pid > 0) {
        pids[0] = pid;
    } else {
        perror("fork");
        exit(1);
    }

    // Процесс с высоким приоритетом (в середине)
    pid = fork();
    if (pid == 0) {
        struct sched_param param = { .sched_priority = -5 };  // Высокий приоритет
        sched_setscheduler(0, SCHED_FIFO, &param);

        printf("Процесс с высоким приоритетом PID=%d стартует\n", getpid());
        sleep(2);  // Процесс завершится через 2 секунды
        printf("Процесс с высоким приоритетом PID=%d завершился\n", getpid());
        exit(0);
    } else if (pid > 0) {
        pids[1] = pid;
    } else {
        perror("fork");
        exit(1);
    }

    // Процесс с низким приоритетом
    pid = fork();
    if (pid == 0) {
        struct sched_param param = { .sched_priority = 5 };  // Низкий приоритет
        sched_setscheduler(0, SCHED_FIFO, &param);

        printf("Процесс с низким приоритетом 2 PID=%d стартует\n", getpid());
        sleep(2);  // Процесс завершится через 2 секунды
        printf("Процесс с низким приоритетом 2 PID=%d завершился\n", getpid());
        exit(0);
    } else if (pid > 0) {
        pids[2] = pid;
    } else {
        perror("fork");
        exit(1);
    }

    // Родитель ждет завершения всех процессов
    for (int i = 0; i < 3; i++) {
        waitpid(pids[i], NULL, 0);
    }

    printf("Главный процесс завершает работу.\n");
    return 0;
}

