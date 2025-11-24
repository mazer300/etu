cmake_minimum_required(VERSION 3.10)
project(Tukalkin_Vladimir_lb2)

set(CMAKE_CXX_STANDARD 20)


add_executable(Tukalkin_Vladimir_lb2
        src/main.cpp
        include/IThreadSafeList.h
        include/Node.h
        include/RoughBlockingList.h
        include/ThinBlockingList.h
        include/LockFreeList.h
        include/NodeWithLock.h
        include/LockFreeNode.h

)