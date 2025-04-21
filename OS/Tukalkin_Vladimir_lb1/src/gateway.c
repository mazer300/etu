#include <stdio.h>
#include <errno.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/stat.h>

int main(int argc, char **argv) {
    // Проверка количества аргументов
    if (argc != 2) {
        puts("Использование: ./gateway <файл>");
        return 0;
    }

    // Получаем имя файла
    char *fileName = argv[1];

    // Открываем файл для чтения
    int fd = open(fileName, O_RDONLY);
    if (fd == -1) {
        // Обработка ошибок
        if (errno == ENOENT) {
            puts("Файл не существует. Завершение.");
            return errno;
        }
        if (errno == EACCES) {
            puts("Доступ запрещен. Завершение.");
            return errno;
        }
        puts("Неизвестная ошибка. Завершение.");
        return errno;
    }

    // Чтение и вывод содержимого файла
    char buffer[1024];
    ssize_t bytesRead;

    while ((bytesRead = read(fd, buffer, sizeof(buffer))) > 0) {
        if (write(STDOUT_FILENO, buffer, bytesRead) != bytesRead) {
            perror("Ошибка при записи в stdout");
            close(fd);
            return EXIT_FAILURE;
        }
    }

    if (bytesRead == -1) {
        perror("Ошибка при чтении файла");
    }

    // Закрываем файл
    close(fd);
    return 0;
}
