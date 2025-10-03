#ifndef TUKALKIN_VLADIMIR_LB2_NODE_H
#define TUKALKIN_VLADIMIR_LB2_NODE_H

template<typename T>
class Node {
public:
    T data;
    Node<T> *next;

    explicit Node(const T &data) : data(data), next(nullptr) {}
};

#endif //TUKALKIN_VLADIMIR_LB2_NODE_H
