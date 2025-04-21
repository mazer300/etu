/*
 * Программа для демонстрации использования политики планирования SCHED_RR
 * и изменения приоритетов для трех процессов.
 *
 * Задание: 5.4. Измените процедуру планирования на RR и повторите эксперименты
 * с приоритетами, анализируя очередность исполнения процессов.
 *
 * Компиляция:
 * gcc 5_4_rr.c -o 5_4_rr
 *
 * Запуск:
 * sudo ./5_4_rr
 */

#include <stdio.h>
#include <unistd.h>
#include <sched.h>
#include <sys/wait.h>
#include <stdlib.h>

int main() {
    pid_t pids[3];

    // Устанавливаем политику планирования SCHED_RR для родительского процесса
    struct sched_param param;
    param.sched_priority = 10;
    if (sched_setscheduler(0, SCHED_RR, &param) == -1) {
        perror("Ошибка установки политики планирования для родительского процесса");
        exit(1);
    }

    // Создание первого процесса
    pid_t pid = fork();
    if (pid == 0) {
        // Дочерний процесс с политикой SCHED_RR
        sched_setscheduler(0, SCHED_RR, &param);
        printf("Процесс 1 с PID=%d выполняется с политикой SCHED_RR\n", getpid());
        sleep(2);  // Выполнение в течение 2 секунд
        printf("Процесс 1 с PID=%d завершен\n", getpid());
        exit(0);
    } else if (pid > 0) {
        pids[0] = pid;
    } else {
        perror("fork");
        exit(1);
    }

    // Создание второго процесса
    pid = fork();
    if (pid == 0) {
        // Дочерний процесс с политикой SCHED_RR
        sched_setscheduler(0, SCHED_RR, &param);
        printf("Процесс 2 с PID=%d выполняется с политикой SCHED_RR\n", getpid());
        sleep(2);  // Выполнение в течение 2 секунд
        printf("Процесс 2 с PID=%d завершен\n", getpid());
        exit(0);
    } else if (pid > 0) {
        pids[1] = pid;
    } else {
        perror("fork");
        exit(1);
    }

    // Создание третьего процесса
    pid = fork();
    if (pid == 0) {
        // Дочерний процесс с политикой SCHED_RR
        sched_setscheduler(0, SCHED_RR, &param);
        printf("Процесс 3 с PID=%d выполняется с политикой SCHED_RR\n", getpid());
        sleep(2);  // Выполнение в течение 2 секунд
        printf("Процесс 3 с PID=%d завершен\n", getpid());
        exit(0);
    } else if (pid > 0) {
        pids[2] = pid;
    } else {
        perror("fork");
        exit(1);
    }

    // Родительский процесс ждет завершения всех дочерних процессов
    for (int i = 0; i < 3; i++) {
        waitpid(pids[i], NULL, 0);
    }

    printf("Главный процесс завершает работу.\n");
    return 0;
}
