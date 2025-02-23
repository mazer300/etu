#ifndef SHOOTINGABILITYFACTORY_H
#define SHOOTINGABILITYFACTORY_H

#include "IAbilityFactory.h"
#include "ShootingAbility.h"

class ShootingAbilityFactory : public IAbilityFactory {
public:
    std::shared_ptr<IAbility> createAbility() override;
};

#endif // SHOOTINGABILITYFACTORY_H