/*
 * Программа: father.c
 * Назначение:
 * Программа-родитель. Создает дочерний процесс и фиксирует таблицу процессов в файл.
 *
 * Компиляция:
 * gcc -o father father.c
 */

#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <sys/wait.h>

int main() {
    pid_t pid;

    printf("=== Родитель ===\n");
    printf("PID родителя: %d\n", getpid());

    // Создание дочернего процесса
    pid = fork();

    if (pid < 0) {
        perror("Ошибка создания дочернего процесса");
        exit(EXIT_FAILURE);
    } else if (pid == 0) {
        // Дочерний процесс: запускаем исполняемый файл son
        execl("./son", "./son", NULL);

        // Если execl завершился с ошибкой
        perror("Ошибка запуска son");
        exit(EXIT_FAILURE);
    } else {
        // Родительский процесс

        // Фиксация состояния таблицы процессов в файл
        system("ps -l > father_ps.txt");

        // Ожидание завершения дочернего процесса
        wait(NULL);

        printf("Дочерний процесс завершён. Родитель завершает выполнение.\n");
    }

    return 0;
}
