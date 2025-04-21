/*
 * Файл: process_demo.c
 * Назначение:
 * Демонстрация нормального завершения процесса, смены родителя и процесса-зомби.
 * Вывод PID, PPID и состояния процессов.
 *
 * Компиляция:
 * gcc -o process_demo process_demo.c
 *
 * Запуск:
 * ./process_demo
 */

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>

void normal_termination() {
    pid_t pid = fork();

    if (pid < 0) {
        perror("[Сценарий A] Ошибка при fork");
        exit(EXIT_FAILURE);
    } else if (pid == 0) {
        printf("[Сценарий A] [Сын] PID: %d, PPID: %d (Нормальное завершение)\n", getpid(), getppid());
        sleep(2); // Имитируем работу
        printf("[Сценарий A] [Сын] Завершение работы.\n");
        exit(EXIT_SUCCESS);
    } else {
        printf("[Сценарий A] [Отец] Ожидаю завершения сына. PID сына: %d\n", pid);
        wait(NULL);
        printf("[Сценарий A] [Отец] Сын завершился. Продолжаю работу.\n");
    }
}

void orphan_process() {
    pid_t pid = fork();

    if (pid < 0) {
        perror("[Сценарий B] Ошибка при fork");
        exit(EXIT_FAILURE);
    } else if (pid == 0) {
        printf("[Сценарий B] [Сын] PID: %d, PPID: %d (Стану сиротой)\n", getpid(), getppid());
        sleep(5); // Ожидаем, чтобы родитель успел завершиться
        printf("[Сценарий B] [Сын] После завершения отца, мой новый родитель - PID: %d\n", getppid());
        exit(EXIT_SUCCESS);
    } else {
        printf("[Сценарий B] [Отец] Завершаюсь, не ожидая сына. PID сына: %d\n", pid);
        exit(EXIT_SUCCESS);
    }
}

void zombie_process() {
    pid_t pid = fork();

    if (pid < 0) {
        perror("[Сценарий C] Ошибка при fork");
        exit(EXIT_FAILURE);
    } else if (pid == 0) {
        printf("[Сценарий C] [Сын] PID: %d, PPID: %d (Стану зомби)\n", getpid(), getppid());
        exit(EXIT_SUCCESS);
    } else {
        printf("[Сценарий C] [Отец] Не жду сына. PID сына: %d\n", pid);
        sleep(10); // Ждем, чтобы зомби "провисел" в списке процессов
        printf("[Сценарий C] [Отец] Проверка зомби-состояния...\n");
        system("ps -l > ps_zombie.txt");
        printf("[Сценарий C] [Отец] Состояние процессов сохранено в файл ps_zombie.txt\n");
        wait(NULL); // Чтобы убрать зомби перед завершением
    }
}

int main() {
    printf("----- Нормальное завершение -----\n");
    normal_termination();
    sleep(1);
    if(fork()==0){
       printf("----- Смена родителя (сирота) -----\n");
       orphan_process();
       sleep(3);
    }

    printf("----- Зомби-процесс -----\n");
    zombie_process();

    printf("Завершение программы main().\n");

    return 0;
}
