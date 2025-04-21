/*
 * Программа для демонстрации многонитевого функционирования.
 *
 * Задание: 4.1. Подготовить программу, формирующую несколько нитей (потоков).
 * Нити должны быть практически идентичны. Используются функции pthread_create() и clone().
 *
 * Описание:
 * - Создаются несколько потоков с помощью pthread_create().
 * - Каждый поток выполняет простую функцию: выводит свой идентификатор потока и процесса.
 * - Дополнительно демонстрируется создание потока с использованием системного вызова clone().
 *
 * Цели:
 * - Показать создание и выполнение нитей.
 * - Подготовить базу для анализа идентификации потоков, их выполнения во времени и наследования параметров.
 *
 * Компиляция:
 * gcc threads.c -o threads -pthread
 *
 * Запуск:
 * ./threads
 */

#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <pthread.h>
#include <sched.h>
#include <sys/wait.h>

#define NUM_THREADS 3
#define STACK_SIZE 1024*1024

void* thread_function(void* arg) {
    printf("[pthread] Поток: ID потока (pthread_self) = %lu, PID процесса = %d\n", pthread_self(), getpid());
    sleep(2); // небольшая задержка для наблюдения
    pthread_exit(NULL);
}

int clone_function(void* arg) {
    printf("[clone] Клон-поток: PID процесса = %d\n", getpid());
    sleep(2);
    _exit(0);
}

int main() {
    pthread_t threads[NUM_THREADS];
    int i;

    printf("Главный процесс: PID = %d\n", getpid());

    // Создание потоков через pthread_create
    for (i = 0; i < NUM_THREADS; i++) {
        if (pthread_create(&threads[i], NULL, thread_function, NULL) != 0) {
            perror("Ошибка создания потока");
            exit(1);
        }
    }

    // Создание потока через clone()
    void* child_stack = malloc(STACK_SIZE);
    if (!child_stack) {
        perror("Ошибка выделения памяти для стека");
        exit(1);
    }

    pid_t clone_pid = clone(clone_function, (char*)child_stack + STACK_SIZE, CLONE_VM | CLONE_FS | CLONE_FILES | CLONE_SIGHAND | SIGCHLD, NULL);
    if (clone_pid == -1) {
        perror("Ошибка вызова clone");
        free(child_stack);
        exit(1);
    }

    // Ожидание завершения pthread-потоков
    for (i = 0; i < NUM_THREADS; i++) {
        pthread_join(threads[i], NULL);
    }

    // Ожидание завершения clone-потока
    waitpid(clone_pid, NULL, 0);

    free(child_stack);

    printf("Главный процесс завершает работу.\n");
    return 0;
}
