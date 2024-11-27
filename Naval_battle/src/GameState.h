#ifndef GAMESTATE_H
#define GAMESTATE_H

#include "GameField.h"
#include "ShipManager.h"
#include "AbilityManager.h"
#include "InfoHolder.h"
#include <iostream>
#include <fstream>
#include <string>
#include "json.hpp"

class GameState {
public:
    GameState(GameField& playerField, GameField& enemyField, ShipManager& playerShipManager, ShipManager& enemyShipManager, AbilityManager& playerAbilityManager, AbilityManager& enemyAbilityManager);
    GameField& getPlayerField();
    GameField& getEnemyField();
    AbilityManager& getPlayerAbilityManager();
    AbilityManager& getEnemyAbilityManager();
    ShipManager& getPlayerShipManager();
    ShipManager& getEnemyShipManager();
    void save(const std::string& filename);
    void load(const std::string& filename);

private:
    GameField& playerField;
    GameField& enemyField;
    ShipManager& playerShipManager;
    ShipManager& enemyShipManager;
    AbilityManager& playerAbilityManager;
    AbilityManager& enemyAbilityManager;

    nlohmann::json serializeField(GameField& field);
    nlohmann::json serializeShipManager(ShipManager& manager);
    void deserializeField(const nlohmann::json& field_json, GameField& field, ShipManager& ship_manager);
    void deserializeShipManager(const nlohmann::json& manager_json, ShipManager& manager);
};

#endif // GAMESTATE_H