#!/bin/bash

# Проверка, что пользователь передал аргумент (имя файла)
if [ -z "$1" ]; then
    echo "Ошибка: Укажите имя файла в качестве аргумента."
    exit 1
fi

target_file=$1

# Проверка, существует ли файл
if [ ! -e "$target_file" ]; then
    echo "Ошибка: Файл '$target_file' не существует."
    exit 1
fi

# Получаем inode файла
inode=$(ls -i "$target_file" | awk '{print $1}')
echo "1. Inode файла '$target_file': $inode"

# Поиск всех файлов с тем же inode (жесткие ссылки)
echo "2. Поиск всех жестких ссылок на файл '$target_file'..."
echo "   Используем ls и grep для поиска файлов с inode $inode..."
ls -liR / 2>/dev/null | grep -E "${inode}"

echo "   Используем ls и awk для поиска файлов с inode $inode..."
ls -liR / 2>/dev/null | awk -v target="$inode" '$1 == target {print $NF}'
