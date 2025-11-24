#include "../include/Matrix.h"

Matrix::Matrix(int rows, int cols) {
    this->rows = rows;
    this->cols = cols;
    for (int i = 0; i < rows; i++) {
        std::vector<int> tmp(cols, 0);
        matrix.emplace_back(tmp);
    }
}

// Конструктор копирования
Matrix::Matrix(const Matrix &other) : rows(other.rows), cols(other.cols), matrix(other.matrix) {}

// Конструктор перемещения
Matrix::Matrix(Matrix &&other) noexcept : rows(other.rows), cols(other.cols), matrix(std::move(other.matrix)) {
    other.rows = 0;
    other.cols = 0;
}

// Оператор копирования
Matrix &Matrix::operator=(const Matrix &other) {
    if (this == &other) {
        return *this;
    }
    rows = other.rows;
    cols = other.cols;
    matrix = other.matrix;
    return *this;
}

// Оператор перемещения
Matrix &Matrix::operator=(Matrix &&other) noexcept {
    if (this == &other) {
        return *this;
    }
    rows = other.rows;
    cols = other.cols;
    matrix = std::move(other.matrix);

    other.rows = 0;
    other.cols = 0;
    return *this;
}

// Вывод матрицы в консоль
void Matrix::print() const {
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            std::cout << matrix[i][j] << " ";
        }
        std::cout << '\n';
    }
}

// Заполнение матрицы случайными значениями [-100, 100]
void Matrix::fillRandom() {
    std::random_device rd;
    std::mt19937 mt1(rd());
    std::uniform_int_distribution<int> dist(-100, 100);
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            matrix[i][j] = dist(mt1);
        }
    }
}

// Заполнение матрицы
void Matrix::fillMatrix(std::vector<std::vector<int>> const &data) {
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            matrix[j][i] = data[j][i];
        }
    }
}

std::vector<int> &Matrix::operator[](size_t const index) {
    return matrix[index];
}

// Оператор сравнения
bool Matrix::operator==(Matrix other) const {
    if (other.getCols() != cols || other.getCols() != cols) {
        return false;
    }

    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            if (matrix[i][j] != other[i][j]) {
                return false;
            }
        }
    }
    return true;
}

Matrix &Matrix::operator+=(Matrix other) {
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            matrix[i][j] += other[i][j];
        }
    }
    return *this;
}

Matrix Matrix::operator*(Matrix &other) {
    // Инициализация матрицы С
    assert(cols == other.rows);
    Matrix c(rows, other.cols);

    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < other.cols; j++) {
            int sum = 0;
            for (int k = 0; k < cols; k++) {
                sum += matrix[i][k] * other[k][j];
            }
            c[i][j] = sum;
        }
    }
    return c;
}

int Matrix::getRows() const {
    return rows;
}

int Matrix::getCols() const {
    return cols;
}

std::vector<std::vector<int>> Matrix::getData() {
    return matrix;
}
