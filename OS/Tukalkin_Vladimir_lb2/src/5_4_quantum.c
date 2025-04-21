/*
 * Программа для определения кванта времени планирования для политики SCHED_RR.
 *
 * Задание: 5.4. Определить величину кванта времени при использовании политики Round-Robin (SCHED_RR).
 *
 * Описание:
 * - Получает квант времени для текущего процесса с помощью функции sched_rr_get_interval().
 * - Выводит величину кванта в секундах и наносекундах.
 *
 * Цели:
 * - Ознакомиться с механизмом квантования времени в политике Round-Robin.
 * - Подтвердить влияние политики планирования на поведение процессов.
 *
 * Компиляция:
 * gcc sched_rr_quantum.c -o sched_rr_quantum
 *
 * Запуск:
 * ./sched_rr_quantum
 */

#include <stdio.h>
#include <time.h>
#include <sched.h>
#include <unistd.h>

int main() {
    struct timespec ts;
    pid_t pid = getpid();

    if (sched_rr_get_interval(pid, &ts) == -1) {
        perror("sched_rr_get_interval");
        return 1;
    }

    printf("Квант времени для процесса %d: %ld.%09ld секунд\n", pid, ts.tv_sec, ts.tv_nsec);
    return 0;
}
