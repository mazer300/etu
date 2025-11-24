#ifndef LB3_BLOCKMATRIX_H
#define LB3_BLOCKMATRIX_H

#include "Matrix.h"
#include <thread>


template<typename T>
class BlockMatrix {
public:
    // Конструктор
    BlockMatrix(const int rows, const int cols) : rows(rows), cols(cols) {
        for (int i = 0; i < rows; i++) {
            std::vector<Matrix<T> > tmp(cols, Matrix<T>(0, 0));
            matrix.emplace_back(tmp);
        }
    }

    // Конструктор по умолчанию
    BlockMatrix() = default;

    // Деструктор
    ~BlockMatrix() = default;

    // Вывод матрицы в консоль
    void print() {
        for (int block_row = 0; block_row < rows; block_row++) {
            int max_block_rows = 0;
            for (int block_col = 0; block_col < cols; block_col++) {
                max_block_rows = std::max(max_block_rows, matrix[block_row][block_col].getRows());
            }

            for (int row_in_block = 0; row_in_block < max_block_rows; row_in_block++) {
                for (int block_col = 0; block_col < cols; block_col++) {
                    Matrix<T> &current_block = matrix[block_row][block_col];

                    if (row_in_block < current_block.getRows()) {
                        for (int col_in_block = 0; col_in_block < current_block.getCols(); col_in_block++) {
                            std::cout << current_block[row_in_block][col_in_block] << " ";
                        }
                    } else {
                        for (int col_in_block = 0; col_in_block < current_block.getCols(); col_in_block++) {
                            std::cout << "  ";
                        }
                    }

                    if (block_col < cols - 1) {
                        std::cout << "| ";
                    }
                }
                std::cout << '\n';
            }

            // Разделительная линия между строками блоков
            if (block_row < rows - 1) {
                for (int block_col = 0; block_col < cols; block_col++) {
                    Matrix<T> &current_block = matrix[block_row][block_col];
                    for (int i = 0; i < current_block.getCols() * 3 - 1; i++) {
                        std::cout << "-";
                    }
                    if (block_col < cols - 1) {
                        std::cout << "+-";
                    }
                }
                std::cout << '\n';
            }
        }
    }

    // Заполнение матрицы случайными значениями [a, b]
    void fillRandom(T a, T b) {
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                Matrix<T> tmp(matrix[i][j].getRows(), matrix[i][j].getCols());
                tmp.fillRandom(a, b);
                matrix[i][j] = tmp;
            }
        }
    }

    // Заполнения блочной матрицы
    void fillMatrix(std::vector<std::vector<Matrix<T> > > &data) {
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                matrix[i][j] = data[i][j];
            }
        }
    }

    // Заполнения определённого блока
    void fillBlock(Matrix<T> const &data, int i, int j) {
        matrix[i][j] = data;
    }

    // Оператор индексации
    std::vector<Matrix<T> > &operator[](size_t index) {
        return matrix[index];
    }

    // Оператор индексации для const
    const std::vector<Matrix<T> > &operator[](size_t index) const {
        return matrix[index];
    }

    // Оператор сравнения на равенство
    bool operator==(const BlockMatrix<T> other) const {
        if (other.rows != rows || other.cols != cols) {
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

    // Оператор неравенства
    bool operator!=(const BlockMatrix<T> &other) const {
        return !(*this == other);
    }

    // Последовательное умножение блочных матриц
    BlockMatrix operator*(BlockMatrix<T> &other) {
        assert(cols == other.rows);
        BlockMatrix c(rows, other.getCols());
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < other.getCols(); j++) {
                multiplyBlock(*this, other, c, i, j);
            }
        }
        return c;
    }

    // Многопоточное умножение с использованием std::thread
    BlockMatrix<T> parallelMultiply(BlockMatrix<T> &other, const int num_threads) {
        assert(cols == other.rows);
        BlockMatrix c(rows, other.cols);

        std::vector<std::thread> threads;
        const int total_blocks = rows * other.cols;
        const int blocks_per_thread = (total_blocks + num_threads - 1) / num_threads;

        for (int t = 0; t < num_threads; t++) {
            int start_block = t * blocks_per_thread;
            int end_block = std::min((t + 1) * blocks_per_thread, total_blocks);

            threads.emplace_back([this, &other, &c, start_block, end_block]() {
                for (int block_idx = start_block; block_idx < end_block; block_idx++) {
                    int i = block_idx / other.cols;
                    int j = block_idx % other.cols;
                    multiplyBlock(*this, other, c, i, j);
                }
            });
        }

        for (auto &thread: threads) {
            thread.join();
        }

        return c;
    }

    // Получить количество строк
    [[nodiscard]] int getRows() const { return rows; }

    // Получить количество колонок
    [[nodiscard]] int getCols() const { return cols; }

    // Получить матрицу в виде вектора
    std::vector<std::vector<Matrix<T> > > getData() { return matrix; }

private:
    // Умножение блока
    static void multiplyBlock(BlockMatrix<T> &a, BlockMatrix<T> &b, BlockMatrix<T> &c, int i, int j) {
        Matrix<T> sum = Matrix<T>(a[i][0].getRows(), b[0][j].getCols());
        for (int k = 0; k < a.getCols(); k++) {
            sum += a[i][k] * b[k][j];
        }
        c.fillBlock(sum, i, j);
    }

    int rows = 0;
    int cols = 0;
    std::vector<std::vector<Matrix<T> > > matrix;
};

// Функция, которая считает размеры блоков
inline std::pair<int, int> calculateBlockDimensions(const int matrix_size) {
    int x = 0, y = 0;

    for (int i = (int)sqrt(matrix_size); i <= matrix_size; i++) {
        if (matrix_size % i == 0) {
            x = i;
            y = matrix_size / i;
            break;
        }
    }
    return {x, y};
}


// Преобразование простой матрицы в блочную матрицу
template<typename T>
BlockMatrix<T> matrixToBlockMatrix(Matrix<T> &matrix, const int blocks_x, const int blocks_y) {
    const int total_rows = matrix.getRows();
    const int total_cols = matrix.getCols();

    // Создаем блочную матрицу
    BlockMatrix<T> block_matrix(blocks_x, blocks_y);

    // Определяем размеры блоков
    const int block_rows = total_rows / blocks_x;
    const int block_cols = total_cols / blocks_y;
    const int remainder_rows = total_rows % blocks_x;
    const int remainder_cols = total_cols % blocks_y;

    int current_row = 0;
    for (int i = 0; i < blocks_x; i++) {
        // Определяем количество строк в текущем блоке
        int current_block_rows = block_rows;
        if (i < remainder_rows) {
            current_block_rows++;
        }

        int current_col = 0;
        for (int j = 0; j < blocks_y; j++) {
            // Определяем количество столбцов в текущем блоке
            int current_block_cols = block_cols;
            if (j < remainder_cols) {
                current_block_cols++;
            }

            // Создаем блок и заполняем его данными из исходной матрицы
            Matrix<T> block(current_block_rows, current_block_cols);

            for (int br = 0; br < current_block_rows; br++) {
                for (int bc = 0; bc < current_block_cols; bc++) {
                    int source_row = current_row + br;
                    int source_col = current_col + bc;
                    if (source_row < total_rows && source_col < total_cols) {
                        block[br][bc] = matrix[source_row][source_col];
                    } else {
                        block[br][bc] = 0;
                    }
                }
            }

            // Добавляем блок в блочную матрицу
            block_matrix.fillBlock(block, i, j);

            current_col += current_block_cols;
        }
        current_row += current_block_rows;
    }

    return block_matrix;
}


#endif //LB3_BLOCKMATRIX_H
