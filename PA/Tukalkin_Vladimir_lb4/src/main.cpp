#include <chrono>
#include <functional>
#include <fstream>

#ifdef _WIN32
#include <windows.h>
#else
#include <iomanip>
#endif

#include "StrassenAlgorithm.h"
#include "MergeSort.h"
#include "BlockMatrix.h"

const std::vector<int> nums_threads = {2, 4, 8, 16};
const std::vector<int> sort_sizes = {10000, 50000, 100000, 500000, 1000000, 5000000, 10000000, 5000000, 100000000};
const std::vector<int> matrix_sizes = {64, 128, 256, 512, 1024, 2048, 4096};


// Функция для измерения времени выполнения
double measureTime(const std::function<void()> &func) {
    const auto start = std::chrono::steady_clock::now();
    func();
    const auto end = std::chrono::steady_clock::now();
    const std::chrono::duration<double> elapsed = end - start;
    return elapsed.count();
}

// Тестирование корректности сортировки слиянием
bool testCorrectnessMergeSort() {
    bool correct = false;

    std::vector<int> a;
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dist(-100000, 100000);
    for (size_t i = 0; i < 100; i++) {
        a.push_back(dist(gen));
    }

    std::vector<int> a1, a2;
    for (auto i: a) {
        a1.push_back(i);
        a2.push_back(i);
    }

    std::sort(a.begin(), a.end());
    sequenceMergeSort(a1);
    parallelMergeSort(a2, 2);

    std::cout << "Последовательная сортировка слиянием: ";
    if (a == a1) {
        std::cout << "УСПЕХ\n";
        correct = true;
    } else {
        std::cout << "ПРОВАЛ\n";
        correct = false;
    }

    std::cout << "Параллельная сортировка слиянием: ";
    if (a1 == a2) {
        std::cout << "УСПЕХ\n";
        correct = true;
    } else {
        std::cout << "ПРОВАЛ\n";
        correct = false;
    }
    return correct;
}

// Тестирование корректности алгоритма Штрассена
bool testCorrectnessStrassen() {
    bool correct = false;
    Matrix<int> a = Matrix<int>(128, 128);
    Matrix<int> b = Matrix<int>(128, 128);
    a.fillRandom(-100, 100);
    b.fillRandom(-100, 100);

    const Matrix<int> c = a * b;

    std::cout << "Алгоритм Штрассена последовательно: ";
    if (c == sequenceAlgorithmStrassen(a, b)) {
        correct = true;
        std::cout << "УСПЕХ" << '\n';
    } else {
        std::cout << "ПРОВАЛ" << '\n';
        correct = false;
    }

    std::cout << "Алгоритм Штрассена параллельно: ";
    if (c == parallelAlgorithmStrassen(a, b)) {
        correct = true;
        std::cout << "УСПЕХ" << '\n';
    } else {
        std::cout << "ПРОВАЛ" << '\n';
        correct = false;
    }

    return correct;
}

// Тестирование корректности алгоритма блочного умножения
bool testCorrectnessBlockMatrix() {
    bool correct = false;
    Matrix<int> a(128, 128);
    Matrix<int> b(128, 128);
    a.fillRandom(-100, 100);
    b.fillRandom(-100, 100);
    Matrix<int> c = a * b;

    BlockMatrix<int> a_block = matrixToBlockMatrix(a, 2, 2);
    BlockMatrix<int> b_block = matrixToBlockMatrix(b, 2, 2);
    const BlockMatrix<int> c_block = matrixToBlockMatrix(c, 2, 2);

    const BlockMatrix<int> c1 = a_block.parallelMultiply(b_block, 2);

    std::cout << "Алгоритм умножения блочных матриц: ";
    if (c_block == a_block.parallelMultiply(b_block, 2)) {
        correct = true;
        std::cout << "УСПЕХ" << '\n';
    } else {
        std::cout << "ПРОВАЛ" << '\n';
        correct = false;
    }

    return correct;
}

// Тесты
void testCorrectness() {
    std::cout << "=== Проверка алгоритмов ===\n";
    const bool testMergeSort = testCorrectnessMergeSort();
    const bool testBlockMatrix = testCorrectnessBlockMatrix();
    const bool testStrassen = testCorrectnessStrassen();
    if (testMergeSort && testStrassen && testBlockMatrix) {
        std::cout << "Все тесты успешно пройдены\n";
    } else {
        std::cout << "Не все тесты прошли проверку\n";
    }
}

