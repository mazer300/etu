#ifndef TUKALKIN_VLADIMIR_LB2_LOCKFREENODE_H
#define TUKALKIN_VLADIMIR_LB2_LOCKFREENODE_H

#include <atomic>

template<typename T>
class LockFreeNode {
public:
    T data;
    std::atomic<LockFreeNode<T>*> next;

    LockFreeNode(const T& data) : data(data), next(nullptr) {}

    // Запрещаем копирование и присваивание
    LockFreeNode(const LockFreeNode&) = delete;
    LockFreeNode& operator=(const LockFreeNode&) = delete;
};

#endif //TUKALKIN_VLADIMIR_LB2_LOCKFREENODE_H
