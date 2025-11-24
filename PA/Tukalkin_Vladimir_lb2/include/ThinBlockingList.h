#ifndef TUKALKIN_VLADIMIR_LB2_THINBLOCKINGLIST_H
#define TUKALKIN_VLADIMIR_LB2_THINBLOCKINGLIST_H

#include <stdexcept>
#include <iostream>
#include <mutex>
#include <atomic>
#include <memory>
#include "IThreadSafeList.h"
#include "NodeWithLock.h"

template<typename T>
class ThinBlockingList : public IThreadSafeList<T> {
public:
    ThinBlockingList() : head(nullptr), length(0) {}

    ~ThinBlockingList() override {
        std::lock_guard<std::mutex> lock(headMutex);
        NodeWithLock<T>* current = head;
        while (current) {
            NodeWithLock<T>* next = current->next;
            delete current;
            current = next;
        }
        head = nullptr;
        length.store(0, std::memory_order_relaxed);
    }

    void insert(const T &value, size_t index) override {
        // ограничиваем индекс
        size_t len = length.load(std::memory_order_acquire);
        if (index > len) index = len;

        NodeWithLock<T>* newNode = new NodeWithLock<T>(value);

        // Синхронизируем изменение head/length с помощью headMutex.
        std::lock_guard<std::mutex> listLock(headMutex);

        // вставка в начало
        if (index == 0) {
            if (head) {
                // блокируем старую голову, чтобы корректно поменять next
                std::lock_guard<std::mutex> headLock(head->mtx);
                newNode->next = head;
            } else {
                newNode->next = nullptr;
            }
            head = newNode;
            length.fetch_add(1, std::memory_order_release);
            return;
        }

        // вставка не в начало: последовательно пробегаем список, используя блокировку текущего узла
        NodeWithLock<T>* prev = nullptr;
        NodeWithLock<T>* curr = head;
        if (!curr) {
            // Если вдруг пустой (index>0 и length==0) — вставим в голову
            head = newNode;
            length.fetch_add(1, std::memory_order_release);
            return;
        }

        // Захватим curr прежде чем двигаться
        curr->mtx.lock();
        try {
            // Переходим до позиции index-1 (prev = узел перед местом вставки)
            for (size_t i = 0; i < index - 1; ++i) {
                if (curr->next == nullptr) break;

                // переходим вперед: разблокируем prev, сдвигаем prev<-curr, curr<-curr->next (и блокируем новый curr)
                if (prev) prev->mtx.unlock();
                prev = curr;
                curr = curr->next;
                curr->mtx.lock();
            }

            // Теперь curr — узел на позиции index-1
            // Блокируем newNode (необязательно, он у нас приватный), для однородности:
            std::lock_guard<std::mutex> newNodeLock(newNode->mtx);
            newNode->next = curr->next;
            curr->next = newNode;
            length.fetch_add(1, std::memory_order_release);

            // Разблокируем curr и prev
            if (prev) prev->mtx.unlock();
            curr->mtx.unlock();
            return;
        } catch (...) {
            // на всякий случай — гарантия разблокировок
            if (curr) curr->mtx.unlock();
            if (prev) prev->mtx.unlock();
            delete newNode;
            throw;
        }
    }

