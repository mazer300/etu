#ifndef MERGESORT_H
#define MERGESORT_H

#include <algorithm>
#include <vector>
#include <thread>

// Слияние для сортировки
template<typename T>
void merge(std::vector<T> &a, const size_t left, const size_t mid, const size_t right) {
    size_t it1 = 0;
    size_t it2 = 0;
    std::vector<T> result(right - left);

    while (left + it1 < mid and mid + it2 < right) {
        if (a[left + it1] < a[mid + it2]) {
            result[it1 + it2] = a[left + it1];
            it1++;
        } else {
            result[it1 + it2] = a[mid + it2];
            it2++;
        }
    }

    while (left + it1 < mid) {
        result[it1 + it2] = a[left + it1];
        it1++;
    }

    while (mid + it2 < right) {
        result[it1 + it2] = a[mid + it2];
        it2++;
    }

    for (size_t i = 0; i < it1 + it2; i++) {
        a[left + i] = result[i];
    }
}

// Сортировка слиянием последовательно
template<typename T>
void sequenceMergeSort(std::vector<T> &a) {
    const size_t n = a.size();
    if (n <= 1) return;
    for (size_t block_size = 1; block_size < n; block_size *= 2) {
        for (size_t start = 0; start < n - block_size; start += 2 * block_size) {
            merge(a, start, start + block_size, std::min(start + 2 * block_size, n));
        }
    }
}

// Сортировка слиянием параллельно
template<typename T>
void parallelMergeSort(std::vector<T> &a, const size_t num_threads = 1) {
    const size_t n = a.size();

    // Краевые случаи
    if (n <= 1) return;
    if (num_threads <= 1 || n <= 20000) {
        sequenceMergeSort(a);
        return;
    }

    for (size_t block_size = 1; block_size < n; block_size *= 2) {
        const size_t num_merges = (n + 2 * block_size - 1) / (2 * block_size);

        // Параллельно, если много блоков для сортировки
        if (num_merges >= num_threads) {
            std::vector<std::thread> threads;
            size_t operation_per_thread = (num_merges + num_threads - 1) / num_threads;

            auto worker = [&](const size_t thread_id) {
                const size_t start_index = thread_id * operation_per_thread;
                const size_t end_index = std::min(start_index + operation_per_thread, num_merges);

                for (size_t i = start_index; i < end_index; i++) {
                    const size_t start = i * 2 * block_size;
                    const size_t mid = std::min(start + block_size, n);
                    const size_t end = std::min(mid + 2 * block_size, n);

                    if (mid < end) {
                        merge(a, start, mid, end);
                    }
                }
            };

            for (size_t i = 0; i < num_threads; i++) {
                threads.emplace_back(std::thread(worker, i));
            }

            for (auto &thread: threads) {
                thread.join();
            }
        // Последовательно, когда недостаточно блоков
        } else {
            for (size_t start = 0; start < n - block_size; start += 2 * block_size) {
                merge(a, start, start + block_size, std::min(start + 2 * block_size, n));
            }
        }
    }
}


#endif //MERGESORT_H
