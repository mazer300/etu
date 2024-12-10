#include "Player.h"
#include "Exceptions/NoAbilityException.h"
#include "Exceptions/OutOfFieldAttackException.h"
#include <iostream>

Player::Player(GameField& field, ShipManager& shipManager, AbilityManager& abilityManager)
    : field(field), shipManager(shipManager), abilityManager(abilityManager), info(field, shipManager, 1, 0) {}

void Player::reinitialize(GameField& _field, ShipManager& _shipManager, AbilityManager& _abilityManager){
    field = _field;
    shipManager = _shipManager;
    abilityManager = _abilityManager;
    info.field = field;
    info.shipManager = shipManager;
}

void Player::applyAbility() {
    try {
        abilityManager.applyAbility(info);
    } catch (const NoAbilityExceptions& e) {
        std::cerr << e.what() << std::endl;
    }
}

int Player::attack(GameField& enemyField, int x, int y, int flagDoubleDamage) {
    try {
        int result = enemyField.attack(x, y, flagDoubleDamage);
        if(result == 2) abilityManager.addRandomAbility();
        return result;
    } catch (const OutOfFieldAttackExceptions& e) {
        std::cerr << e.what() << std::endl;
    }
    return -1;
}

bool Player::getState(){
    for(int i=0; i<field.getHeight();i++){
        for(int j=0; j<field.getWidth();j++){
            if(field.OpenCell(j, i)){
                return true;
            }
        }
    }
    return false;
}