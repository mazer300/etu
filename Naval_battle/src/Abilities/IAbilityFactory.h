#ifndef IABILITYFACTORY_H
#define IABILITYFACTORY_H

#include "IAbility.h"
#include <memory>

class IAbilityFactory {
public:
    virtual ~IAbilityFactory() = default;
    virtual std::shared_ptr<IAbility> createAbility() = 0;
};

#endif // IABILITYFACTORY_H