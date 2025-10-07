#include <iostream>
#include <vector>
#include <chrono>
#include <thread>
#include <functional>
#include <fstream>
#include <iomanip>

#ifdef _WIN32
#include <windows.h>
#endif

#include "../include/IThreadSafeList.h"
#include "../include/RoughBlockingList.h"
#include "../include/ThinBlockingList.h"
#include "../include/LockFreeList.h"

// Глобальный файл для записи результатов
std::ofstream resultsFile;
constexpr int OPERATIONS_PER_THREAD = 5000;
constexpr int NUM_RUNS = 5;  // Количество запусков для усреднения

// Конфигурации тестов: {читатели, писатели}
std::vector<std::pair<int, int> > configurations = {
        {1, 1}, {2, 1}, {4, 1}, {8, 1}, {16, 1},
        {1, 2}, {1, 4}, {1, 8}, {1, 16},
        {2, 2}, {4, 4}, {8, 8}, {16,16}
};

// Функция для измерения времени выполнения
double measureTime(std::function<void()> func) {
    auto start = std::chrono::steady_clock::now();
    func();
    auto end = std::chrono::steady_clock::now();
    std::chrono::duration<double> elapsed = end - start;
    return elapsed.count();
}

// Запись результата в файл и консоль
void writeResult(const std::string& message) {
    std::cout << message;
    if (resultsFile.is_open()) {
        resultsFile << message;
        resultsFile.flush();
    }
}

// Тест корректности всех реализаций
void testCorrectness() {
    writeResult("=== Тест корректности ===\n");
    bool found = true;
    constexpr int n = 50;

    // Тестируем список с грубой блокировкой
    RoughBlockingList<int> list1;
    writeResult("RoughBlockingList: ");

    // Вставка
    for (int i = 0; i < n; i++) {
        list1.insert(i, i);
    }

    // Поиск
    found = true;
    for (int i = 0; i < n; i++) {
        if (list1.find(i) != i) {
            found = false;
            break;
        }
    }

    // Удаление
    for (int i = 0; i < n; i++) {
        list1.pop(0);
    }

    if (found && list1.isEmpty()) {
        writeResult("УСПЕХ\n");
    } else {
        writeResult("ПРОВАЛ\n");
    }

    // Тестируем список с тонкой блокировкой
    ThinBlockingList<int> list2;
    writeResult("ThinBlockingList: ");

    // Вставка
    for (int i = 0; i < n; i++) {
        list2.insert(i, i);
    }

    // Поиск
    found = true;
    for (int i = 0; i < n; i++) {
        if (list2.find(i) != i) {
            found = false;
            break;
        }
    }

    // Удаление
    for (int i = 0; i < n; i++) {
        list2.pop(0);
    }

    if (found && list2.isEmpty()) {
        writeResult("УСПЕХ\n");
    } else {
        writeResult("ПРОВАЛ\n");
    }

    // Тестируем LockFreeList
    LockFreeList<int> list3;
    writeResult("LockFreeList: ");

    // Вставка
    for (int i = 0; i < n; i++) {
        list3.insert(i, i);
    }

    // Поиск
    found = true;
    for (int i = 0; i < n; i++) {
        if (list3.find(i) != i) {
            found = false;
            break;
        }
    }

    // Удаление
    for (int i = 0; i < n; i++) {
        list3.pop(0);
    }

    if (found && list3.isEmpty()) {
        writeResult("УСПЕХ\n");
    } else {
        writeResult("ПРОВАЛ\n");
    }

    writeResult("Все списки прошли проверку\n");
    writeResult("===========================\n\n");
}

