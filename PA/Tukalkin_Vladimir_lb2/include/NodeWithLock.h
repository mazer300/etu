#ifndef TUKALKIN_VLADIMIR_LB2_NODEWITHLOCK_H
#define TUKALKIN_VLADIMIR_LB2_NODEWITHLOCK_H

#include <mutex>

template<typename T>
class NodeWithLock{
public:
    T data;
    NodeWithLock<T>* next;
    mutable std::mutex mtx;

    explicit NodeWithLock(const T& data) : data(data), next(nullptr) {}
};

#endif //TUKALKIN_VLADIMIR_LB2_NODEWITHLOCK_H
