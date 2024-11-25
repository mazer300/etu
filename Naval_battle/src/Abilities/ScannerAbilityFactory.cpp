#include "ScannerAbilityFactory.h"

std::shared_ptr<IAbility> ScannerAbilityFactory::createAbility(){
    return std::make_shared<ScannerAbility>();
}