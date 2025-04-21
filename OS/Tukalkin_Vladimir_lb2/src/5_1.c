/*
5. Планирование

5.1. Определение политики планирования и приоритета процессов.

Программа создает дочерний процесс с помощью fork() и выводит для родительского и дочернего процессов
информацию о политике планирования и приоритете с использованием sched_getscheduler() и getpriority().
*/

#include <stdio.h>
#include <sched.h>
#include <unistd.h>
#include <sys/resource.h>
#include <sys/wait.h>

int main() {
    printf("Parent: PID=%d, policy=%d, priority=%d\n", getpid(), sched_getscheduler(0), getpriority(PRIO_PROCESS, 0));
    if (fork() == 0)
        printf("Child: PID=%d, policy=%d, priority=%d\n", getpid(), sched_getscheduler(0), getpriority(PRIO_PROCESS, 0));
    else
        wait(NULL);
    return 0;
}
