#ifndef TUKALKIN_VLADIMIR_LB2_HAZARDPOINTER_H
#define TUKALKIN_VLADIMIR_LB2_HAZARDPOINTER_H

#include <atomic>
#include <vector>
#include <thread>
#include <algorithm>
#include <mutex>
#include <unordered_set>
#include <unordered_map>
#include <stdexcept>

template<typename T>
class HazardPointer {
private:
    static const int MAX_THREADS = 256;
    static const int HP_PER_THREAD = 2;

    struct alignas(64) HazardRecord {
        std::atomic<T *> pointer;

        HazardRecord() : pointer(nullptr) {
        }
    };

    // Записываем записи hazard pointers
    static std::vector<HazardRecord> records;

    // Для каждого возможного thread-index — список retired указателей и mutex для него
    static std::vector<std::vector<T *> > retiredList;
    static std::vector<std::mutex> retiredMutexes;

    // Регистрация потоков
    static std::mutex regMutex;
    static std::unordered_map<std::thread::id, int> threadIndexMap;
    static std::atomic<int> nextIndex;

public:
    static void acquire(T *ptr, int hpIndex = 0) {
        if (!ptr) return;
        int idx = getThreadIndex() * HP_PER_THREAD + hpIndex;
        records[idx].pointer.store(ptr, std::memory_order_release);
    }

    static void release(int hpIndex = 0) {
        int idx = getThreadIndex() * HP_PER_THREAD + hpIndex;
        records[idx].pointer.store(nullptr, std::memory_order_release);
    }

    static void retire(T *ptr) {
        if (!ptr) return;
        int threadId = getThreadIndex();
        {
            std::lock_guard<std::mutex> lk(retiredMutexes[threadId]);
            retiredList[threadId].push_back(ptr);
        }

        // Порог для запуска scan — можно варьировать
        if (retiredList[threadId].size() >= 10) {
            scan(threadId);
        }
    }

    // Очистка retired списка текущего потока (вызывать в деструкторе / по требованию)
    static void cleanup() {
        int threadId = getThreadIndex();
        scan(threadId);
    }

    // Безопасно удалить указатель из всех retiredList (используется, например, из деструктора списка)
    static void removeFromAllRetired(T *ptr) {
        if (!ptr) return;
        for (int i = 0; i < (int) retiredList.size(); ++i) {
            std::lock_guard<std::mutex> lk(retiredMutexes[i]);
            auto &rl = retiredList[i];
            // удаляем все вхождения ptr
            rl.erase(std::remove(rl.begin(), rl.end(), ptr), rl.end());
        }
    }

private:
    static int getThreadIndex() {
        thread_local int id = -1;
        if (id != -1) return id;

        std::lock_guard<std::mutex> lk(regMutex);
        std::thread::id tid = std::this_thread::get_id();
        auto it = threadIndexMap.find(tid);
        if (it != threadIndexMap.end()) {
            id = it->second;
            return id;
        }

        int assigned = nextIndex.fetch_add(1, std::memory_order_relaxed);
        if (assigned >= MAX_THREADS) {
            nextIndex.fetch_sub(1, std::memory_order_relaxed);
            throw std::runtime_error("Too many threads for hazard pointers (increase MAX_THREADS)");
        }
        threadIndexMap[tid] = assigned;
        id = assigned;
        return id;
    }

    // Сканируем retiredList[threadId] и удаляем те узлы, которых нет в active set
    static void scan(int threadId) {
        // Сбор активных указателей
        std::unordered_set<T *> activePointers;
        activePointers.reserve(records.size());
        for (size_t i = 0; i < records.size(); ++i) {
            T *p = records[i].pointer.load(std::memory_order_acquire);
            if (p != nullptr) activePointers.insert(p);
        }

        // Работаем с локальной копией retired (под mutex)
        std::lock_guard<std::mutex> lk(retiredMutexes[threadId]);
        auto &retired = retiredList[threadId];
        size_t writePos = 0;
        for (size_t i = 0; i < retired.size(); ++i) {
            T *p = retired[i];
            if (activePointers.find(p) == activePointers.end()) {
                // никто не защищает — безопасно удаляем
                delete p;
            } else {
                // оставляем в retired
                retired[writePos++] = p;
            }
        }
        retired.resize(writePos);
    }
};

// Определение статических членов
template<typename T>
std::vector<typename HazardPointer<T>::HazardRecord> HazardPointer<T>::records(
    HazardPointer<T>::MAX_THREADS * HazardPointer<T>::HP_PER_THREAD);

template<typename T>
std::vector<std::vector<T *> > HazardPointer<T>::retiredList(HazardPointer<T>::MAX_THREADS);

template<typename T>
std::vector<std::mutex> HazardPointer<T>::retiredMutexes(HazardPointer<T>::MAX_THREADS);

template<typename T>
std::mutex HazardPointer<T>::regMutex;

template<typename T>
std::unordered_map<std::thread::id, int> HazardPointer<T>::threadIndexMap;

template<typename T>
std::atomic<int> HazardPointer<T>::nextIndex{0};

#endif // TUKALKIN_VLADIMIR_LB2_HAZARDPOINTER_H
