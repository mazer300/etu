/*
 * Программа для демонстрации конкуренции процессов с разными политиками планирования.
 *
 * Задание: 5.5. Проверить конкуренцию процессов с разными процедурами планирования и одинаковыми приоритетами.
 *
 * Описание:
 * - Создаются три дочерних процесса.
 * - Каждому процессу устанавливается своя политика планирования (SCHED_OTHER, SCHED_FIFO, SCHED_RR).
 * - Приоритеты одинаковые (если применимо).
 * - Процессы выводят информацию о себе и выполняются некоторое время.
 * - Наблюдается очередность исполнения.
 *
 * Компиляция:
 * gcc sched_5_5.c -o sched_5_5
 *
 * Запуск:
 * sudo ./sched_5_5
 */

#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sched.h>
#include <sys/wait.h>

void child_task(const char *name) {
    printf("Процесс %s: PID=%d, политика=%d\n", name, getpid(), sched_getscheduler(0));
    for (int i = 0; i < 5; i++) {
        printf("%s итерация %d\n", name, i+1);
        usleep(100000);  // небольшая пауза
    }
    exit(0);
}

int main() {
    pid_t pid1, pid2, pid3;
    struct sched_param param;
    param.sched_priority = 10; // средний приоритет

    printf("Родительский процесс: PID=%d\n", getpid());

    pid1 = fork();
    if (pid1 == 0) {
        sched_setscheduler(0, SCHED_OTHER, &param);
        child_task("SCHED_OTHER");
    }

    pid2 = fork();
    if (pid2 == 0) {
        sched_setscheduler(0, SCHED_FIFO, &param);
        child_task("SCHED_FIFO");
    }

    pid3 = fork();
    if (pid3 == 0) {
        sched_setscheduler(0, SCHED_RR, &param);
        child_task("SCHED_RR");
    }

    // Ожидание завершения всех дочерних процессов
    wait(NULL);
    wait(NULL);
    wait(NULL);

    printf("Родительский процесс завершает работу.\n");
    return 0;
}
