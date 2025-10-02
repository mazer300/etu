cmake_minimum_required(VERSION 3.10)
project(Tukalkin_Vladimir_lb1)

set(CMAKE_CXX_STANDARD 20)


add_executable(Tukalkin_Vladimir_lb1
        src/main.cpp
        include/Matrix.h
        src/Matrix.cpp
        include/BlockMatrix.h
        src/BlockMatrix.cpp
)