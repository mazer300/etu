#include "../include/BlockMatrix.h"

BlockMatrix::BlockMatrix(int const rows, int const cols) {
    this->rows = rows;
    this->cols = cols;
    for (int i = 0; i < rows; i++) {
        std::vector<Matrix> tmp(cols, Matrix(0, 0));
        matrix.emplace_back(tmp);
    }
}

// Вывод матрицы в консоль
void BlockMatrix::print() {
    for (int block_row = 0; block_row < rows; block_row++) {
        // Печатаем все строки блоков в текущей строке блоков
        int max_block_rows = 0;
        for (int block_col = 0; block_col < cols; block_col++) {
            max_block_rows = std::max(max_block_rows, matrix[block_row][block_col].getRows());
        }

        for (int row_in_block = 0; row_in_block < max_block_rows; row_in_block++) {
            for (int block_col = 0; block_col < cols; block_col++) {
                Matrix &current_block = matrix[block_row][block_col];

                if (row_in_block < current_block.getRows()) {
                    for (int col_in_block = 0; col_in_block < current_block.getCols(); col_in_block++) {
                        std::cout << current_block[row_in_block][col_in_block] << " ";
                    }
                } else {
                    // Печатаем пробелы для выравнивания
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
                Matrix &current_block = matrix[block_row][block_col];
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

// Заполнение матрицы случайными значениями [-100, 100]
void BlockMatrix::fillRandom() {
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            Matrix tmp(matrix[i][j].getRows(), matrix[i][j].getCols());
            tmp.fillRandom();
            matrix[i][j] = tmp;
        }
    }
}

// Заполнения блочной матрицы
void BlockMatrix::fillMatrix(std::vector<std::vector<Matrix>> &data) {
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            matrix[i][j] = data[i][j];
        }
    }
}

// Заполнения определённого блока
void BlockMatrix::fillBlock(Matrix const &data, const int i, const int j) {
    matrix[i][j] = data;
}

std::vector<Matrix> &BlockMatrix::operator[](size_t const index) {
    return matrix[index];
}

bool BlockMatrix::operator==(BlockMatrix other) const {
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

// Последовательное умножение блочных матрикс
BlockMatrix BlockMatrix::operator*(BlockMatrix &other) {
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
BlockMatrix BlockMatrix::parallelMultiply(BlockMatrix &other, int num_threads) {
    assert(cols == other.rows);
    BlockMatrix c(rows, other.cols);

    std::vector<std::thread> threads;
    int total_blocks = rows * other.cols;
    int blocks_per_thread = (total_blocks + num_threads - 1) / num_threads;

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

// Ассинхронное умножение с использованием std::async
BlockMatrix BlockMatrix::asyncMultiply(BlockMatrix &other, int num_threads) {
    assert(cols == other.rows);
    BlockMatrix c(rows, other.cols);
    std::vector<std::future<void>> futures;
    int total_blocks = rows * other.cols;
    int blocks_per_thread = (total_blocks + num_threads - 1) / num_threads;

    for (int t = 0; t < num_threads; t++) {
        int start_block = t * blocks_per_thread;
        int end_block = std::min((t + 1) * blocks_per_thread, total_blocks);

        futures.push_back(std::async(std::launch::async, [this, &other, &c, start_block, end_block]() {
            for (int block_idx = start_block; block_idx < end_block; block_idx++) {
                int i = block_idx / other.cols;
                int j = block_idx % other.cols;
                multiplyBlock(*this, other, c, i, j);
            }
        }));
    }

    for (auto &future: futures) {
        future.get();
    }

    return c;
}

int BlockMatrix::getRows() const {
    return rows;
}

int BlockMatrix::getCols() const {
    return cols;
}

std::vector<std::vector<Matrix>> BlockMatrix::getData() {
    return matrix;
}

void BlockMatrix::multiplyBlock(BlockMatrix &a, BlockMatrix &b, BlockMatrix &c, int i, int j) {
    Matrix sum = Matrix(a[i][0].getRows(), b[0][j].getCols());
    for (int k = 0; k < a.getCols(); k++) {
        sum += a[i][k] * b[k][j];
    }
    c.fillBlock(sum, i, j);
}