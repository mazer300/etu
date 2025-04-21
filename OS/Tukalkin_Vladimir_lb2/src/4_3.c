/*
 * Назначение программы:
 * Данная программа демонстрирует совместное использование ресурсов нитями одного процесса в Linux.
 * Главный процесс создает несколько потоков, которые одновременно работают с общей глобальной переменной.
 * Каждый поток увеличивает значение общей переменной и выводит её текущее значение.
 * Таким образом, показывается возможность конкурентного доступа к общим данным между потоками.
 *
 * Основные функции:
 * - pthread_create() — создание потоков;
 * - pthread_self() — получение идентификатора потока;
 * - pthread_join() — ожидание завершения всех потоков;
 * - sleep() — имитация работы потоков с задержкой для наглядности.
 *
 * Программа подтверждает, что потоки одного процесса имеют общее адресное пространство,
 * что требует синхронизации доступа к разделяемым данным для предотвращения состояния гонки (race condition).
 */

#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

#define NUM_THREADS 4  // Количество потоков

int shared_counter = 0; // Общая глобальная переменная для всех потоков

void* thread_function(void* arg) {
    long tid = (long)arg;

    printf("Поток %ld запущен (TID=%lu, PID=%d)\n", tid, pthread_self(), getpid());

    // Каждая нить увеличивает общий счетчик
    for (int i = 0; i < 5; i++) {
        int local = shared_counter;
        printf("Поток %ld читает shared_counter = %d\n", tid, local);
        local++;
        sleep(1);  // Имитация работы
        shared_counter = local;
        printf("Поток %ld увеличивает shared_counter до %d\n", tid, shared_counter);
    }

    printf("Поток %ld завершен\n", tid);
    pthread_exit(NULL);
}

int main() {
    pthread_t threads[NUM_THREADS];

    printf("Главный процесс (PID=%d) создает потоки...\n", getpid());

    for (long i = 0; i < NUM_THREADS; i++) {
        if (pthread_create(&threads[i], NULL, thread_function, (void*)i) != 0) {
            perror("Ошибка создания потока");
            exit(1);
        }
    }

    // Ждем завершения всех потоков
    for (int i = 0; i < NUM_THREADS; i++) {
        pthread_join(threads[i], NULL);
    }

    printf("Главный процесс завершен. Итоговое значение shared_counter = %d\n", shared_counter);
    return 0;
}
