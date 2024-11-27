#include "GameState.h"
#include <fstream>
#include <stdexcept>

GameState::GameState(GameField& playerField, GameField& enemyField, ShipManager& playerShipManager, ShipManager& enemyShipManager, AbilityManager& playerAbilityManager, AbilityManager& enemyAbilityManager)
    : playerField(playerField), enemyField(enemyField), playerShipManager(playerShipManager), enemyShipManager(enemyShipManager), playerAbilityManager(playerAbilityManager), enemyAbilityManager(enemyAbilityManager) {}

GameField& GameState::getPlayerField() { return playerField; }
GameField& GameState::getEnemyField() { return enemyField; }
AbilityManager& GameState::getPlayerAbilityManager() { return playerAbilityManager; }
AbilityManager& GameState::getEnemyAbilityManager() { return enemyAbilityManager; }
ShipManager& GameState::getPlayerShipManager() { return playerShipManager; }
ShipManager& GameState::getEnemyShipManager() { return enemyShipManager; }

void GameState::save(const std::string& filename) {
    std::ofstream file(filename);
    if (!file.is_open()) throw std::runtime_error("Unable to open file for saving: " + filename);

    nlohmann::json game_state_json = {
        {"player", {
            {"field", serializeField(playerField)},
            {"ship_manager", serializeShipManager(playerShipManager)},
            //{"abilities_manager", playerAbilityManager.getAbilities().size()}
        }},
        {"enemy", {
            {"field", serializeField(enemyField)},
            {"ship_manager", serializeShipManager(enemyShipManager)}
        }}
    };

    file << game_state_json.dump(4);
    file.close();
}

void GameState::load(const std::string& filename) {
    std::ifstream file(filename);
    if (!file.is_open()) throw std::runtime_error("Unable to open file for loading: " + filename);

    nlohmann::json game_state_json;
    file >> game_state_json;
    file.close();


    
    deserializeShipManager(game_state_json["player"]["ship_manager"], playerShipManager);
    deserializeField(game_state_json["player"]["field"], playerField, playerShipManager);

    deserializeShipManager(game_state_json["enemy"]["ship_manager"], enemyShipManager);
    deserializeField(game_state_json["enemy"]["field"], enemyField, enemyShipManager);


    for (int i = 0; i < game_state_json["player"]["abilities_manager"]; i++) {
        playerAbilityManager.addRandomAbility();
    }
}

nlohmann::json GameState::serializeField(GameField& field) {
    nlohmann::json field_json;
    field_json["height"] = field.getHeight();
    field_json["width"] = field.getWidth();

    nlohmann::json field_matrix;
    for (int y = 0; y < field.getHeight(); y++) {
        nlohmann::json row;
        for (int x = 0; x < field.getWidth(); x++) {
            bool state = field.OpenCell(x, y);
            if (state != false) {
                row.push_back({
                    {"x", x},
                    {"y", y},
                    {"state", static_cast<int>(state)}
                });
            }
        }
        if (!row.empty()) {
            field_matrix.push_back({
                {"y", y},
                {"cells", row}
            });
        }
    }
    field_json["field_matrix"] = field_matrix;
    return field_json;
}

nlohmann::json GameState::serializeShipManager(ShipManager& manager) {
    nlohmann::json manager_json;
    nlohmann::json ships_json;

    for (size_t i = 0; i < manager.getShips().size(); i++) {
        Ship& ship = manager.getShip(i);
        ships_json.push_back({
            {"length", ship.getLength()},
            {"orientation", static_cast<int>(ship.getOrientationShip())},
            {"segments", ship.getShipHP()}
        });
    }

    manager_json["ships"] = ships_json;
    return manager_json;
}

void GameState::deserializeField(const nlohmann::json& field_json, GameField& field, ShipManager& ship_manager) {
    
    for (const auto& row_data : field_json["field_matrix"]) {
        int y = row_data["y"];

        for (const auto& cell_data : row_data["cells"]) {
            int x = cell_data["x"];
            FieldState state = static_cast<FieldState>(cell_data["state"]);
            field.placeShip(ship_manager.getShip(0), x, y, static_cast<OrientationShip>(state), 1);
        }
    }
}

void GameState::deserializeShipManager(const nlohmann::json& manager_json, ShipManager& manager) {
    const auto& ships_json = manager_json["ships"];
    int number_of_ship = 0;

    for (const auto& ship_data : ships_json) {
        int length = ship_data["length"];
        OrientationShip orientation = static_cast<OrientationShip>(ship_data["orientation"]);
        const auto& segments = ship_data["segments"];

        Ship ship = Ship(length);
        ship.setOrientationShip(orientation);
        for (size_t i = 0; i < segments.size(); i++) {
            ship.setSegmentState(i, static_cast<ShipStateHP>(segments[i]));
        }

        manager.addShip(ship.getLength());
    }
}