/*
 * Программа для демонстрации использования SCHED_FIFO с одинаковыми приоритетами.
 * Каждый процесс будет работать 2 секунды и завершится.
 *
 * Компиляция:
 * gcc 5_3_1_simple.c -o 5_3_1_simple
 *
 * Запуск:
 * sudo ./5_3_1_simple
 */

#include <stdio.h>
#include <unistd.h>
#include <sched.h>
#include <sys/wait.h>
#include <stdlib.h>

int main() {
    pid_t pids[3];

    for (int i = 0; i < 3; i++) {
        pid_t pid = fork();
        if (pid == 0) {
            // Устанавливаем приоритет для процесса
            struct sched_param param = { .sched_priority = 10 };
            sched_setscheduler(0, SCHED_FIFO, &param);

            printf("Процесс PID=%d стартует\n", getpid());
            sleep(2);  // Процесс завершится через 2 секунды
            printf("Процесс PID=%d завершился\n", getpid());
            exit(0);
        } else if (pid > 0) {
            pids[i] = pid;
        } else {
            perror("fork");
            exit(1);
        }
    }

    // Родитель ждет завершения всех процессов
    for (int i = 0; i < 3; i++) {
        waitpid(pids[i], NULL, 0);
    }

    printf("Главный процесс завершает работу.\n");
    return 0;
}

