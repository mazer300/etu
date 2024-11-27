#include "GameSaverLoader.h"
#include <stdexcept>

GameSaverLoader::GameSaverLoader(GameField* new_player_field, GameField* new_enemy_field, ShipManager* new_player_ship_manager, ShipManager* new_enemy_ship_manager, AbilityManager* new_abilities_manager)
    : player_field(new_player_field), enemy_field(new_enemy_field), player_ship_manager(new_player_ship_manager), enemy_ship_manager(new_enemy_ship_manager), abilities_manager(new_abilities_manager) {}

void GameSaverLoader::save(const std::string& filename) {
    std::ofstream file(filename);
    if (!file.is_open()) throw std::runtime_error("Unable to open file for saving: " + filename);

    nlohmann::json game_state_json = {
        {"player", {
            {"field", serializeField(player_field)},
            {"ship_manager", serializeShipManager(player_ship_manager)},
            {"abilities_manager", abilities_manager->getAbilities().size()}
        }},
        {"enemy", {
            {"field", serializeField(enemy_field)},
            {"ship_manager", serializeShipManager(enemy_ship_manager)}
        }}
    };

    file << game_state_json.dump(4);
    file.close();
}

void GameSaverLoader::load(const std::string& filename) {
    std::ifstream file(filename);
    if (!file.is_open()) throw std::runtime_error("Unable to open file for loading: " + filename);

    nlohmann::json game_state_json;
    file >> game_state_json;
    file.close();

    player_ship_manager->clear();
    enemy_ship_manager->clear();
    
    deserializeShipManager(game_state_json["player"]["ship_manager"], player_ship_manager);
    deserializeField(game_state_json["player"]["field"], player_field, player_ship_manager);

    deserializeShipManager(game_state_json["enemy"]["ship_manager"], enemy_ship_manager);
    deserializeField(game_state_json["enemy"]["field"], enemy_field, enemy_ship_manager);

    abilities_manager->clear();
    for (int i = 0; i < game_state_json["player"]["abilities_manager"]; i++) {
        abilities_manager->addRandomAbility();
    }
}

nlohmann::json GameSaverLoader::serializeField(GameField* field) {
    nlohmann::json field_json;
    field_json["height"] = field->getHeight();
    field_json["width"] = field->getWidth();

    nlohmann::json field_matrix;
    for (int y = 0; y < field->getHeight(); y++) {
        nlohmann::json row;
        for (int x = 0; x < field->getWidth(); x++) {
            FieldState state = field->OpenCell(x, y);
            if (state != FieldState::Unknown) {
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

nlohmann::json GameSaverLoader::serializeShipManager(ShipManager* manager) {
    nlohmann::json manager_json;
    nlohmann::json ships_json;

    for (size_t i = 0; i < manager->getShips().size(); i++) {
        Ship& ship = manager->getShip(i);
        ships_json.push_back({
            {"length", ship.getLength()},
            {"orientation", static_cast<int>(ship.getOrientationShip())},
            {"segments", ship.getShipHP()}
        });
    }

    manager_json["ships"] = ships_json;
    return manager_json;
}

void GameSaverLoader::deserializeField(const nlohmann::json& field_json, GameField* field, ShipManager* ship_manager) {
    field->clear();
    
    for (const auto& row_data : field_json["field_matrix"]) {
        int y = row_data["y"];

        for (const auto& cell_data : row_data["cells"]) {
            int x = cell_data["x"];
            FieldState state = static_cast<FieldState>(cell_data["state"]);
            field->placeShip(ship_manager->getShip(0), x, y, static_cast<OrientationShip>(state), 1);
        }
    }
}

void GameSaverLoader::deserializeShipManager(const nlohmann::json& manager_json, ShipManager* manager) {
    const auto& ships_json = manager_json["ships"];
    int number_of_ship = 0;

    for (const auto& ship_data : ships_json) {
        int length = ship_data["length"];
        OrientationShip orientation = static_cast<OrientationShip>(ship_data["orientation"]);
        const auto& segments = ship_data["segments"];

        Ship* ship = new Ship(length);
        ship->setOrientationShip(orientation);
        for (size_t i = 0; i < segments.size(); i++) {
            ship->setSegmentState(i, static_cast<ShipStateHP>(segments[i]));
        }

        manager->addShip(ship);
    }
}