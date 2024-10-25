#ifndef ABILITYMANAGER_H
#define ABILITYMANAGER_H

#include "./Abilities/ShootingAbility.h"
#include "./Abilities/ScannerAbility.h"
#include "./Abilities/DoubleDamageAbility.h"
#include <vector>
#include <memory>

class AbilityManager{
private:
    std::vector<std::unique_ptr<Ability>> abilities;
public:
    AbilityManager();
    void applyAbility(GameField& field, int x, int y);
    void addRandomAbility();
};

#endif // ABILITYMANAGER_H