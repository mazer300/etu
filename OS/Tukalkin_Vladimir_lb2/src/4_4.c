/*
 * Назначение программы:
 * Данная программа демонстрирует попытку завершения отдельной нити (потока) процесса через отправку сигнала kill().
 * Главный процесс создает несколько потоков, затем отправляет сигнал одному из них по идентификатору LWP (Light Weight Process ID).
 *
 * Основные функции:
 * - pthread_create() — создание потоков;
 * - pthread_self() — получение идентификатора потока;
 * - pthread_join() — ожидание завершения всех потоков;
 * - gettid() — получение идентификатора нити на уровне ядра (LWP);
 * - kill() — отправка сигнала нити;
 *
 * Вывод программы позволяет увидеть, что потоки одного процесса не могут быть завершены по отдельности через kill,
 * так как сигнал kill(pid, SIGTERM) применяется ко всему процессу.
 */

#define _GNU_SOURCE
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/syscall.h>
#include <signal.h>

#define NUM_THREADS 4  // Количество потоков

pid_t thread_tids[NUM_THREADS]; // Массив для хранения TID нитей

void* thread_function(void* arg) {
    long tid = (long)arg;
    pid_t lwp_tid = (pid_t)syscall(SYS_gettid); // Получаем LWP ID
    thread_tids[tid] = lwp_tid;

    printf("Поток %ld запущен (pthread_self=%lu, LWP TID=%d, PID=%d)\n", tid, pthread_self(), lwp_tid, getpid());

    while (1) {
        sleep(1); // Поток просто "живет"
    }

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

    // Подождем немного, чтобы все потоки успели запуститься
    sleep(10);

    printf("Пытаемся завершить поток 1 (LWP TID=%d) через kill()...\n", thread_tids[1]);
    if (kill(thread_tids[1], SIGTERM) == -1) {
        perror("Ошибка отправки сигнала");
    } else {
        printf("Сигнал SIGTERM отправлен потоку 1 (TID=%d)\n", thread_tids[1]);
    }

    // Ждем завершения всех потоков
    for (int i = 0; i < NUM_THREADS; i++) {
        pthread_join(threads[i], NULL);
    }

    printf("Главный процесс завершен\n");
    return 0;
}
