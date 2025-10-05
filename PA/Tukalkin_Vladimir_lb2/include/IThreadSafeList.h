#ifndef TUKALKIN_VLADIMIR_LB2_ITHREADSAFELIST_H
#define TUKALKIN_VLADIMIR_LB2_ITHREADSAFELIST_H

#include <cstddef>

template<typename T>
class IThreadSafeList {
public:
    virtual ~IThreadSafeList() = default;

    virtual void insert(const T &value, size_t index) = 0;

    virtual T pop(size_t index) = 0;

    virtual size_t find(const T &value) const = 0;

    [[nodiscard]] virtual bool isEmpty() const = 0;

    [[nodiscard]] virtual size_t size() const = 0;
};

#endif //TUKALKIN_VLADIMIR_LB2_ITHREADSAFELIST_H
