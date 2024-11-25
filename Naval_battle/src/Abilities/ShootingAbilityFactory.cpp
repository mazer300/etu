#include "ShootingAbilityFactory.h"

std::shared_ptr<IAbility> ShootingAbilityFactory::createAbility(){
    return std::make_shared<ShootingAbility>();
}