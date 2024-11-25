#ifndef IABILITY_H
#define IABILITY_H

#include <string>
#include "GameField.h"
#include "InfoHolder.h"

class IAbility{
public:
    virtual ~IAbility() = default;
    virtual void apply(InfoHolder& info) = 0;
};

#endif // IABILITY_H