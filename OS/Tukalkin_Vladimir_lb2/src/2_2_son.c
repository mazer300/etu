/*
 * Программа: son.c
 * Назначение:
 * Программа-потомок. Выводит свою информацию о процессе и фиксирует состояние таблицы процессов в файл.
 *
 * Компиляция:
 * gcc -o son son.c
 */

#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>

int main() {
    printf("=== Потомок ===\n");
    printf("PID потомка: %d\n", getpid());
    printf("PPID потомка: %d\n", getppid());
    sleep(5);
    printf("Потомок завершает выполнение.\n");
}
