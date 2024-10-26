#include "AbilityManager.h"
#include "Exceptions/NoAbilityException.h"
#include <random>
#include <algorithm>
#include <memory>

AbilityManager::AbilityManager(){
    abilities.push_back(std::make_unique<DoubleDamageAbility>());
    abilities.push_back(std::make_unique<ScannerAbility>());
    abilities.push_back(std::make_unique<ShootingAbility>());
    std::random_device rd;
    std::mt19937 g(rd());
    std::shuffle(abilities.begin(), abilities.end(), g);
}

void AbilityManager::applyAbility(GameField& field, int x, int y){
    if(abilities.size()<=0){
        throw NoAbilityExceptions();
    }
    abilities.back()->apply(field, x, y);
    abilities.pop_back();
}

void AbilityManager::addRandomAbility(){
    srand(time(0));
    switch (rand()%3)
    {
    case 0:
        abilities.insert(abilities.begin(), std::make_unique<DoubleDamageAbility>());
        break;
    case 1:
        abilities.insert(abilities.begin(), std::make_unique<ScannerAbility>());
        break;
    case 2:
        abilities.insert(abilities.begin(), std::make_unique<ShootingAbility>());
        break;
    default:
        break;
    }
}