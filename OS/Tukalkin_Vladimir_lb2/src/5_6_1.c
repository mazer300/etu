/*
 * Лабораторная работа №2
 * Задание 5.6.2
 * 
 * Тема: Управление процессами и потоками в ОС Linux
 * 
 * Цель: Исследовать влияние приоритета потока на порядок его выполнения
 * при использовании политики планирования SCHED_FIFO. 
 * Изменить приоритет одного из потоков после его создания и пронаблюдать изменения в поведении.
 * 
 * 
 * Компиляция:
 *     gcc 5_6_2.c -o 5_6_2 -pthread
 * 
 * Запуск:
 *     sudo ./5_6_2
 * 
 * Примечание:
 *     Для установки политики SCHED_FIFO и изменения приоритета требуется запуск с правами суперпользователя (sudo).
*/

#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <sched.h>
#include <unistd.h>
#include <sys/syscall.h> // Для syscall
#include <errno.h>

#define NUM_THREADS 3

// Функция потока
void* thread_function(void* arg) {
    intptr_t tid = (intptr_t)arg;
    printf("Поток %ld запущен. PID = %d, TID = %ld\n", tid, getpid(), syscall(SYS_gettid));

    for (int i = 0; i < 5; i++) {
        printf("Поток %ld: итерация %d\n", tid, i + 1);
        usleep(100000); // Имитируем работу
    }

    printf("Поток %ld завершает работу.\n", tid);
    pthread_exit(NULL);
}

int main() {
    pthread_t threads[NUM_THREADS];
    pthread_attr_t attr;
    struct sched_param param;

    printf("Главный процесс: PID = %d\n", getpid());

    // Инициализация атрибутов
    if (pthread_attr_init(&attr) != 0) {
        perror("pthread_attr_init");
        exit(1);
    }

    // Установка политики планирования SCHED_FIFO
    if (pthread_attr_setschedpolicy(&attr, SCHED_FIFO) != 0) {
        perror("pthread_attr_setschedpolicy");
        exit(1);
    }

    // Установка приоритета 10
    param.sched_priority = 10;
    if (pthread_attr_setschedparam(&attr, &param) != 0) {
        perror("pthread_attr_setschedparam");
        exit(1);
    }

    // Разрешить потокам использовать указанный планировщик
    if (pthread_attr_setinheritsched(&attr, PTHREAD_EXPLICIT_SCHED) != 0) {
        perror("pthread_attr_setinheritsched");
        exit(1);
    }

    // Создание потоков
    for (int i = 0; i < NUM_THREADS; i++) {
        errno = 0; // Сброс ошибки перед созданием потока
        int res = pthread_create(&threads[i], &attr, thread_function, (void*)(intptr_t)i);
        if (res != 0) {
            fprintf(stderr, "Ошибка создания потока %d: %d\n", i, res);
            perror("pthread_create");
            exit(1);
        }
    }

    // Меняем приоритет второго потока
    param.sched_priority = 20;
    if (pthread_setschedparam(threads[1], SCHED_FIFO, &param) != 0) {
        perror("pthread_setschedparam для потока 1");
        exit(1);
    }

    // Ожидаем завершение всех потоков
    for (int i = 0; i < NUM_THREADS; i++) {
        pthread_join(threads[i], NULL);
    }

    printf("Главный процесс завершает работу.\n");
    return 0;
}

