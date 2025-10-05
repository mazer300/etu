#ifndef TUKALKIN_VLADIMIR_LB2_LOCKFREELIST_H
#define TUKALKIN_VLADIMIR_LB2_LOCKFREELIST_H

#include <stdexcept>
#include <iostream>
#include <atomic>
#include "IThreadSafeList.h"
#include "LockFreeNode.h"

template<typename T>
class LockFreeList : public IThreadSafeList<T> {
public:
    LockFreeList() : head(nullptr), length(0) {}

    ~LockFreeList() override {
        LockFreeNode<T>* current = head.load();
        while (current) {
            LockFreeNode<T>* next = current->next.load();
            delete current;
            current = next;
        }
    }

    void insert(const T &value, size_t index) override {
        LockFreeNode<T>* newNode = new LockFreeNode(value);
        size_t current_length = length.load(std::memory_order_acquire);

        if (index > current_length) {
            index = current_length;
        }

        // Вставка в пустой список
        if (!head.load(std::memory_order_acquire)) {
            LockFreeNode<T>* expected = nullptr;
            newNode->next.store(nullptr, std::memory_order_relaxed);

            while (!head.compare_exchange_weak(expected, newNode,
                                               std::memory_order_release,
                                               std::memory_order_acquire)) {
                newNode->next.store(expected, std::memory_order_relaxed);
            }
            length.fetch_add(1, std::memory_order_relaxed);
            return;
        }

        // Вставка в начало
        if (index == 0) {
            LockFreeNode<T>* expected = head.load(std::memory_order_acquire);
            newNode->next.store(expected, std::memory_order_relaxed);

            while (!head.compare_exchange_weak(expected, newNode,
                                               std::memory_order_release,
                                               std::memory_order_acquire)) {
                newNode->next.store(expected, std::memory_order_relaxed);
            }
            length.fetch_add(1, std::memory_order_relaxed);
            return;
        }

        // Вставка в середину или конец
        LockFreeNode<T>* prev = head.load(std::memory_order_acquire);
        for (size_t i = 0; i < index - 1 && prev; ++i) {
            prev = prev->next.load(std::memory_order_acquire);
        }

        if (!prev) {
            delete newNode;
            return;
        }

        LockFreeNode<T>* next = prev->next.load(std::memory_order_acquire);
        newNode->next.store(next, std::memory_order_relaxed);

        while (!prev->next.compare_exchange_weak(next, newNode,
                                                 std::memory_order_release,
                                                 std::memory_order_acquire)) {
            newNode->next.store(next, std::memory_order_relaxed);
        }

        length.fetch_add(1, std::memory_order_relaxed);
    }

    T pop(size_t index) override {
        size_t currentLength = length.load(std::memory_order_acquire);
        if (currentLength == 0) {
            throw std::runtime_error("Cannot pop from empty list");
        }

        if (index >= currentLength) {
            index = currentLength - 1;
        }

        // Удаление из начала
        if (index == 0) {
            LockFreeNode<T>* currentHead = head.load(std::memory_order_acquire);

            while (currentHead) {
                LockFreeNode<T>* next = currentHead->next.load(std::memory_order_acquire);

                if (head.compare_exchange_weak(currentHead, next,
                                               std::memory_order_release,
                                               std::memory_order_acquire)) {
                    T value = currentHead->data;
                    delete currentHead;
                    length.fetch_sub(1, std::memory_order_relaxed);
                    return value;
                }
                currentHead = head.load(std::memory_order_acquire);
            }
            throw std::runtime_error("Failed to pop from head");
        }

        // Удаление из середины или конца
        LockFreeNode<T>* prev = head.load(std::memory_order_acquire);
        for (size_t i = 0; i < index - 1 && prev; ++i) {
            prev = prev->next.load(std::memory_order_acquire);
        }

        if (!prev) {
            throw std::runtime_error("Invalid index during pop");
        }

        LockFreeNode<T>* toDelete = prev->next.load(std::memory_order_acquire);
        if (!toDelete) {
            throw std::runtime_error("Invalid index during pop");
        }

        LockFreeNode<T>* next = toDelete->next.load(std::memory_order_acquire);

        while (!prev->next.compare_exchange_weak(toDelete, next,
                                                 std::memory_order_release,
                                                 std::memory_order_acquire)) {
            toDelete = prev->next.load(std::memory_order_acquire);
            if (!toDelete) {
                throw std::runtime_error("Node already deleted");
            }
            next = toDelete->next.load(std::memory_order_acquire);
        }

        T value = toDelete->data;
        delete toDelete;
        length.fetch_sub(1, std::memory_order_relaxed);
        return value;
    }

    size_t find(const T &value) const override {
        LockFreeNode<T>* current = head.load(std::memory_order_acquire);
        size_t index = 0;

        while (current) {
            if (current->data == value) {
                return index;
            }
            current = current->next.load(std::memory_order_acquire);
            index++;
        }
        return length.load(std::memory_order_acquire);
    }

    [[nodiscard]] bool isEmpty() const override {
        return head.load(std::memory_order_acquire) == nullptr;
    }

    [[nodiscard]] size_t size() const override {
        return length.load(std::memory_order_acquire);
    }

    void print() {
        if (!head.load(std::memory_order_acquire) || length == 0) {
            std::cout << "nullptr\n";
            return;
        }
        LockFreeNode<T>* current = head.load(std::memory_order_acquire);
        while (current) {
            std::cout << current->data << " ";
            LockFreeNode<T>* next = current->next.load(std::memory_order_acquire);
            current = next;
        }
        std::cout << '\n';
    }

private:
    std::atomic<LockFreeNode<T>*> head;
    std::atomic<size_t> length;
};

#endif // TUKALKIN_VLADIMIR_LB2_LOCKFREELIST_H