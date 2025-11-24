#ifndef TUKALKIN_VLADIMIR_LB2_LOCKFREELIST_H
#define TUKALKIN_VLADIMIR_LB2_LOCKFREELIST_H

#include <atomic>
#include <stdexcept>
#include <iostream>
#include "IThreadSafeList.h"
#include "LockFreeNode.h"
#include "HazardPointer.h"

template<typename T>
class LockFreeList : public IThreadSafeList<T> {
private:
    struct HPGuard {
        int index;

        explicit HPGuard(int idx = 0) : index(idx) {
        }

        void protect(LockFreeNode<T> *ptr) {
            HazardPointer<LockFreeNode<T> >::acquire(ptr, index);
        }

        ~HPGuard() {
            HazardPointer<LockFreeNode<T> >::release(index);
        }

        // Запрещаем копирование
        HPGuard(const HPGuard &) = delete;

        HPGuard &operator=(const HPGuard &) = delete;
    };

public:
    LockFreeList() : head(nullptr) {
    }

    ~LockFreeList() override {
        // Соберём все узлы в вектор (чтобы иметь возможность удалить их и затем убрать из retired lists)
        std::vector<LockFreeNode<T> *> toDelete;
        LockFreeNode<T> *current = head.load(std::memory_order_relaxed);
        while (current) {
            toDelete.push_back(current);
            current = current->next.load(std::memory_order_relaxed);
        }

        // Удаляем узлы (владение списком — мы удаляем единожды)
        for (auto ptr: toDelete) {
            delete ptr;
        }

        // Удаляем те же указатели из retired lists всех потоков — чтобы scan() не удалил их повторно
        for (auto ptr: toDelete) {
            HazardPointer<LockFreeNode<T> >::removeFromAllRetired(ptr);
        }

        // Выполняем очистку retired списка текущего потока (если что-то осталось)
        HazardPointer<LockFreeNode<T> >::cleanup();
    }


    // Запрещаем копирование
    LockFreeList(const LockFreeList &) = delete;

    LockFreeList &operator=(const LockFreeList &) = delete;

    void insert(const T &value, size_t index) override {
        index = 0;

        // Для надежности поддерживаем только вставку в начало
        LockFreeNode<T> *newNode = new LockFreeNode(value);
        LockFreeNode<T> *oldHead = head.load(std::memory_order_acquire);

        do {
            newNode->next.store(oldHead, std::memory_order_relaxed);
        } while (!head.compare_exchange_weak(oldHead, newNode,
                                             std::memory_order_release,
                                             std::memory_order_acquire));
    }

    T pop(size_t index) override {
        // Поддерживаем только удаление из начала
        index = 0;
        HPGuard guard0(0), guard1(1);

        while (true) {
            LockFreeNode<T> *curr = head.load(std::memory_order_acquire);
            if (!curr) {
                throw std::runtime_error("Cannot pop from empty list");
            }

            guard0.protect(curr);

            // Проверяем, что head не изменился
            if (head.load(std::memory_order_acquire) != curr) {
                continue;
            }

            LockFreeNode<T> *next = curr->next.load(std::memory_order_acquire);
            guard1.protect(next);

            if (head.compare_exchange_strong(curr, next,
                                             std::memory_order_release,
                                             std::memory_order_acquire)) {
                T value = curr->data;
                HazardPointer<LockFreeNode<T> >::retire(curr);
                return value;
            }
        }
    }

    size_t find(const T &value) const override {
        // Для find используем optimistic подход
        LockFreeNode<T> *current = head.load(std::memory_order_acquire);
        size_t index = 0;

        while (current) {
            if (current->data == value) {
                return index;
            }
            current = current->next.load(std::memory_order_acquire);
            index++;
        }

        return index;
    }

    [[nodiscard]] bool isEmpty() const override {
        return head.load(std::memory_order_acquire) == nullptr;
    }

    [[nodiscard]] size_t size() const override {
        size_t count = 0;
        LockFreeNode<T> *current = head.load(std::memory_order_acquire);
        while (current) {
            count++;
            current = current->next.load(std::memory_order_acquire);
        }
        return count;
    }

    void print() {
        LockFreeNode<T> *current = head.load(std::memory_order_acquire);
        while (current) {
            std::cout << current->data << " ";
            current = current->next.load(std::memory_order_acquire);
        }
        std::cout << std::endl;
    }

    // Очистка retired pointers (вызывать периодически)
    static void cleanup() {
        HazardPointer<LockFreeNode<T> >::cleanup();
    }

private:
    std::atomic<LockFreeNode<T> *> head;
};

#endif // TUKALKIN_VLADIMIR_LB2_LOCKFREELIST_H
