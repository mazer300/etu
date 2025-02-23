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

enum Interaction{
    no_ability=-1,
    destroy_ship=2,
    shoot_ship=1,
    miss=0,
    save_game=3,
    load_game=4,
    empty=-2
};

class Game {
public:
    Game();
    void startGame();
    void saveGame(const std::string& filename);
    void loadGame(const std::string& filename);
    Interaction playerTurn(int x, int y, int optionAttack);
    void enemyTurn();
    void startRound();
    void autoplaceShips(GameField& field, ShipManager& shipManager);
    bool placeShips(int indexShip, int x, int y, int orientation);
    GameField& getPlayerField();
    GameField& getEnemyField();
    bool checkGameOver();
    void autoplaceShipsPlayer();
    int getAbilities();

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
    int numberRound;
    bool flagShooting;

};

#endif // GAME_H