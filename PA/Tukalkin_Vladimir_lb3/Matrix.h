#ifndef MATRIX_H
#define MATRIX_H

#include <iostream>
#include <random>
#include <vector>
#include <cassert>

template<typename T>
class Matrix {
public:
    // Конструктор класса
    Matrix(const size_t rows, const size_t cols) : rows(rows), cols(cols) {
        for (size_t i = 0; i < rows; i++) {
            std::vector<T> temp(cols, 0);
            data.emplace_back(temp);
        }
    }

    // Конструктор по умолчанию
    Matrix() = default;

    // Деструктор
    ~Matrix() = default;

    // Конструктор копирования
    Matrix(const Matrix<T> &other) : rows(other.rows), cols(other.cols), data(other.data) {
    }

    // Конструктор перемещения
    Matrix(Matrix<T> &&other) noexcept : rows(other.rows), cols(other.cols), data(std::move(other.data)) {
        other.rows = 0;
        other.cols = 0;
    }

    // Оператор копирования
    Matrix &operator=(const Matrix<T> &other) {
        if (this == &other) {
            return *this;
        }

        rows = other.rows;
        cols = other.cols;
        data = other.data;
        return *this;
    }

    // Оператор перемещения
    Matrix<T> &operator=(Matrix<T> &&other) noexcept {
        if (this == &other) {
            return *this;
        }
        rows = other.rows;
        cols = other.cols;
        data = std::move(other.data);
        other.rows = 0;
        other.cols = 0;
        return *this;
    }

    // Заполнение случайными значениями
    void fillRandom(T a, T b) {
        std::random_device rd;
        std::mt19937 gen(rd());

        if constexpr (std::is_integral_v<T>) {
            std::uniform_int_distribution<> dist(a, b);
            for (size_t i = 0; i < rows; i++) {
                for (size_t j = 0; j < cols; j++) {
                    data[i][j] = dist(gen);
                }
            }
        } else if constexpr (std::is_floating_point_v<T>) {
            std::uniform_real_distribution<> dist(a, b);
            for (size_t i = 0; i < rows; i++) {
                for (size_t j = 0; j < cols; j++) {
                    data[i][j] = dist(gen);
                }
            }
        }
    }

    // Вывод матрицы в консоль
    void print() {
        for (size_t i = 0; i < rows; i++) {
            for (size_t j = 0; j < cols; j++) {
                std::cout << data[i][j] << " ";
            }
            std::cout << '\n';
        }
    }

    // Оператор сравнения
    bool operator==(const Matrix<T> &other) const {
        if (other.rows != rows || other.cols != cols) {
            return false;
        }
        for (size_t i = 0; i < rows; i++) {
            for (size_t j = 0; j < cols; j++) {
                if (data[i][j] != other.data[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }

    // Оператор неравенства
    bool operator!=(const Matrix<T> &other) const {
        return !(*this == other);
    }

    // Оператор сложения
    Matrix<T> &operator+=(const Matrix<T> &other) {
        assert(rows == other.rows);
        assert(cols == other.cols);
        for (size_t i = 0; i < rows; i++) {
            for (size_t j = 0; j < cols; j++) {
                data[i][j] += other.data[i][j];
            }
        }
        return *this;
    }

    // Оператор суммирования
    Matrix<T> operator+(const Matrix<T> &other) const {
        Matrix<T> result = *this;
        result += other;
        return result;
    }

    // Оператор вычитания
    Matrix<T> &operator-=(const Matrix<T> &other) {
        assert(rows == other.rows);
        assert(cols == other.cols);
        for (size_t i = 0; i < rows; i++) {
            for (size_t j = 0; j < cols; j++) {
                data[i][j] -= other.data[i][j];
            }
        }
        return *this;
    }

    // Оператор разности
    Matrix<T> operator-(const Matrix<T> &other) const {
        Matrix<T> result = *this;
        result -= other;
        return result;
    }

    // Оператор умножения
    Matrix<T> operator*(Matrix<T> &other) const {
        assert(cols == other.rows);
        Matrix<T> result(rows, other.cols);
        for (size_t i = 0; i < rows; i++) {
            for (size_t j = 0; j < other.cols; j++) {
                T sum = T(0);
                for (size_t k = 0; k < cols; k++) {
                    sum += data[i][k] * other.data[k][j];
                }
                result.data[i][j] = sum;
            }
        }
        return result;
    }

    // Оператор индексации
    std::vector<T> &operator[](size_t index) {
        assert(index < rows);
        return data[index];
    }

    // Оператор индексации для const
    const std::vector<T> &operator[](size_t index) const {
        assert(index < rows);
        return data[index];
    }

    // Установить значения во все ячейки
    void setData(const std::vector<std::vector<T> > &matrix) {
        for (size_t i = 0; i < rows; i++) {
            for (size_t j = 0; j < cols; j++) {
                data[i][j] = matrix[i][j];
            }
        }
    }

    // Установить значение в ячейку
    void setCell(T value, const size_t i, const size_t j) {
        assert(i < rows);
        assert(j < cols);
        data[i][j] = value;
    }

    // Оператор вставки
    friend std::ostream &operator<<(std::ostream &os, const Matrix<T> &matrix) {
        for (size_t i = 0; i < matrix.rows; i++) {
            for (size_t j = 0; j < matrix.cols; j++) {
                os << matrix.data[i][j] << " ";
            }
            os << '\n';
        }
        return os;
    }

    // Получить значение в ячейке
    T getCell(const size_t i, const size_t j) const {
        assert(i < rows);
        assert(j < cols);
        return data[i][j];
    }

    // Получить всю матрицу в виде вектора
    std::vector<std::vector<T> > getData() { return data; }

    // Получить количество строк
    [[nodiscard]] size_t getRows() const { return rows; }

    // Получить количество колонок
    [[nodiscard]] size_t getCols() const { return cols; }

private:
    size_t rows = 0; // Количество строк
    size_t cols = 0; // Количество колонок
    std::vector<std::vector<T> > data; // Данные матрицы
};

#endif //MATRIX_H
