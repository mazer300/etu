#ifndef ABILITYMANAGER_H
#define ABILITYMANAGER_H

#include "./Abilities/ShootingAbilityFactory.h"
#include "./Abilities/ScannerAbilityFactory.h"
#include "./Abilities/DoubleDamageAbilityFactory.h"
#include "InfoHolder.h"
#include <vector>
#include <memory>

class AbilityManager{
private:
    //GameField& gameField;
    //ShipManager& shipManager;
    std::vector<std::shared_ptr<IAbilityFactory>> abilityFactories;
    std::vector<std::shared_ptr<IAbility>> abilities;
    //std::vector<std::unique_ptr<IAbility>> abilities;
public:
    AbilityManager();
    void applyAbility(InfoHolder& info);
    void addRandomAbility();
};

#endif // ABILITYMANAGER_H