// Функция для тестирования производительности с разным соотношением читателей/писателей
void BenchmarkList(const std::string &name, IThreadSafeList<int> *list,
                   int readerThreads, int writerThreads, int operationsPerThread) {
    std::vector<std::thread> threads;

    auto reader = [&](int id) {
        for (int i = 0; i < operationsPerThread; ++i) {
            list->find(i % 50); // Поиск элементов
        }
    };

    auto writer = [&](int id) {
        for (int i = 0; i < operationsPerThread; ++i) {
            int value = id * operationsPerThread + i;
            if (i % 2 == 0) {
                // Простая вставка в начало
                list->insert(value, 0);
            } else {
                // Просто проверяем размер, не удаляем
                list->size();
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

    // Ожидаем завершения всех потоков
    for (auto &t: threads) {
        t.join();
    }

    auto endTime = std::chrono::steady_clock::now();
    std::chrono::duration<double> duration = endTime - startTime;

    std::string result = name + " - Readers: " + std::to_string(readerThreads) +
                         ", Writers: " + std::to_string(writerThreads) +
                         ", Time: " + std::to_string(duration.count()) + "s" +
                         ", Final size: " + std::to_string(list->size()) + "\n";
    writeResult(result);
}

// Основной бенчмарк
void runPerformanceBenchmark() {
    writeResult("=== Performance Benchmark ===\n");

    // Заголовок таблицы для файла
    if (resultsFile.is_open()) {
        resultsFile << "Configuration,RoughBlockingList,ThinBlockingList,LockFreeList\n";
    }

    for (const auto &config: configurations) {
        int readers = config.first;
        int writers = config.second;

        std::string configHeader = "\n--- Configuration: " + std::to_string(readers) +
                                   " readers, " + std::to_string(writers) + " writers ---\n";
        writeResult(configHeader);

        double roughTime = 0, thinTime = 0, lockFreeTime = 0;

        // Тестируем RoughBlockingList
        {
            for (int run = 0; run < NUM_RUNS; ++run) {
                RoughBlockingList<int> list;
                roughTime += measureTime([&]() {
                    BenchmarkList("RoughBlockingList", &list, readers, writers, OPERATIONS_PER_THREAD);
                });
            }
            roughTime /= NUM_RUNS;
            std::string result = "RoughBlockingList Average: " + std::to_string(roughTime) + "s\n";
            writeResult(result);
        }

        // Тестируем ThinBlockingList
        {
            for (int run = 0; run < NUM_RUNS; ++run) {
                ThinBlockingList<int> list;
                thinTime += measureTime([&]() {
                    BenchmarkList("ThinBlockingList", &list, readers, writers, OPERATIONS_PER_THREAD);
                });
            }
            thinTime /= NUM_RUNS;
            std::string result = "ThinBlockingList Average: " + std::to_string(thinTime) + "s\n";
            writeResult(result);
        }

        // Тестируем LockFreeList
        {
            for (int run = 0; run < NUM_RUNS; ++run) {
                LockFreeList<int> list;
                lockFreeTime += measureTime([&]() {
                    BenchmarkList("LockFreeList", &list, readers, writers, OPERATIONS_PER_THREAD);
                });
            }
            lockFreeTime /= NUM_RUNS;
            std::string result = "LockFreeList Average: " + std::to_string(lockFreeTime) + "s\n";
            writeResult(result);
        }

        // Записываем данные в CSV формат
        if (resultsFile.is_open()) {
            resultsFile << readers << "R_" << writers << "W,"
                        << std::fixed << std::setprecision(6) << roughTime << ","
                        << thinTime << "," << lockFreeTime << "\n";
        }
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

    std::cout << "Размер: " << list.size() << "\n\n";

    // Удаление элементов
    std::cout << "Удаление элементов...\n";
    for (int i = 0; i <= 10; i++) {
        try {
            size_t pos = list.find(i);
            if (pos < list.size()) {
                list.pop(pos);
            }
        } catch (const std::exception &e) {
            std::cout << "Ошибка удаления " << i << ": " << e.what() << "\n";
        }
    }

    std::cout << "Конечный вид: ";
    list.print();
    std::cout << "Конечный размер: " << list.size() << "\n";
    std::cout << "Пусто: " << (list.isEmpty() ? "да" : "нет") << "\n";
}

// Функция для создания отчета в формате CSV
void createCSVReport() {
    std::ofstream csvFile("performance_report.csv");
    if (!csvFile.is_open()) {
        std::cerr << "Не удалось создать файл отчета CSV\n";
        return;
    }

    // Заголовок CSV
    csvFile << "Configuration,Readers,Writers,RoughBlockingList(s),ThinBlockingList(s),LockFreeList(s)\n";
    for (const auto& config : configurations) {
        int readers = config.first;
        int writers = config.second;

        double roughTime = 0, thinTime = 0, lockFreeTime = 0;

        // RoughBlockingList
        for (int run = 0; run < NUM_RUNS; ++run) {
            RoughBlockingList<int> list;
            roughTime += measureTime([&]() {
                BenchmarkList("", &list, readers, writers, OPERATIONS_PER_THREAD);
            });
        }
        roughTime /= NUM_RUNS;

        // ThinBlockingList
        for (int run = 0; run < NUM_RUNS; ++run) {
            ThinBlockingList<int> list;
            thinTime += measureTime([&]() {
                BenchmarkList("", &list, readers, writers, OPERATIONS_PER_THREAD);
            });
        }
        thinTime /= NUM_RUNS;

        // LockFreeList
        for (int run = 0; run < NUM_RUNS; ++run) {
            LockFreeList<int> list;
            lockFreeTime += measureTime([&]() {
                BenchmarkList("", &list, readers, writers, OPERATIONS_PER_THREAD);
            });
        }
        lockFreeTime /= NUM_RUNS;

        // Запись в CSV
        csvFile << readers << "R_" << writers << "W,"
                << readers << "," << writers << ","
                << std::fixed << std::setprecision(6) << roughTime << ","
                << thinTime << "," << lockFreeTime << "\n";
    }

    csvFile.close();
    writeResult("CSV отчет создан: performance_report.csv\n");
}

int main() {
#ifdef _WIN32
    SetConsoleOutputCP(CP_UTF8);
#endif

    try {
        // Запускаем тесты
        testCorrectness();
//        simpleTest();
//        runPerformanceBenchmark();

        // Создаем дополнительный CSV отчет
        createCSVReport();

    } catch (const std::exception &e) {
        writeResult("Ошибка: " + std::string(e.what()) + "\n");
        return 1;
    }

    return 0;
}