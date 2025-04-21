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

# Способ 1: Создание символьной ссылки с помощью cp -s
echo "1. Создание символьной ссылки с помощью cp -s..."
cp -s "$target_file" "${target_file}_symlink_cp_s"
echo "   Символьная ссылка создана: ${target_file}_symlink_cp_s"

# Способ 2: Создание копии с сохранением символических ссылок с помощью cp -P
echo "2. Создание копии с сохранением символических ссылок с помощью cp -P..."
cp -P "$target_file" "${target_file}_copy_cp_P"
echo "   Копия создана: ${target_file}_copy_cp_P"

# Способ 3: Создание символьной ссылки с помощью ln -s
echo "3. Создание символьной ссылки с помощью ln -s..."
ln -s "$target_file" "${target_file}_symlink_ln_s"
echo "   Символьная ссылка создана: ${target_file}_symlink_ln_s"

# Поиск всех символьных ссылок на файл
echo "4. Поиск всех символьных ссылок на файл '$target_file'..."

target_file=$(readlink -f "$1")
links_file=$(mktemp)

find ~  -type l 2>/dev/null | while read -r link; do
    link_full=$(readlink -f "$link" 2>/dev/null)

    if [ "$link_full" == "$target_file" ]; then
        echo "$link" | tee -a "$links_file"
    fi
done

count=$(wc -l < "$links_file")
rm "$links_file"

echo "Найдено символических ссылок: $count"
echo "Поиск завершен!"
