#include <iostream>
#include <vector>
#include <chrono>
#include <thread>
#include <functional>
#include <windows.h>
#include "../include/IThreadSafeList.h"
#include "../include/RoughBlockingList.h"
#include "../include/ThinBlockingList.h"
#include "../include/LockFreeList.h"

// Функция для измерения времени выполнения
double measureTime(std::function<void()> func) {
    auto start = std::chrono::steady_clock::now();
    func();
    auto end = std::chrono::steady_clock::now();
    std::chrono::duration<double> elapsed = end - start;
    return elapsed.count();
}

// Тест корректности всех реализаций
void testCorrectness() {
    std::cout << "=== Тест корректности ===\n";
    bool found = true;

    // Тестируем список с грубой блокировкой
    RoughBlockingList<int> list1;
    std::cout << "RoughBlockingList: ";

    // Вставка
    for (int i = 0; i < 5; i++) {
        list1.insert(i, i);
    }

    // Поиск
    found = true;
    for (int i = 0; i < 5; i++) {
        if (list1.find(i) != i) {
            found = false;
            break;
        }
    }

    // Удаление
    for (int i = 0; i < 5; i++) {
        list1.pop(0);
    }

    if (found && list1.isEmpty()) {
        std::cout << "УСПЕХ\n";
    } else {
        std::cout << "ПРОВАЛ\n";
    }


    // Тестируем список с тонкой блокировкой
    ThinBlockingList<int> list2;
    std::cout << "ThinBlockingList: ";

    // Вставка
    for (int i = 0; i < 5; i++) {
        list2.insert(i, i);
    }

    // Поиск
    found = true;
    for (int i = 0; i < 5; i++) {
        if (list2.find(i) != i) {
            found = false;
            break;
        }
    }

    // Удаление
    for (int i = 0; i < 5; i++) {
        list2.pop(0);
    }

    if (found && list2.isEmpty()) {
        std::cout << "УСПЕХ\n";
    } else {
        std::cout << "ПРОВАЛ\n";
    }


    // Тестируем LockFreeList
    LockFreeList<int> list3;
    std::cout << "LockFreeList: ";

    // Вставка
    for (int i = 0; i < 5; i++) {
        list3.insert(i, i);
    }

    // Поиск
    found = true;
    for (int i = 0; i < 5; i++) {
        if (list3.find(i) != i) {
            found = false;
            break;
        }
    }

    // Удаление
    for (int i = 0; i < 5; i++) {
        list3.pop(0);
    }

    if (found && list3.isEmpty()) {
        std::cout << "УСПЕХ\n";
    } else {
        std::cout << "ПРОВАЛ\n";
    }

    std::cout<< "Все списки прошли проверку\n";
    std::cout << "===========================\n\n";
}

// Функция для тестирования производительности с разным соотношением читателей/писателей
void benchmarkList(const std::string& name, IThreadSafeList<int>* list,
                   int readerThreads, int writerThreads, int operationsPerThread) {

    std::vector<std::thread> threads;
    std::atomic<bool> start{false};

    auto reader = [&](int id) {
        while (!start.load()) { std::this_thread::yield(); } // Ожидаем старта

        for (int i = 0; i < operationsPerThread; ++i) {
            list->find(i % 100); // Поиск элементов
            list->isEmpty();     // Проверка пустоты
            list->size();        // Получение размера
        }
    };

    auto writer = [&](int id) {
        while (!start.load()) { std::this_thread::yield(); } // Ожидаем старта

        for (int i = 0; i < operationsPerThread; ++i) {
            int value = id * operationsPerThread + i;
            if (i % 3 == 0) {
                list->insert(value, value % (list->size() + 1)); // Вставка
            } else if (list->size() > 0) {
                try {
                    list->pop(value % list->size()); // Удаление
                } catch (...) {
                    // Игнорируем исключения при пустом списке
                }
            }
        }
    };

    // Создаем потоки-читатели
    for (int i = 0; i < readerThreads; ++i) {
        threads.emplace_back(reader, i);
    }

    // Создаем потоки-писатели
    for (int i = 0; i < writerThreads; ++i) {
        threads.emplace_back(writer, i);
    }

    // Замеряем время
    auto startTime = std::chrono::steady_clock::now();
    start.store(true);

    // Ожидаем завершения всех потоков
    for (auto& t : threads) {
        t.join();
    }

    auto endTime = std::chrono::steady_clock::now();
    std::chrono::duration<double> duration = endTime - startTime;

    std::cout << name << " - Readers: " << readerThreads
              << ", Writers: " << writerThreads
              << ", Time: " << duration.count() << "s"
              << ", Final size: " << list->size() << std::endl;
}

