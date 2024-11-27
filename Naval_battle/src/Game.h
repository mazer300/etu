#ifndef GAME_H
#define GAME_H

#include "GameField.h"
#include "ShipManager.h"
#include "AbilityManager.h"
#include "InfoHolder.h"
#include "GameState.h"
#include "Player.h"
#include <iostream>
#include <string>

class Game {
public:
    Game();
    void startGame();
    void saveGame(const std::string& filename);
    void loadGame(const std::string& filename);
    void playerTurn();
    void enemyTurn();
    void startRound();
    void generateEnemyField();
    void placeShips();

private:
    GameField playerField;
    GameField enemyField;
    ShipManager playerShipManager;
    ShipManager enemyShipManager;
    AbilityManager playerAbilityManager;
    AbilityManager enemyAbilityManager;
    InfoHolder playerInfo;
    InfoHolder enemyInfo;
    Player player;
    Player enemy;
    GameState gameState;
    bool isPlayerTurn;
    bool isGameOver;

    bool checkGameOver(GameField& field, ShipManager& shipManager);
};

#endif // GAME_H