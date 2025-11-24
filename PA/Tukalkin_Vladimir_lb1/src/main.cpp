#include <iostream>
#include <vector>
#include <chrono>
#include <cmath>
#include <windows.h>
#include "../include/BlockMatrix.h"


// Преобразование простой матрицы в блочную матрицу
BlockMatrix matrixToBlockMatrix(Matrix &matrix, int blocks_x, int blocks_y) {
    int total_rows = matrix.getRows();
    int total_cols = matrix.getCols();

    // Создаем блочную матрицу
    BlockMatrix block_matrix(blocks_x, blocks_y);

    // Определяем размеры блоков
    int block_rows = total_rows / blocks_x;
    int block_cols = total_cols / blocks_y;
    int remainder_rows = total_rows % blocks_x;
    int remainder_cols = total_cols % blocks_y;

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
            Matrix block(current_block_rows, current_block_cols);

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

double metricTime(std::function<void()> func) {
    auto start = std::chrono::steady_clock::now();
    func();
    auto end = std::chrono::steady_clock::now();
    std::chrono::duration<double> elapsed = end - start;
    return elapsed.count();
}

// Функция, которая считает размеры блоков
std::pair<int, int> calculateBlockDimensions(int matrix_size) {
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

void checkCorrect() {
    Matrix a(10, 100);
    Matrix b(100, 100);

    a.fillRandom();
    //Sleep(5000);
    b.fillRandom();

    Matrix c = a * b;

    BlockMatrix common_c = matrixToBlockMatrix(c, 2, 2);
    BlockMatrix mat_a = matrixToBlockMatrix(a, 2, 2);
    BlockMatrix mat_b = matrixToBlockMatrix(b, 2, 2);
    BlockMatrix consistent_c = mat_a * mat_b;
    BlockMatrix parallel_c = mat_a.parallelMultiply(mat_b, 4);
    BlockMatrix async_c = mat_a.asyncMultiply(mat_b, 4);

    assert(common_c == consistent_c);
    assert(consistent_c == parallel_c);
    assert(parallel_c == async_c);
    std::cout << "Все методы методы умножения корректны\n";
}

void benchmark(std::vector<int> numbers_threads, std::vector<int> sizes) {
    std::vector<double> common_times;
    std::vector<double> consistent_times;
    std::vector< std::vector<double>> parallel_times;
    std::vector< std::vector<double>> async_times;

    for (int size: sizes) {
        // Инициализация и заполнение матриц
        Matrix a(size, size);
        Matrix b(size, size);
        a.fillRandom();
        b.fillRandom();

        // Расчёт размеров блоков для блоччных матриц
        auto [x, y] = calculateBlockDimensions(size);

        // Инициализация и заполнение блочных матриц
        BlockMatrix block_a = matrixToBlockMatrix(a, x, y);
        BlockMatrix block_b = matrixToBlockMatrix(b, y, x);
        block_a.fillRandom();
        block_b.fillRandom();


        common_times.emplace_back(metricTime([&]() { a * b; }));
        consistent_times.emplace_back(metricTime([&]() { block_a * block_b; }));


        std::vector<double> tmp_p;
        std::vector<double> tmp_a;
        for (int number_thread: numbers_threads) {
            tmp_p.emplace_back(metricTime([&]() { block_a.parallelMultiply(block_b, number_thread); }));
            tmp_a.emplace_back(metricTime([&]() { block_a.asyncMultiply(block_b, number_thread); }));
        }
        parallel_times.emplace_back(tmp_p);
        async_times.emplace_back(tmp_a);
    }


    // Вывод замеров для обычного умножения матриц
    std::cout << "\nСкорость обычного умножения матриц\n";
    std::cout<<"Размер ";
    for(int size: sizes){
        std::cout<<size<<"      ";
    }
    std::cout<<"\n";
    std::cout<<"Время  ";
    for(double time: common_times){
        std::cout<<time<<" ";
    }
    std::cout << "\n\n";


    // Вывод замеров для последовательного умножения блочных матриц
    std::cout << "\nСкорость последовательного умножения блочных матриц\n";
    std::cout<<"Размер ";
    for(int size: sizes){
        std::cout<<size<<"      ";
    }
    std::cout<<"\n";
    std::cout<<"Время  ";
    for(double time: consistent_times){
        std::cout<<time<<" ";
    }
    std::cout << "\n\n";


    // Вывод замеров для параллельного умножения блочных матриц
    std::cout << "\nСкорость параллельного умножения блочных матриц\n";
    std::cout<<"Потоки ";
    for(int number_thread: numbers_threads){
        std::cout<<number_thread<<"      ";
    }
    std::cout<<"\n";
    std::cout<<"Время\n";
    for(int i=0;i<sizes.size();i++){
        std::cout<<sizes[i]<<" ";
        for(double time: parallel_times[i]){
            std::cout<<time<<" ";
        }
        std::cout << '\n';
    }
    std::cout << '\n';

    // Вывод замеров для асинхронного умножения блочных матриц
    std::cout << "\nСкорость асинхронного умножения блочных матриц\n";
    std::cout<<"Потоки ";
    for(int number_thread: numbers_threads){
        std::cout<<number_thread<<"      ";
    }
    std::cout<<"\n";
    std::cout<<"Время\n";
    for(int i=0;i<sizes.size();i++){
        std::cout<<sizes[i]<<" ";
        for(double time: async_times[i]){
            std::cout<<time<<" ";
        }
        std::cout << '\n';
    }
    std::cout << '\n';

}


int main() {
    SetConsoleOutputCP(CP_UTF8); // Устанавливаем UTF-8 для вывода
    checkCorrect();

//    std::vector<int> numbers_threads = {32};

    std::vector<int> numbers_threads;
    for(int i=1;i<=32;i++){
        numbers_threads.emplace_back(i);
    }

//    std::vector<int> sizes = {100,110,120,125,130,140,150,160,170,175,180,190,200};
    std::vector<int> sizes = {1000,1024,1100,1200,1250,1300,1400,1500,1600,1700,1750,1800,1900,2000,2048};
    benchmark(numbers_threads, sizes);
    return 0;
}
