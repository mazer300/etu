#ifndef TUKALKIN_VLADIMIR_LB2_THINBLOCKINGLIST_H
#define TUKALKIN_VLADIMIR_LB2_THINBLOCKINGLIST_H

#include <stdexcept>
#include <iostream>
#include <mutex>
#include "IThreadSafeList.h"
#include "NodeWithLock.h"

template<typename T>
class ThinBlockingList : public IThreadSafeList<T> {
public:
    ThinBlockingList() : head(nullptr), length(0) {}

    ~ThinBlockingList() override {
        NodeWithLock<T>* current = head;
        while (current) {
            NodeWithLock<T>* next = current->next;
            delete current;
            current = next;
        }
        head = nullptr;
        length = 0;
    }

    void insert(const T &value, size_t index) override {
        if (index > length) {
            index = length;
        }

        NodeWithLock<T>* newNode = new NodeWithLock(value);

        // Вставка в пустой список
        if (index == 0) {
            std::lock_guard<std::mutex> lock(newNode->mtx);
            if (head) {
                std::lock_guard<std::mutex> headLock(head->mtx);
                newNode->next = head;
            }
            head = newNode;
            length++;
            return;
        }

        // Вставка не в начало
        NodeWithLock<T>* prev = nullptr;
        NodeWithLock<T>* curr = head;

        // Блокируем голову
        curr->mtx.lock();

        try {
            // Идем до нужной позиции
            for (size_t i = 0; i < index - 1 && curr->next; ++i) {
                if (prev) {
                    prev->mtx.unlock();
                }

                prev = curr;
                curr = curr->next;
                curr->mtx.lock();
            }

            // Вставляем новый узел
            std::lock_guard<std::mutex> newNodeLock(newNode->mtx);
            newNode->next = curr->next;
            curr->next = newNode;
            length++;

        } catch (...) {
            // Всегда разблокируем
            if (prev) prev->mtx.unlock();
            curr->mtx.unlock();
            delete newNode;
            throw;
        }

        // Разблокируем
        if (prev) prev->mtx.unlock();
        curr->mtx.unlock();
    }

    T pop(size_t index) override {
        if (length == 0 || !head) {
            throw std::runtime_error("Cannot pop from empty list");
        }

        if (index >= length) {
            index = length - 1;
        }

        // Удаление из начала
        if (index == 0) {
            // Блокируем голову
            std::unique_lock<std::mutex> headLock(head->mtx);

            NodeWithLock<T>* toDelete = head;
            T value = head->data;

            // Если есть следующий элемент, блокируем его тоже
            if (head->next) {
                std::unique_lock<std::mutex> nextLock(head->next->mtx);
                head = head->next;
            } else {
                head = nullptr;
            }

            // Разблокируем перед удалением
            headLock.unlock();

            delete toDelete;
            length--;
            return value;
        }

        // Удаление из середины или конца
        NodeWithLock<T>* prev = nullptr;
        NodeWithLock<T>* curr = head;

        // Блокируем голову
        curr->mtx.lock();

        try {
            // Идем до нужной позиции
            // Мы хотим найти узел для удаления (curr) и его предыдущий (prev)
            for (size_t i = 0; i < index; ++i) {
                if (prev) {
                    prev->mtx.unlock();
                }

                prev = curr;
                curr = curr->next;

                if (!curr) {
                    throw std::runtime_error("Invalid index during pop");
                }
                curr->mtx.lock();
            }

            // Теперь:
            // prev - узел перед удаляемым (заблокирован)
            // curr - удаляемый узел (заблокирован)

            T value = curr->data;

            // Обновляем связи
            if (curr->next) {
                // Блокируем следующий узел
                std::unique_lock<std::mutex> nextLock(curr->next->mtx);
                prev->next = curr->next;
            } else {
                prev->next = nullptr;
            }

            length--;

            // Разблокируем перед удалением
            curr->mtx.unlock();
            delete curr;

            // Разблокируем prev
            prev->mtx.unlock();

            return value;

        } catch (...) {
            // Всегда разблокируем в случае исключения
            if (prev) prev->mtx.unlock();
            if (curr) curr->mtx.unlock();
            throw;
        }
    }

    size_t find(const T &value) const override {
        // Для константного метода не используем блокировки
        const NodeWithLock<T>* current = head;
        size_t index = 0;

        while (current) {
            if (current->data == value) {
                return index;
            }
            current = current->next;
            index++;
        }

        return length;
    }

    [[nodiscard]] bool isEmpty() const override {
        return length == 0;
    }

    [[nodiscard]] size_t size() const override {
        return length;
    }

    NodeWithLock<T> getHead(){
        return head;
    }


    void print() {
        if (!head) {
            std::cout << "nullptr" << std::endl;
            return;
        }

        // Для печати используем простой обход без блокировок
        const NodeWithLock<T>* current = head;
        while (current) {
            std::cout << current->data<<" ";
            current = current->next;
        }
        std::cout << '\n';
    }

private:
    NodeWithLock<T>* head;
    size_t length;
};

#endif // TUKALKIN_VLADIMIR_LB2_THINBLOCKINGLIST_H