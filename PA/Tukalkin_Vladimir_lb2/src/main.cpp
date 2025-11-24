#include <iostream>
#include <vector>
#include <chrono>
#include <thread>
#include <functional>
#include <fstream>
#include <iomanip>
#include "../include/IThreadSafeList.h"
#include "../include/RoughBlockingList.h"
#include "../include/ThinBlockingList.h"
#include "../include/LockFreeList.h"

#ifdef _WIN32
#include <windows.h>
#endif


// Глобальный файл для записи результатов
std::ofstream resultsFile;
constexpr int OPERATIONS_PER_THREAD = 10000;
constexpr int NUM_RUNS = 5; // Количество запусков для усреднения

// Конфигурации тестов: {читатели, писатели}
std::vector<std::pair<int, int> > configurations = {
    {1, 1}, {2, 1}, {4, 1}, {8, 1}, {16, 1},
    {1, 2}, {1, 4}, {1, 8}, {1, 16},
    {2, 2}, {4, 4}, {8, 8}, {16, 16}
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
void writeResult(const std::string &message) {
    std::cout << message;
    if (resultsFile.is_open()) {
        resultsFile << message;
        resultsFile.flush();
    }
}

// Тестирование списка в один поток
bool testSingleThread(IThreadSafeList<int> *list) {
    bool found = true;
    constexpr int n = 50;

    // Вставка
    for (int i = 0; i < n; i++) {
        list->insert(i, i);
    }

    // Поиск
    for (int i = 0; i < n; i++) {
        if (list->find(i) != i) {
            found = false;
            break;
        }
    }

    // Удаление
    for (int i = 0; i < n; i++) {
        list->pop(0);
    }

    return found && list->isEmpty();
}

// Тестирование списка в много потоков
bool testMultiThread(IThreadSafeList<int> *list) {
    constexpr int operationsPerThread = 100;
    std::atomic<bool> found(true);

    auto reader = [&](const int id) {
        for (int i = 0; i < operationsPerThread; ++i) {
            if (list->find(id * operationsPerThread + i) == list->size()) { // Поиск элементов
                found.store(false);
            }
        }
    };

    auto insert = [&](const int id) {
        for (int i = 0; i < operationsPerThread; ++i) {
            list->insert(id * operationsPerThread + i, 0);
        }
    };

    auto pop = [&](const int idx) {
        for (int i = 0; i < operationsPerThread; ++i) {
            try {
                list->pop(idx);
            }catch (const std::exception &e) {}
        }
    };

    // Тестирование вставки
    {
        std::vector<std::thread> threads;
        for (int i = 0; i < 2; ++i) {
            threads.emplace_back(insert, i);
        }

        for (auto &t: threads) {
            t.join();
        }
    }

    //Тестирование поиска
    {
        std::vector<std::thread> threads;
        for (int i = 0; i < 2; ++i) {
            threads.emplace_back(reader, i);
        }

        for (auto &t: threads) {
            t.join();
        }
    }

    //Тестирование удаления
    {
        std::vector<std::thread> threads;

        threads.emplace_back(pop, 0);
        threads.emplace_back(pop, 1);


        for (auto &t: threads) {
            t.join();
        }
    }

    return list->isEmpty() && found;
}

// Тест корректности всех реализаций
void testCorrectness() {
    std::cout << "=== Тест корректности ===\n";

    // Тестируем список с грубой блокировкой
    {
        RoughBlockingList<int> list;

        std::cout << "RoughBlockingList однопоточно: ";
        testSingleThread(&list) == true ? std::cout << "УСПЕХ\n" : std::cout << "ПРОВАЛ\n";

        std::cout << "RoughBlockingList многопоточно: ";
        testMultiThread(&list) == true ? std::cout << "УСПЕХ\n" : std::cout << "ПРОВАЛ\n";
    }

    // Тестируем список с тонкой блокировкой
    {
        ThinBlockingList<int> list;

        std::cout << "ThinBlockingList однопоточно: ";
        testSingleThread(&list) == true ? std::cout << "УСПЕХ\n" : std::cout << "ПРОВАЛ\n";

        std::cout << "ThinBlockingList многопоточно: ";
        testMultiThread(&list) == true ? std::cout << "УСПЕХ\n" : std::cout << "ПРОВАЛ\n";
    }

    // Тестируем LockFreeList
    {
        LockFreeList<int> list;

        std::cout << "LockFreeList однопоточно: ";
        testSingleThread(&list) == true ? std::cout << "УСПЕХ\n" : std::cout << "ПРОВАЛ\n";

        std::cout << "LockFreeList многопоточно: ";
        testMultiThread(&list) == true ? std::cout << "УСПЕХ\n" : std::cout << "ПРОВАЛ\n";
    }

    std::cout << "Все списки прошли проверку\n";
    std::cout << "===========================\n\n";
}


// Функция для тестирования производительности с разным соотношением читателей/писателей
void BenchmarkList(const std::string &name, IThreadSafeList<int> *list,
                   const int readerThreads, const int writerThreads, const int operationsPerThread) {
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
                list->insert(value, 0);
            }
        }
    };

    // Создаем потоки-читатели
    for (int i = 0; i < readerThreads; ++i) {
        threads.emplace_back(reader, i);
    }

    // Создаем потоки-писатели, вставка
    for (int i = 0; i < writerThreads / 2; ++i) {
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

// Функция для создания отчета в формате CSV
void createCSVReport() {
    std::ofstream csvFile("performance_report.csv");
    if (!csvFile.is_open()) {
        std::cerr << "Не удалось создать файл отчета CSV\n";
        return;
    }

    // Заголовок CSV
    csvFile << "Configuration,Readers,Writers,RoughBlockingList(s),ThinBlockingList(s),LockFreeList(s)\n";
    for (const auto &config: configurations) {
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
        // for (int i = 0; i < 1000; i++) testCorrectness();
        testCorrectness();
        // runPerformanceBenchmark();

        // Создаем дополнительный CSV отчет
        // createCSVReport();
    } catch (const std::exception &e) {
        writeResult("Ошибка: " + std::string(e.what()) + "\n");
        return 1;
    }

    return 0;
}
