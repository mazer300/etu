#!/bin/bash

echo "🚀 Запуск биржевой системы..."

# Останавливаем и очищаем предыдущие контейнеры
echo "🛑 Останавливаем предыдущие контейнеры..."
docker-compose down --remove-orphans

# Собираем и запускаем
echo "🏗️ Собираем Docker образы..."
if docker-compose build --no-cache; then
    echo "🚀 Запускаем контейнеры..."
    docker-compose up -d

    echo "⏳ Ожидаем запуск сервисов (20 секунд)..."
    sleep 20

    # Проверяем сервисы
    echo "🔍 Проверяем сервисы..."
    services=(
        "Бэкенд админки:http://localhost:3011"
        "Бэкенд биржи:http://localhost:3013"
        "Админка:http://localhost:3010"
        "Биржа:http://localhost:3012"
    )

    all_services_ok=true
    for service in "${services[@]}"; do
        IFS=':' read -r name url <<< "$service"
        if curl -f -s -o /dev/null --connect-timeout 10 "$url"; then
            echo "✅ $name запущен"
        else
            echo "❌ $name не отвечает"
            all_services_ok=false
        fi
    done

    echo ""
    echo "============================================"
    echo "🎯 БИРЖЕВАЯ СИСТЕМА ЗАПУЩЕНА!"
    echo "============================================"
    echo "👨‍💼 Админка:      http://localhost:3010"
    echo "📊 Биржа:         http://localhost:3012"
    echo "⚙️  Бэкенд админки: http://localhost:3011"
    echo "⚙️  Бэкенд биржи:   http://localhost:3013"
    echo "📁 Данные:        ./data/"
    echo "============================================"

    if [ "$all_services_ok" = true ]; then
        echo ""
        echo "🎉 Система успешно запущена!"
        echo ""
        echo "🔧 Команды управления:"
        echo "   Остановить:        docker-compose down"
        echo "   Просмотр логов:    docker-compose logs -f"
        echo "   Перезапустить:     ./build-and-run.sh"
        echo "   Запустить тесты:   ./test.sh"
        echo "   Статус сервисов:   docker-compose ps"
    else
        echo ""
        echo "⚠️  Не все сервисы запущены корректно"
        echo "💡 Проверьте логи: docker-compose logs"
        echo "🔄 Попробуйте перезапустить: ./build-and-run.sh"
    fi
    
else
    echo "❌ Ошибка сборки Docker образов"
    exit 1
fi
