/*
 * Задание 5.6.2
 * 
 * Тема: Управление процессами и потоками в ОС Linux
 * 
 * Цель: Создать несколько потоков с различными приоритетами при использовании политики планирования SCHED_FIFO.
 * Пронаблюдать влияние приоритета на порядок выполнения потоков.
 * 
 * Компиляция:
 *     gcc 5_6_2.c -o 5_6_2 -pthread
 * 
 * Запуск:
 *     sudo ./5_6_2
 * 
 * Примечание:
 *     Для работы с политикой планирования SCHED_FIFO требуется запуск программы с правами суперпользователя (sudo).
*/
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <sched.h>
#include <unistd.h>
#include <sys/syscall.h>

#define NUM_THREADS 3

// Функция потока
void* thread_function(void* arg) {
    intptr_t tid = (intptr_t) arg;  // Используем intptr_t для совместимости с указателями
    printf("Поток %ld запущен. PID = %d, TID = %ld\n", tid, getpid(), syscall(SYS_gettid)); // Используем syscall для получения TID

    for (int i = 1; i <= 5; i++) {
        printf("Поток %ld: итерация %d\n", tid, i);
        usleep(100000); // Задержка для имитации работы
    }

    printf("Поток %ld завершает работу.\n", tid);
    return NULL;
}

int main() {
    pthread_t threads[NUM_THREADS];
    pthread_attr_t attr;
    struct sched_param param;

    // Установим атрибуты по умолчанию
    pthread_attr_init(&attr);

    // Установим политику планирования для всех потоков на SCHED_FIFO
    pthread_attr_setschedpolicy(&attr, SCHED_FIFO);

    // Создаем несколько потоков с разными приоритетами
    for (int i = 0; i < NUM_THREADS; i++) {
        param.sched_priority = 10 + i;  // Устанавливаем разные приоритеты
        pthread_attr_setschedparam(&attr, &param);
        if (pthread_create(&threads[i], &attr, thread_function, (void*) (intptr_t) i) != 0) {
            perror("Ошибка создания потока");
            exit(1);
        }
    }

    // Ждем завершения всех потоков
    for (int i = 0; i < NUM_THREADS; i++) {
        pthread_join(threads[i], NULL);
    }

    printf("Главный процесс завершает работу.\n");
    return 0;
}
