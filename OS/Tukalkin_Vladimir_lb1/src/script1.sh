#!/bin/bash

# Функция для поиска файлов по типу и вывода первого найденного в терминал
find_file_by_type() {
    local type=$1
    local description=$2

    # Поиск первого файла указанного типа с помощью ls и grep
    file="/$(ls -lR / 2>/dev/null | grep "^$type" -m 1 | awk '{print $NF}')"

    if [ -n "$file" ]; then
        echo "$description: $file"
    else
        echo "$description: не найден"
    fi
}

# Поиск файлов разных типов и вывод в терминал
find_file_by_type "-" "Обычный файл"
find_file_by_type "b" "Специальный файл блочного устройства"
find_file_by_type "c" "Файл символьного устройства"
find_file_by_type "d" "Каталог"
find_file_by_type "l" "Символьная ссылка"
find_file_by_type "p" "FIFO (именованный канал)"
find_file_by_type "s" "Сокет"
