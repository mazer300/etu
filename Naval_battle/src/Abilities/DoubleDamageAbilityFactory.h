#ifndef DOUBLEDAMAGEABILITYFACTORY_H
#define DOUBLEDAMAGEABILITYFACTORY_H

#include "IAbilityFactory.h"
#include "DoubleDamageAbility.h"

class DoubleDamageAbilityFactory : public IAbilityFactory {
public:
    std::shared_ptr<IAbility> createAbility() override;
};

#endif // DOUBLEDAMAGEABILITYFACTORY_H