cmake_minimum_required(VERSION 3.31)
project(lb3)

set(CMAKE_CXX_STANDARD 20)

add_executable(lb3 main.cpp
        Matrix.h
        MergeSort.h
        StrassenAlgorithm.h
        BlockMatrix.h
)
