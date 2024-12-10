#ifndef PLAYER_H
#define PLAYER_H

#include "GameField.h"
#include "ShipManager.h"
#include "AbilityManager.h"
#include "InfoHolder.h"
#include <iostream>

class Player {
public:
    Player(GameField& field, ShipManager& shipManager, AbilityManager& abilityManager);
    void applyAbility();
    int attack(GameField& enemyField, int x, int y, int flagDoubleDamage);
    bool getState();
    void reinitialize(GameField& field, ShipManager& shipManager, AbilityManager& abilityManager);

private:
    GameField& field;
    ShipManager& shipManager;
    AbilityManager& abilityManager;
    InfoHolder info;
};

#endif // PLAYER_H