// Бенчмарк с записью в CSV
void benchmarkToCSV(int runs = 5) {
    std::cout << "\n=== ЗАПУСК БЕНЧМАРКА С УСРЕДНЕНИЕМ ===\n";
    std::cout << "Количество замеров для усреднения: " << runs << "\n";


    // Бенчмарк сортировки слиянием
    /*{
        // Создание файла и заголовок CSV файла
        std::ofstream sort_file("sort_benchmark.csv");
        sort_file << "Size,Sequential,1_Thread,2_Threads,4_Threads,8_Threads,16_Threads\n";
        std::cout << "\nТестирование сортировки слиянием...\n";
        std::vector<int> sort_threads = nums_threads;

        for (int size: sort_sizes) {
            std::cout << "  Размер: " << size << " (";

            // Генерация тестовых данных один раз для всех замеров
            std::vector<int> original;
            std::random_device rd;
            std::mt19937 gen(rd());
            std::uniform_int_distribution<> dist(-1000000, 1000000);

            for (int i = 0; i < size; i++) {
                original.push_back(dist(gen));
            }

            sort_file << size;

            // Последовательная версия - усредняем несколько замеров
            std::cout << "посл";
            double seq_time_total = 0;
            for (int i = 0; i < runs; i++) {
                std::vector<int> seq_data = original;
                seq_time_total += measureTime([&] {
                    sequenceMergeSort(seq_data);
                });
            }
            double seq_time_avg = seq_time_total / runs;
            sort_file << "," << std::fixed << std::setprecision(6) << seq_time_avg;

            // Параллельные версии - усредняем несколько замеров
            for (int threads: sort_threads) {
                std::cout << ", " << threads << "пот";
                double par_time_total = 0;
                for (int i = 0; i < runs; i++) {
                    std::vector<int> par_data = original;
                    par_time_total += measureTime([&] {
                        parallelMergeSort(par_data, threads);
                    });
                }
                double par_time_avg = par_time_total / runs;
                sort_file << "," << std::fixed << std::setprecision(6) << par_time_avg;
            }

            std::cout << ")\n";
            sort_file << "\n";
        }
        sort_file.close();
    }*/

    // Бенчмарк алгоритма Штрассена
    {
        // Создание файла и заголовок CSV файла
        std::ofstream strassen_file("strassen_benchmark.csv");
        strassen_file << "Size,Standard,Sequential_Strassen,1_Thread,2_Threads,4_Threads,8_Threads,16_Threads\n";
        std::cout << "\nТестирование алгоритма Штрассена...\n";

        std::vector<std::vector<double>> times;

        std::vector<int> strassen_threads = nums_threads;

        for (int size: matrix_sizes) {
            std::vector<double> times_strassen;
            std::cout << "  Матрица: " << size << "x" << size << " (";

            // Создаем матрицы один раз для всех замеров
            Matrix<int> A(size, size);
            Matrix<int> B(size, size);
            A.fillRandom(-100, 100);
            B.fillRandom(-100, 100);

            strassen_file << size;

            // Стандартное умножение - усредняем несколько замеров
            std::cout << "стандарт";
            double std_time_total = 0;
            for (int i = 0; i < runs; i++) {
                Matrix<int> A_std = A;
                Matrix<int> B_std = B;
                std_time_total += measureTime([&] {
                    auto result = A_std * B_std;
                });
            }
            double std_time_avg = std_time_total / runs;
            times_strassen.push_back(std_time_avg);
            strassen_file << "," << std::fixed << std::setprecision(6) << std_time_avg;

            // Последовательный Штрассен - усредняем несколько замеров
            std::cout << ", послШтрассен";
            double seq_time_total = 0;
            for (int i = 0; i < runs; i++) {
                Matrix<int> A_seq = A;
                Matrix<int> B_seq = B;
                seq_time_total += measureTime([&] {
                    auto result = sequenceAlgorithmStrassen(A_seq, B_seq, 32);
                });
            }
            double seq_time_avg = seq_time_total / runs;
            strassen_file << "," << std::fixed << std::setprecision(6) << seq_time_avg;
            times_strassen.push_back(seq_time_avg);

            // Параллельный Штрассен - усредняем несколько замеров
            for (int threads: strassen_threads) {
                std::cout << ", " << threads << "пот";
                double par_time_total = 0;
                for (int i = 0; i < runs; i++) {
                    Matrix<int> A_par = A;
                    Matrix<int> B_par = B;
                    par_time_total += measureTime([&] {
                        auto result = parallelAlgorithmStrassen(A_par, B_par, 32, threads);
                    });
                }
                double par_time_avg = par_time_total / runs;
                strassen_file << "," << std::fixed << std::setprecision(6) << par_time_avg;

                times_strassen.push_back(par_time_avg);
            }

            std::cout << ")\n";
            strassen_file << "\n";

            times.push_back(times_strassen);
        }
        strassen_file.close();

        for (auto i : times) {
            for (auto j : i) {
                std::cout << j << " ";
            }
            std::cout << "\n";
        }

    }

    // Бенчмарк алгоритма блочного умножения
    /*{
        // Создание файла и заголовок CSV файла
        std::ofstream block_matrix_file("block_matrix_benchmark.csv");
        block_matrix_file << "Size,Standard,1_Thread,2_Threads,4_Threads,8_Threads,16_Threads\n";
        std::cout << "\nТестирование алгоритма умножения блочных матриц...\n";


        std::vector<int> block_matrix_threads = {1};
        for (auto i: nums_threads) {
            block_matrix_threads.push_back(i);
        }

        for (int size: matrix_sizes) {
            std::cout << "  Матрица: " << size << "x" << size << " (";

            // Создаем матрицы один раз для всех замеров
            Matrix<int> A(size, size);
            Matrix<int> B(size, size);
            A.fillRandom(-100, 100);
            B.fillRandom(-100, 100);

            block_matrix_file << size;
            // Блочное умножение - усредняем несколько замеров
            for (int threads: block_matrix_threads) {
                std::cout << ", " << threads << "пот";
                double par_time_total = 0;
                for (int i = 0; i < runs; i++) {
                    auto [x,y] = calculateBlockDimensions(size);
                    BlockMatrix<int> block_A = matrixToBlockMatrix(A,x,y);
                    BlockMatrix<int> block_B = matrixToBlockMatrix(B,y,x);
                    par_time_total += measureTime([&] {
                        auto result = block_A.parallelMultiply(block_B,threads);
                    });
                }
                double par_time_avg = par_time_total / runs;
                block_matrix_file << "," << std::fixed << std::setprecision(6) << par_time_avg;
            }

            std::cout << ")\n";
            block_matrix_file << "\n";
        }
        block_matrix_file.close();
    }*/


    // Анализ ускорения для большого набора данных
    /*{
        // Создание файла и заголовок CSV файла
        std::ofstream speedup_file("speedup_benchmark.csv");
        speedup_file << "Algorithm,Threads,Time,Speedup\n";
        std::cout << "\nАнализ ускорения...\n";

        // Ускорение сортировки (100,000,000 элементов)
        std::cout << "  Сортировка 100,000,000 элементов: ";
        std::vector<int> speedup_data(100000000);
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_int_distribution<> dist(-100000000, 100000000);

        for (int i = 0; i < 100000000; i++) {
            speedup_data[i] = dist(gen);
        }

        double base_time_sort_total = 0;
        for (int i = 0; i < runs; i++) {
            std::vector<int> base_data = speedup_data;
            base_time_sort_total += measureTime([&] {
                sequenceMergeSort(base_data);
            });
        }
        double base_time_sort = base_time_sort_total / runs;
        speedup_file << "MergeSort,1," << base_time_sort << ",1.0\n";
        std::cout << "посл=" << base_time_sort << "с ";

        for (int threads: nums_threads) {
            double time_total = 0;
            for (int i = 0; i < runs; i++) {
                std::vector<int> test_data = speedup_data;
                time_total += measureTime([&] {
                    parallelMergeSort(test_data, threads);
                });
            }
            double time_avg = time_total / runs;
            double speedup = base_time_sort / time_avg;
            speedup_file << "MergeSort," << threads << "," << time_avg << "," << speedup << "\n";
            std::cout << threads << "пот=" << time_avg << "с ";
        }
        std::cout << "\n";

        // Ускорение алгоритма Штрассена (4096x4096)
        std::cout << "  Алгоритм Штрассена 4096x4096: ";
        Matrix<int> A(4096, 4096);
        Matrix<int> B(4096, 4096);
        A.fillRandom(-100, 100);
        B.fillRandom(-100, 100);

        double base_time_strassen_total = 0;
        for (int i = 0; i < runs; i++) {
            Matrix<int> A_base = A;
            Matrix<int> B_base = B;
            base_time_strassen_total += measureTime([&] {
                auto result = sequenceAlgorithmStrassen(A_base, B_base, 32);
            });
        }
        double base_time_strassen = base_time_strassen_total / runs;
        speedup_file << "Strassen,1," << base_time_strassen << ",1.0\n";
        std::cout << "посл=" << base_time_strassen << "с ";

        for (int threads: nums_threads) {
            double time_total = 0;
            for (int i = 0; i < runs; i++) {
                Matrix<int> A_test = A;
                Matrix<int> B_test = B;
                time_total += measureTime([&] {
                    auto result = parallelAlgorithmStrassen(A_test, B_test, 32, threads);
                });
            }
            double time_avg = time_total / runs;
            double speedup = base_time_strassen / time_avg;
            speedup_file << "Strassen," << threads << "," << time_avg << "," << speedup << "\n";
            std::cout << threads << "пот=" << time_avg << "с ";
        }
        speedup_file.close();
    }*/
    std::cout << '\n';
    std::cout << "\nБенчмарк завершен. Данные сохранены в CSV файлы.\n";
}

int main() {
#ifdef _WIN32
    SetConsoleOutputCP(CP_UTF8);
#endif

    testCorrectness();
    benchmarkToCSV();

    return 0;
}
