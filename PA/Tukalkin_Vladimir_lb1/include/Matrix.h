#ifndef MATRIX_H
#define MATRIX_H

#include <vector>
#include <iostream>
#include <random>
#include <cassert>

class Matrix {
public:
    Matrix(int rows, int cols);

    ~Matrix() = default;

    // Конструктор копирования
    Matrix(const Matrix &other);

    // Конструктор перемещения
    Matrix(Matrix &&other) noexcept;

    // Оператор копирования
    Matrix &operator=(const Matrix &other);

    // Оператор перемещения
    Matrix &operator=(Matrix &&other) noexcept;

    // Вывод матрицы в консоль
    void print() const;

    // Заполнение матрицы случайными значениями [-100, 100]
    void fillRandom();

    // Заполнение матрицы
    void fillMatrix(std::vector<std::vector<int>> const &data);

    std::vector<int> &operator[](size_t index);

    // Оператор сравнения
    bool operator==(Matrix other) const;

    Matrix &operator+=(Matrix other);

    Matrix operator*(Matrix &other);

    [[nodiscard]] int getRows() const;

    [[nodiscard]] int getCols() const;

    std::vector<std::vector<int>> getData();

private:
    int rows;
    int cols;
    std::vector<std::vector<int> > matrix;
};


#endif //MATRIX_H
