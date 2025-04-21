if [ -z "$1" ]; then
    echo "Укажите путь к файлу или каталогу"
    exit 1
fi

FILE=$1

if [ ! -e "$FILE" ]; then
    echo "Файл или каталог не существует: $FILE"
    exit 1
fi

echo "Анализ содержимого файла/каталога: $FILE"
echo ""

if [ -f "$FILE" ]; then
    echo "Обычный файл:"
    od -c "$FILE"
    echo ""
    hexdump -C "$FILE"
fi

if [ -L "$FILE" ]; then
    echo "Символьная ссылка:"
    od -c "$FILE"
    echo ""
    hexdump -C "$FILE"
fi

if [ -d "$FILE" ]; then
    echo "Каталог:"
    od -c "$FILE"
    echo ""
    hexdump -C "$FILE"
fi

if file "$FILE" | grep -qE 'JPEG|PNG'; then
    echo "Изображение (JPEG/PNG):"
    od -c "$FILE" | head -n 10
    echo ""
    hexdump -C "$FILE" | head -n 10
fi

if file "$FILE" | grep -q 'PDF document'; then
    echo "PDF файл:"
    od -c "$FILE" | head -n 10
    echo ""
    hexdump -C "$FILE" | head -n 10
fi

if [ -d "$FILE" ]; then
    echo ""
    echo "Изменение содержимого каталога $FILE:"
    touch "$FILE/newfile.txt"
    echo "Добавлен новый файл:"
    od -c "$FILE"
    echo ""
    hexdump -C "$FILE"

    echo "Удаляем файл из каталога..."
    rm "$FILE/newfile.txt"
    echo "После удаления файла:"
    od -c "$FILE"
    echo ""
    hexdump -C "$FILE"
fi
