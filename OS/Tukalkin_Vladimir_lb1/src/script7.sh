#!/bin/bash
dir="test_dir"
mkdir "$dir"
echo "Размер пустого каталога: $(du -sh "$dir" | awk '{print $1}')"

# Добавление файлов
for i in {1..10}; do
    touch "$dir/file$i"
done
echo "Размер после добавления 10 файлов: $(du -sh "$dir" | awk '{print $1}')"

# Удаление файлов
rm "$dir"/*
echo "Размер после удаления: $(du -sh "$dir" | awk '{print $1}')"
