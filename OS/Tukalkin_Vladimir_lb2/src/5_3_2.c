/*
 * Программа для определения границ приоритетов SCHED_FIFO.
 * Задание 5.3.2: вывести минимальный и максимальный приоритеты для политики.
 *
 * Компиляция:
 * gcc 5_3_2.c -o 5_3_2
 *
 * Запуск:
 * ./5_3_2
 */

#include <stdio.h>
#include <sched.h>

int main() {
    int min = sched_get_priority_min(SCHED_FIFO);
    int max = sched_get_priority_max(SCHED_FIFO);

    printf("SCHED_FIFO: минимальный приоритет = %d, максимальный приоритет = %d\n", min, max);
    return 0;
}
