#ifndef SCANNERABILITYFACTORY_H
#define SCANNERABILITYFACTORY_H

#include "IAbilityFactory.h"
#include "ScannerAbility.h"

class ScannerAbilityFactory : public IAbilityFactory {
public:
    std::shared_ptr<IAbility> createAbility() override;
};

#endif // SCANNERABILITYFACTORY_H