    T pop(size_t index) override {
        size_t len = length.load(std::memory_order_acquire);
        if (len == 0 || !head) {
            throw std::runtime_error("Cannot pop from empty list");
        }

        if (index >= len) index = len - 1;

        // Синхронизируем модификацию head/length
        std::lock_guard<std::mutex> listLock(headMutex);

        // новая длина может быть изменена конкурентно, поэтому пересчитываем локально
        len = length.load(std::memory_order_acquire);
        if (len == 0 || !head) {
            throw std::runtime_error("Cannot pop from empty list");
        }
        if (index >= len) index = len - 1;

        // Удаление из начала
        if (index == 0) {
            // Блокируем старую голову, а также её следующий узел (если есть) последовательно
            NodeWithLock<T>* toDelete = head;
            std::unique_lock<std::mutex> lockToDelete(toDelete->mtx);

            if (toDelete->next) {
                // блокируем новый head перед присваиванием
                std::unique_lock<std::mutex> lockNext(toDelete->next->mtx);
                head = toDelete->next;
                // освобождаем lockNext при выходе из блока (он уничтожится)
            } else {
                head = nullptr;
            }

            T value = toDelete->data;
            lockToDelete.unlock();
            delete toDelete;
            length.fetch_sub(1, std::memory_order_release);
            return value;
        }

        // Удаление из середины/конца
        NodeWithLock<T>* prev = nullptr;
        NodeWithLock<T>* curr = head;

        // блокируем curr (голову)
        curr->mtx.lock();
        try {
            // перемещаемся до удаляемого узла (curr будет удаляемым)
            for (size_t i = 0; i < index; ++i) {
                if (prev) prev->mtx.unlock();
                prev = curr;
                curr = curr->next;
                if (!curr) {
                    // некорректный индекс — разблокируем и бросим ошибку
                    if (prev) prev->mtx.unlock();
                    throw std::runtime_error("Invalid index during pop");
                }
                curr->mtx.lock();
            }

            // prev — заблокирован (узел перед удаляемым), curr — заблокирован (удаляемый)
            T value = curr->data;
            if (curr->next) {
                // блокируем следующий узел, чтобы корректно перенаправить ссылку
                std::unique_lock<std::mutex> lockNext(curr->next->mtx);
                prev->next = curr->next;
                // lockNext будет разрушен тут же (после выхода), безопасно
            } else {
                prev->next = nullptr;
            }

            // уменьшаем длину
            length.fetch_sub(1, std::memory_order_release);

            // Разблокируем и удаляем curr
            curr->mtx.unlock();
            delete curr;

            // Разблокируем prev
            prev->mtx.unlock();

            return value;
        } catch (...) {
            if (curr) curr->mtx.unlock();
            if (prev) prev->mtx.unlock();
            throw;
        }
    }

    size_t find(const T &value) const override {
        if (!head) {
            return length.load(std::memory_order_acquire);
        }

        const NodeWithLock<T>* prev = nullptr;
        const NodeWithLock<T>* curr = head;

        // Захватываем мьютекс головы для чтения структуры списка
        std::unique_lock<std::mutex> headLock(headMutex);

        try {
            // Блокируем первый узел
            curr->mtx.lock();
            headLock.unlock(); // Можно отпустить headMutex после блокировки первого узла

            size_t index = 0;

            while (curr) {
                // Проверяем значение
                if (curr->data == value) {
                    curr->mtx.unlock();
                    if (prev) prev->mtx.unlock();
                    return index;
                }

                // Переходим к следующему узлу
                if (prev) {
                    prev->mtx.unlock();
                }
                prev = curr;
                curr = curr->next;

                if (curr) {
                    curr->mtx.lock();
                }
                ++index;
            }

            // Разблокируем последний узел если дошли до конца
            if (prev) {
                prev->mtx.unlock();
            }

        } catch (...) {
            // Гарантируем разблокировку в случае исключения
            if (curr) curr->mtx.unlock();
            if (prev) prev->mtx.unlock();
            throw;
        }

        return length.load(std::memory_order_acquire);
    }

    [[nodiscard]] bool isEmpty() const override {
        return length.load(std::memory_order_acquire) == 0;
    }

    [[nodiscard]] size_t size() const override {
        return length.load(std::memory_order_acquire);
    }

    void print() {
        const NodeWithLock<T>* current = head;
        if (!current) {
            std::cout << "nullptr\n";
            return;
        }
        while (current) {
            std::cout << current->data << " ";
            current = current->next;
        }
        std::cout << "\n";
    }

private:
    NodeWithLock<T>* head;
    std::atomic<size_t> length;
    mutable std::mutex headMutex; // защищает модификации head и length
};

#endif // TUKALKIN_VLADIMIR_LB2_THINBLOCKINGLIST_H
