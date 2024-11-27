#pragma once

#include <iostream>
#include <fstream>
#include <vector>
#include <map>
#include "json.hpp"
#include "GameField.h"
#include "ShipManager.h"
#include "AbilityManager.h"

class GameSaverLoader {
public:
    GameSaverLoader(GameField* new_player_field, GameField* new_enemy_field, ShipManager* new_player_ship_manager, ShipManager* new_enemy_ship_manager, AbilityManager* new_abilities_manager);
    
    void save(const std::string& filename);
    void load(const std::string& filename);
    
private:
    GameField* player_field;
    GameField* enemy_field;

    ShipManager* player_ship_manager;
    ShipManager* enemy_ship_manager;

    AbilityManager* abilities_manager;

    nlohmann::json serializeField(GameField* field);
    nlohmann::json serializeShipManager(ShipManager* manager);

    void deserializeField(const nlohmann::json& field_json, GameField* field, ShipManager* ship_manager);
    void deserializeShipManager(const nlohmann::json& manager_json, ShipManager* manager);
};