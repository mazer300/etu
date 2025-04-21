/*
 * Назначение программы:
 * Демонстрация наследования политики планирования и приоритета nice
 * дочерним процессом после вызова fork().
 *
 * Основные функции:
 * - fork() — создание дочернего процесса;
 * - sched_getscheduler() — получение политики планирования процесса;
 * - getpriority() — получение значения приоритета (nice) процесса;
 * - wait() — ожидание завершения дочернего процесса.
 *
 * После запуска видно, что потомок наследует параметры планирования от родителя.
 */

#include <stdio.h>
#include <unistd.h>
#include <sched.h>
#include <sys/resource.h>
#include <sys/wait.h>

void print_info(const char* who) {
    pid_t pid = getpid();
    int policy = sched_getscheduler(pid);
    int priority = getpriority(PRIO_PROCESS, pid);

    printf("%s (PID=%d): Политика планирования = %d, Приоритет (nice) = %d\n", who, pid, policy, priority);
}

int main() {
    printf("Родительский процесс перед fork():\n");
    print_info("Родитель");

    pid_t child_pid = fork();
    if (child_pid < 0) {
        perror("Ошибка fork");
        return 1;
    }

    if (child_pid == 0) {
        // Дочерний процесс
        printf("Дочерний процесс после fork():\n");
        print_info("Потомок");
    } else {
        // Родительский процесс
        wait(NULL); // Ожидание завершения дочернего процесса
    }

    return 0;
}
