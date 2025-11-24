#ifndef BLOCKMATRIX_H
#define BLOCKMATRIX_H

#include "Matrix.h"
#include <thread>
//#include <async> Определена в future
#include <future>

class BlockMatrix {
public:
    BlockMatrix(int rows, int cols);

    ~BlockMatrix() = default;

    // Вывод матрицы в консоль
    void print();

    // Заполнение матрицы случайными значениями [-100, 100]
    void fillRandom();

    // Заполнения блочной матрицы
    void fillMatrix(std::vector<std::vector<Matrix>> &data);

    // Заполнения определённого блока
    void fillBlock(Matrix const &data, int i, int j);

    std::vector<Matrix> &operator[](size_t index);

    bool operator==(BlockMatrix other) const;

    // Последовательное умножение блочных матрикс
    BlockMatrix operator*(BlockMatrix &other);

    // Многопоточное умножение с использованием std::thread
    BlockMatrix parallelMultiply(BlockMatrix &other, int num_threads);

    // Многопоточное умножение с использованием std::async
    BlockMatrix asyncMultiply(BlockMatrix &other, int num_threads);

    [[nodiscard]] int getRows() const;

    [[nodiscard]] int getCols() const;

    std::vector<std::vector<Matrix>> getData();

private:
    static void multiplyBlock(BlockMatrix &a, BlockMatrix &b, BlockMatrix &c, int i, int j);

    int rows;
    int cols;
    std::vector<std::vector<Matrix>> matrix;
};


#endif //BLOCKMATRIX_H
