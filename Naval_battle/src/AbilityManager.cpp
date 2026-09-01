#include "AbilityManager.h"
#include "Exceptions/NoAbilityException.h"
#include <random>
#include <algorithm>
#include <iostream>

AbilityManager::AbilityManager(){
    abilityFactories = {
            std::make_shared<DoubleDamageAbilityFactory>(),
            std::make_shared<ScannerAbilityFactory>(),
            std::make_shared<ShootingAbilityFactory>()
        };

    for(int i = 0; i < abilityFactories.size(); i++){
        abilities.push_back(abilityFactories[i]->createAbility());
    }
    std::random_device rd;
    std::mt19937 g(rd());
    std::shuffle(abilities.begin(), abilities.end(), g);
}

void AbilityManager::applyAbility(InfoHolder& info){
    if(abilities.empty()){
        throw NoAbilityExceptions();
    }
    abilities.back()->apply(info);
    abilities.pop_back();
}

void AbilityManager::addRandomAbility(){
    srand(time(0));
    int index = rand() % abilityFactories.size();
    abilities.insert(abilities.begin(), abilityFactories[index]->createAbility());
}

void AbilityManager::setAbilities(std::vector<int> abil){
    abilities.clear();
    for(auto i : abil){
        abilities.push_back(abilityFactories[i]->createAbility());
    }
}

std::vector<int> AbilityManager::getAbilities(){
    srand(time(0));
    std::vector<int> abil;
    for (int i=0;i<abilities.size();i++) {
        int index = rand() % abilityFactories.size();
        abil.push_back(index);
    }
    return abil;
}

int AbilityManager::countAbilities(){
    return abilities.size();
}