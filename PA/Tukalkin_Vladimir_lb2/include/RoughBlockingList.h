#ifndef TUKALKIN_VLADIMIR_LB2_ROUGHBLOCKINGLIST_H
#define TUKALKIN_VLADIMIR_LB2_ROUGHBLOCKINGLIST_H

#include <iostream>
#include <mutex>
#include <stdexcept>
#include "IThreadSafeList.h"
#include "Node.h"

template<typename T>
class RoughBlockingList : public IThreadSafeList<T> {
public:
    RoughBlockingList() : head(nullptr), length(0) {}

    ~RoughBlockingList() override {
        std::lock_guard<std::mutex> lock(mtx);
        Node<T> *current = head;
        while (current) {
            Node<T> *next = current->next;
            delete current;
            current = next;
        }
    }

    void insert(const T &value, size_t index) override {
        std::lock_guard<std::mutex> lock(mtx);

        if (index > length) {
            index = length;
        }

        Node<T> *node = new Node(value);

        // Если голова пустая
        if (!head) {
            head = node;
            length = 1;
            return;
        }

        // Вставка в начало
        if (index == 0) {
            node->next = head;
            head = node;
            length++;
            return;
        }

        // Вставка в середину и конец
        Node<T> *current = head;
        for (size_t i = 0; i < index - 1; ++i) {
            current = current->next;
        }

        node->next = current->next;
        current->next = node;
        length++;
    }

    T pop(size_t index) override {
        std::lock_guard<std::mutex> lock(mtx);

        if (!head) throw std::runtime_error("Нельзя удалять в пустом списке\n");

        if (index >= length) {
            index = length - 1;
        }

        T value;
        Node<T>* toDelete = nullptr;

        if (index == 0) {
            // Удаление из начала
            toDelete = head;
            value = head->data;
            head = head->next;
        } else {
            // Удаление из середины или конца
            Node<T>* current = head;
            for (size_t i = 0; i < index - 1; ++i) {
                current = current->next;
            }
            toDelete = current->next;
            value = toDelete->data;
            current->next = toDelete->next;
        }

        delete toDelete;
        length--;
        return value;
    }

    size_t find(const T &value) const override {
        std::lock_guard<std::mutex> lock(mtx);

        Node<T> *current = head;
        size_t index = 0;
        while (current) {
            if (current->data == value) {
                return index;
            }
            current = current->next;
            index++;
        }

        // Элемент не найден
        return length;
    }

    bool isEmpty() const override {
        std::lock_guard<std::mutex> lock(mtx);
        return length == 0;
    }

    size_t size() const override {
        std::lock_guard<std::mutex> lock(mtx);
        return length;
    }

    void print() {
        std::lock_guard<std::mutex> lock(mtx);
        if (!head || length == 0) {
            std::cout << "nullptr\n";
            return;
        }
        Node<T> *current = head;
        while (current) {
            std::cout << current->data << " ";
            current = current->next;
        }
        std::cout << '\n';
    }

private:
    Node<T> *head;
    mutable std::mutex mtx;
    size_t length;
};


#endif //TUKALKIN_VLADIMIR_LB2_ROUGHBLOCKINGLIST_H
