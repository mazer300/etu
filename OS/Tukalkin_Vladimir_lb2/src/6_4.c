/*
 * Назначение программы:
 * Демонстрация наследования при использовании функции clone().
 * Родительский процесс создает дочерний процесс, используя clone(), и оба процесса 
 * выполняют свои функции, при этом их идентификаторы процесса (PID) и потока (TID) выводятся.
 *
 * В отличие от fork(), clone() позволяет гибко управлять наследованием различных
 * характеристик процессов, таких как память, файловые дескрипторы и сигналы.
 *
 * Основные функции:
 * - clone() — создание процесса с гибким управлением наследуемыми параметрами;
 * - syscall(SYS_gettid) — получение идентификатора потока;
 * - malloc() и free() — выделение и освобождение памяти для стека.
 */

#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <sched.h>
#include <unistd.h>
#include <sys/wait.h>  // Для wait
#include <sys/syscall.h>  // Для syscall(SYS_gettid)
#define STACK_SIZE 1024 * 1024  // Размер стека для дочернего процесса

int child_function(void *arg) {
    printf("Дочерний процесс PID=%d, TID=%ld\n", getpid(), syscall(SYS_gettid));
    return 0;
}

int main() {
    // Выделяем память для стека дочернего процесса
    void *stack = malloc(STACK_SIZE);
    if (!stack) {
        perror("malloc");
        exit(1);
    }

    // Создаем дочерний процесс с помощью clone()
    pid_t pid = clone(child_function, stack + STACK_SIZE, SIGCHLD | CLONE_VM | CLONE_FILES, NULL);

    if (pid == -1) {
        perror("clone");
        exit(1);
    }

    // Родительский процесс
    printf("Родительский процесс PID=%d\n", getpid());
    wait(NULL);  // Ждем завершения дочернего процесса

    // Освобождаем память для стека
    free(stack);
    return 0;
}
