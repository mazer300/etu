#include "DoubleDamageAbilityFactory.h"

std::shared_ptr<IAbility> DoubleDamageAbilityFactory::createAbility(){
    return std::make_shared<DoubleDamageAbility>();
}