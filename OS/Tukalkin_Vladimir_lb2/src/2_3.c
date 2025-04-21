/*
 * Файл: exec_all.c
 * Назначение:
 * Демонстрация работы функций семейства exec(): execl, execv, execvp, execve
 * 
 * Пользователь выбирает, какую функцию exec использовать для запуска команды.
 * 
 * Компиляция:
 * gcc -o exec_all exec_all.c
 * 
 * Запуск:
 * ./exec_all
 */

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

void use_execl() {
    printf("Выбрана функция execl()\n");
    execl("/bin/ls", "ls", "-l", "-a", NULL);
    perror("Ошибка при вызове execl");
    exit(EXIT_FAILURE);
}

void use_execv() {
    printf("Выбрана функция execv()\n");
    char *args[] = { "ls", "-l", "-a", NULL };
    execv("/bin/ls", args);
    perror("Ошибка при вызове execv");
    exit(EXIT_FAILURE);
}

void use_execvp() {
    printf("Выбрана функция execvp()\n");
    char *args[] = { "ls", "-l", "-a", NULL };
    execvp("ls", args);
    perror("Ошибка при вызове execvp");
    exit(EXIT_FAILURE);
}

void use_execve() {
    printf("Выбрана функция execve()\n");
    char *args[] = { "ls", "-l", "-a", NULL };
    char *envp[] = {
        "MYVAR1=HELLO",
        "MYVAR2=WORLD",
        NULL
    };
    execve("/bin/ls", args, envp);
    perror("Ошибка при вызове execve");
    exit(EXIT_FAILURE);
}

int main() {
    int choice;

    printf("Выберите функцию exec для выполнения:\n");
    printf("1 - execl\n");
    printf("2 - execv\n");
    printf("3 - execvp\n");
    printf("4 - execve\n");
    printf("Введите номер (1-4): ");
    scanf("%d", &choice);

    switch(choice) {
        case 1:
            use_execl();
            break;
        case 2:
            use_execv();
            break;
        case 3:
            use_execvp();
            break;
        case 4:
            use_execve();
            break;
        default:
            printf("Некорректный выбор!\n");
            exit(EXIT_FAILURE);
    }

    return 0;
}