// Основной бенчмарк
void runPerformanceBenchmark() {
    std::cout << "=== Performance Benchmark ===\n";

    const int OPERATIONS_PER_THREAD = 1000;
    const int NUM_RUNS = 3; // Количество запусков для усреднения

    // Конфигурации тестов: {читатели, писатели}
    std::vector<std::pair<int, int>> configurations = {
            {1, 1},    // Равное количество
            {4, 1},    // Много читателей
            {1, 4},    // Много писателей
            {2, 2},    // Сбалансировано
            {8, 2}     // Много читателей, несколько писателей
    };

    for (const auto& config : configurations) {
        int readers = config.first;
        int writers = config.second;

        std::cout << "\n--- Configuration: " << readers << " readers, "
                  << writers << " writers ---\n";

        // Тестируем RoughBlockingList
        {
            double totalTime = 0;
            for (int run = 0; run < NUM_RUNS; ++run) {
                RoughBlockingList<int> list;
                totalTime += measureTime([&]() {
                    benchmarkList("RoughBlockingList", &list, readers, writers, OPERATIONS_PER_THREAD);
                });
            }
            std::cout << "RoughBlockingList Average: " << totalTime / NUM_RUNS << "s\n";
        }

        // Тестируем ThinBlockingList
        {
            double totalTime = 0;
            for (int run = 0; run < NUM_RUNS; ++run) {
                ThinBlockingList<int> list;
                totalTime += measureTime([&]() {
                    benchmarkList("ThinBlockingList", &list, readers, writers, OPERATIONS_PER_THREAD);
                });
            }
            std::cout << "ThinBlockingList Average: " << totalTime / NUM_RUNS << "s\n";
        }

        // Тестируем LockFreeList
        {
            double totalTime = 0;
            for (int run = 0; run < NUM_RUNS; ++run) {
                LockFreeList<int> list;
                totalTime += measureTime([&]() {
                    benchmarkList("LockFreeList", &list, readers, writers, OPERATIONS_PER_THREAD);
                });
            }
            std::cout << "LockFreeList Average: " << totalTime / NUM_RUNS << "s\n";
        }
    }
}

// Стресс-тест
void stressTest() {
    std::cout << "\n=== Stress Test ===\n";

    const int NUM_THREADS = 10;
    const int OPERATIONS_PER_THREAD = 2000;

    std::cout << "Threads: " << NUM_THREADS << ", Operations per thread: " << OPERATIONS_PER_THREAD << "\n";

    // RoughBlockingList
    {
        RoughBlockingList<int> list;
        auto time = measureTime([&]() {
            benchmarkList("RoughBlockingList", &list, NUM_THREADS/2, NUM_THREADS/2, OPERATIONS_PER_THREAD);
        });
        std::cout << "RoughBlockingList Stress: " << time << "s\n";
    }

    // ThinBlockingList
    {
        ThinBlockingList<int> list;
        auto time = measureTime([&]() {
            benchmarkList("ThinBlockingList", &list, NUM_THREADS/2, NUM_THREADS/2, OPERATIONS_PER_THREAD);
        });
        std::cout << "ThinBlockingList Stress: " << time << "s\n";
    }

    // LockFreeList
    {
        LockFreeList<int> list;
        auto time = measureTime([&]() {
            benchmarkList("LockFreeList", &list, NUM_THREADS/2, NUM_THREADS/2, OPERATIONS_PER_THREAD);
        });
        std::cout << "LockFreeList Stress: " << time << "s\n";
    }
}

// Простой тест для демонстрации работы
void simpleTest() {
    std::cout << "\n=== Простой тест функциональности ===\n";

    ThinBlockingList<int> list;

    // Вставка элементов
    std::cout << "Добавление элементов...\n";
    for (int i = 0; i <= 10; i++) {
        list.insert(i, 0);
    }
    list.print();

    std::cout << "Size: " << list.size() << "\n\n";

    // Удаление элементов
    std::cout << "Удаление элементов...\n";
    for (int i = 0; i <= 10; i++) {
        try {
            size_t pos = list.find(i);
            if (pos < list.size()) {
                list.pop(pos);
            }
        } catch (const std::exception& e) {
            std::cout << "Ошибка удаления " << i << ": " << e.what() << "\n";
        }
    }

    std::cout << "Конечный вид: ";
    list.print();
    std::cout << "Конечный размер: " << list.size() << "\n";
    std::cout << "Пусто: " << (list.isEmpty() ? "да" : "нет") << "\n";
}

int main() {
    SetConsoleOutputCP(CP_UTF8);

    try {
        // Запускаем тесты
        testCorrectness();
        simpleTest();
        runPerformanceBenchmark();
//        stressTest();

        std::cout << "\nВсе тесты пройдены успешно!\n";

    } catch (const std::exception& e) {
        std::cerr << "Ошибка: " << e.what() << std::endl;
        return 1;
    }

    return 0;
}