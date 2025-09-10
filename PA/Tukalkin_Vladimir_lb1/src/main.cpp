#include <iostream>
#include <vector>
#include <random>


class Matrix {
public:
    Matrix(int const rows, int const cols) {
        this->rows = rows;
        this->cols = cols;
        for (int i = 0; i < rows; i++) {
            std::vector<int> tmp(cols, 0);
            matrix.emplace_back(tmp);
        }
    }

    // Вывод матрицы в консоль
    void print() const {
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                std::cout << matrix[i][j] << " ";
            }
            std::cout << '\n';
        }
    }

    ~Matrix() = default;

    // Заполнение матрицы случайными значениями [-100, 100]
    void fillRandom(){
        std::random_device rd;
        std::mt19937 mt1(rd());
        std::uniform_int_distribution<int> dist(-100,100);
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                matrix[i][j]=dist(mt1);
            }
        }
    }

    void fillMatrix(std::vector<std::vector<int>> const &data) {
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                matrix[i][j] = data[i][j];
            }
        }
    }

    [[nodiscard]] int getRows() const {
        return rows;
    }
    [[nodiscard]] int getCols() const {
        return cols;
    }

    std::vector<int>& operator[](size_t const index) {
        return matrix[index];
    }

private:
    int rows;
    int cols;
    std::vector<std::vector<int> > matrix;
};

Matrix commonMultiply(Matrix &a, Matrix &b) {
    Matrix c(a.getRows(),b.getCols());

    for (int i = 0; i < a.getRows(); i++) {
        for (int j = 0; j < b.getCols(); j++) {
            int sum = 0;
            for (int k = 0; k < a.getCols(); k++) {
                sum+=a[i][k]*b[k][j];
            }
            c[i][j]=sum;
        }
    }



    return c;
}


int main() {
    Matrix a(4, 2);
    Matrix b(2, 4);

    std::vector<std::vector<int>> const data1 = {{1,2},{3,4},{5,6},{7,8}};
    std::vector<std::vector<int>> const data2={{1,0,1,0},{0,1,0,1}};

    a.fillMatrix(data1);
    b.fillMatrix(data2);

    commonMultiply(a,b).print();
    return 0;
}
