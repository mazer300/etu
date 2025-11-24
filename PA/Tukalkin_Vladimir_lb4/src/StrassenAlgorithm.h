#ifndef STRASSENALGORITHM_H
#define STRASSENALGORITHM_H

#include "Matrix.h"
#include <thread>
#include <vector>
#include <functional>
#include <future>

// Вспомогательная функция для получения подматрицы
template<typename T>
Matrix<T> getSubmatrix(const Matrix<T>& matrix, size_t startRow, size_t endRow, size_t startCol, size_t endCol) {
    size_t rows = endRow - startRow;
    size_t cols = endCol - startCol;
    Matrix<T> sub(rows, cols);

    for (size_t i = 0; i < rows; i++) {
        for (size_t j = 0; j < cols; j++) {
            sub[i][j] = matrix[startRow + i][startCol + j];
        }
    }
    return sub;
}

// Вспомогательная функция для установки подматрицы
template<typename T>
void setSubmatrix(Matrix<T>& target, size_t startRow, size_t startCol, const Matrix<T>& sub) {
    for (size_t i = 0; i < sub.getRows(); i++) {
        for (size_t j = 0; j < sub.getCols(); j++) {
            target[startRow + i][startCol + j] = sub[i][j];
        }
    }
}

// Параллельная версия алгоритма Штрассена
template<typename T>
Matrix<T> parallelAlgorithmStrassen(Matrix<T> a, Matrix<T> b, size_t min_size = 32,
                                    int max_threads = std::thread::hardware_concurrency()) {
    size_t n = a.getRows();

    // Базовый случай - используем стандартное умножение
    if (n <= min_size) {
        return a * b;
    }

    // Проверяем, что матрицы квадратные и размер степени двойки
    if (n != a.getCols() || n != b.getRows() || n != b.getCols()) {
        throw std::invalid_argument("Matrices must be square and of same size for Strassen algorithm");
    }

    // Размеры для подматриц
    size_t half = n / 2;

    // Разбиваем матрицу A на подматрицы
    Matrix<T> A11 = getSubmatrix(a, 0, half, 0, half);
    Matrix<T> A12 = getSubmatrix(a, 0, half, half, n);
    Matrix<T> A21 = getSubmatrix(a, half, n, 0, half);
    Matrix<T> A22 = getSubmatrix(a, half, n, half, n);

    // Разбиваем матрицу B на подматрицы
    Matrix<T> B11 = getSubmatrix(b, 0, half, 0, half);
    Matrix<T> B12 = getSubmatrix(b, 0, half, half, n);
    Matrix<T> B21 = getSubmatrix(b, half, n, 0, half);
    Matrix<T> B22 = getSubmatrix(b, half, n, half, n);

    // Вычисляем вспомогательные матрицы M1-M7
    std::vector<std::future<Matrix<T>>> futures;

    // Функция для рекурсивного вызова с учетом доступных потоков
    auto strassenRecursive = [&](const Matrix<T>& x, const Matrix<T>& y) {
        if (max_threads > 1) {
            // Распределяем потоки между рекурсивными вызовами
            int threads_per_call = std::max(1, max_threads / 7);
            return parallelAlgorithmStrassen(x, y, min_size, threads_per_call);
        } else {
            return sequenceAlgorithmStrassen(x, y, min_size);
        }
    };

    // Запускаем вычисления M1-M7 параллельно если есть доступные потоки
    if (max_threads > 1) {
        // M1 = (A11 + A22) × (B11 + B22)
        futures.push_back(std::async(std::launch::async, [&]() {
            return strassenRecursive(A11 + A22, B11 + B22);
        }));

        // M2 = (A21 + A22) × B11
        futures.push_back(std::async(std::launch::async, [&]() {
            return strassenRecursive(A21 + A22, B11);
        }));

        // M3 = A11 × (B12 - B22)
        futures.push_back(std::async(std::launch::async, [&]() {
            return strassenRecursive(A11, B12 - B22);
        }));

        // M4 = A22 × (B21 - B11)
        futures.push_back(std::async(std::launch::async, [&]() {
            return strassenRecursive(A22, B21 - B11);
        }));

        // M5 = (A11 + A12) × B22
        futures.push_back(std::async(std::launch::async, [&]() {
            return strassenRecursive(A11 + A12, B22);
        }));

        // M6 = (A21 - A11) × (B11 + B12)
        futures.push_back(std::async(std::launch::async, [&]() {
            return strassenRecursive(A21 - A11, B11 + B12);
        }));

        // M7 = (A12 - A22) × (B21 + B22)
        futures.push_back(std::async(std::launch::async, [&]() {
            return strassenRecursive(A12 - A22, B21 + B22);
        }));

        // Получаем результаты
        Matrix<T> M1 = futures[0].get();
        Matrix<T> M2 = futures[1].get();
        Matrix<T> M3 = futures[2].get();
        Matrix<T> M4 = futures[3].get();
        Matrix<T> M5 = futures[4].get();
        Matrix<T> M6 = futures[5].get();
        Matrix<T> M7 = futures[6].get();

        // Вычисляем результирующие подматрицы
        Matrix<T> C11 = M1 + M4 - M5 + M7;
        Matrix<T> C12 = M3 + M5;
        Matrix<T> C21 = M2 + M4;
        Matrix<T> C22 = M1 - M2 + M3 + M6;

        // Собираем конечную матрицу
        Matrix<T> result(n, n);
        setSubmatrix(result, 0, 0, C11);
        setSubmatrix(result, 0, half, C12);
        setSubmatrix(result, half, 0, C21);
        setSubmatrix(result, half, half, C22);

        return result;
    } else {
        // Последовательная версия
        Matrix<T> M1 = strassenRecursive(A11 + A22, B11 + B22);
        Matrix<T> M2 = strassenRecursive(A21 + A22, B11);
        Matrix<T> M3 = strassenRecursive(A11, B12 - B22);
        Matrix<T> M4 = strassenRecursive(A22, B21 - B11);
        Matrix<T> M5 = strassenRecursive(A11 + A12, B22);
        Matrix<T> M6 = strassenRecursive(A21 - A11, B11 + B12);
        Matrix<T> M7 = strassenRecursive(A12 - A22, B21 + B22);

        Matrix<T> C11 = M1 + M4 - M5 + M7;
        Matrix<T> C12 = M3 + M5;
        Matrix<T> C21 = M2 + M4;
        Matrix<T> C22 = M1 - M2 + M3 + M6;

        Matrix<T> result(n, n);
        setSubmatrix(result, 0, 0, C11);
        setSubmatrix(result, 0, half, C12);
        setSubmatrix(result, half, 0, C21);
        setSubmatrix(result, half, half, C22);

        return result;
    }
}

// Последовательная версия через параллельную с 1 потоком
template<typename T>
Matrix<T> sequenceAlgorithmStrassen(Matrix<T> a, Matrix<T> b, size_t min_size = 32) {
    return parallelAlgorithmStrassen(a, b, min_size, 1);
}

#endif // STRASSENALGORITHM_H
