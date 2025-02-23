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

void GameState::operator <<(const std::string& filename) {
    std::ofstream ofs(filename);
    if (!ofs.is_open()) throw std::runtime_error("Unable to open file for saving: " + filename);

    nlohmann::json game_state_json = {
        {"player", {
            {"field", serializeField(playerField)},
            {"ship_manager", serializeShipManager(playerShipManager)},
            {"abilities_manager", playerAbilityManager.getAbilities()}
        }},
        {"enemy", {
            {"field", serializeField(enemyField)},
            {"ship_manager", serializeShipManager(enemyShipManager)}
        }}
    };

    ofs << game_state_json.dump(4);
    ofs.close();
}

void GameState::operator >>(const std::string& filename) {
    std::ifstream ifs(filename);
    if (!ifs.is_open()) throw std::runtime_error("Unable to open file for loading: " + filename);

    nlohmann::json game_state_json;
    ifs >> game_state_json;
    ifs.close();

    // Создаем новые игровые поля
    playerField = GameField(10, 10);
    enemyField = GameField(10, 10);

    // Десериализация кораблей игрока
    deserializeShipManager(game_state_json["player"]["ship_manager"], playerShipManager);
    deserializeField(game_state_json["player"]["field"], playerField, playerShipManager);

    // Десериализация кораблей противника
    deserializeShipManager(game_state_json["enemy"]["ship_manager"], enemyShipManager);
    deserializeField(game_state_json["enemy"]["field"], enemyField, enemyShipManager);

    // Восстановление способностей игрока
    playerAbilityManager.setAbilities(game_state_json["player"]["abilities_manager"]);
}

nlohmann::json GameState::serializeField(GameField& field) {
    nlohmann::json field_json;
    field_json["height"] = field.getHeight();
    field_json["width"] = field.getWidth();

    nlohmann::json field_matrix;
    for (int y = 0; y < field.getHeight(); y++) {
        nlohmann::json row;
        for (int x = 0; x < field.getWidth(); x++) {
            FieldState state = field.getState(x, y);
            row.push_back({
                {"x", x},
                {"y", y},
                {"state", static_cast<int>(state)}
            });
        }
        field_matrix.push_back(row);
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
        for (const auto& cell_data : row_data) {
            int x = cell_data["x"];
            int y = cell_data["y"];
            FieldState state = static_cast<FieldState>(cell_data["state"]);
            field.setState(x, y, state);
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