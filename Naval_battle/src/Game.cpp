#include "Game.h"
#include "Exceptions/InvalidPlacementShipException.h"
#include "Exceptions/OutOfFieldAttackException.h"
#include <iostream>

Game::Game()
    : playerField(10, 10), enemyField(10, 10),
      playerShipManager(10, {4, 3, 3, 2, 2, 2, 1, 1, 1, 1}), enemyShipManager(10, {4, 3, 3, 2, 2, 2, 1, 1, 1, 1}),
      playerInfo(playerField, playerShipManager, 0, 0), enemyInfo(enemyField, enemyShipManager, 0, 0),
      player(playerField, playerShipManager, playerAbilityManager),
      enemy(enemyField, enemyShipManager, enemyAbilityManager),
      gameState(playerField, enemyField, playerShipManager, enemyShipManager, playerAbilityManager, enemyAbilityManager),
      isPlayerTurn(true), isGameOver(false) {}

void Game::startGame() {
    playerField = GameField(10, 10);
    enemyField = GameField(10, 10);
    playerShipManager = ShipManager(10, {4, 3, 3, 2, 2, 2, 1, 1, 1, 1});
    enemyShipManager = ShipManager(10, {4, 3, 3, 2, 2, 2, 1, 1, 1, 1});
    playerAbilityManager = AbilityManager();
    enemyAbilityManager = AbilityManager();

    player.reinitialize(playerField, playerShipManager, playerAbilityManager);
    enemy.reinitialize(enemyField, enemyShipManager, enemyAbilityManager);


    playerField.placeShip(playerShipManager.getShip(0),0,0,OrientationShip::Horizontal,0);
    placeShips();

    generateEnemyField();

    saveGame("gamedata.txt");
    //loadGame("gamedata.txt");

    isPlayerTurn = true;
    isGameOver = false;
    
    startRound();
}

void Game::placeShips(){
    int x,y;
    int a;
    int indexShip=0;
    OrientationShip orientation = OrientationShip::Horizontal;
    while(1){
        std::cout << "Поле игрока\n";
        playerField.printField(false);
        
        std::cout << "Введите параметры корабля" << ", длина корабля " << playerShipManager.getShip(indexShip).getLength() << "\n";
        std::cin >> x;
        if(x == 2) break;
        std::cin >> y >> a;
        if(a == 0) orientation = OrientationShip::Vertical;

        playerField.placeShip(playerShipManager.getShip(indexShip), x,y,orientation,0);    
        indexShip++;
    }
}

void Game::saveGame(const std::string& filename) {
    gameState.save("game_save.txt");
}

void Game::loadGame(const std::string& filename) {
    gameState.load("game_save.txt");
}

void Game::playerTurn(){
    int x,y;
    int key;
    while(1){
        std::cout << "Поле игрока\n";
        playerField.printField(false);
        std::cout << "\n\nПоле врага\n";
        enemyField.printField(false);
        std::cout << "Введите индекс команды\n1 - атака  2 - использовать способность";
        std::cin >> key;
        if(key == 1){
            std::cout << "Введите координаты атаки (x y): ";
            std::cin >> x >> y;
        }else if(key == 2){
            std::cout << "Введите координаты атаки (x y): ";
            std::cin >> x >> y;
            playerInfo.x = x;
            playerInfo.y = y;
            playerAbilityManager.applyAbility(playerInfo);
        }

        int result = player.attack(enemyField, x, y);
        if (result == 2) {
            std::cout << "Корабль уничтожен!\n";
            playerAbilityManager.addRandomAbility();
        } else if (result == 1) {
            std::cout << "Попадание!\n";
        } else {
            std::cout << "Промах!\n";
        }
    }
}

void Game::enemyTurn(){
    int x = 0, y = 0;
    int result = 0;
    while(result == 0){
        x = rand() % playerField.getWidth();
        y = rand() % playerField.getHeight();
        result = enemy.attack(playerField, x, y);
    }
}
void Game::startRound(){
    if(player.getState() == false){
        std::cout << "Game over.\n";
    }else if(enemy.getState() == false){
        std::cout << "Win!\n";
    }
    playerTurn();
    if(enemy.getState() != false){
        enemyTurn();
    }
    //startGame();
    startRound();
}

bool Game::checkGameOver(GameField& field, ShipManager& shipManager) {
    return shipManager.allShipIsDetroy();
}

void Game::generateEnemyField(){
    int x = 0, y = 0;
    bool isVertical = 0;
    OrientationShip orientation = OrientationShip::Horizontal;
    for(int i=0;i<enemyShipManager.getShips().size();i++){
        while(true){
            x = (std::rand() % enemyField.getWidth() / 2) * 2;
            y = (std::rand() % enemyField.getHeight());
            isVertical = std::rand() % 2;
            if(isVertical == true) orientation = OrientationShip::Vertical;
            enemyShipManager.getShip(i).setOrientationShip(orientation);
            if(enemyField.hasIntersectionShips(enemyShipManager.getShip(i),x,y,1)){
                try{
                    enemyField.placeShip(enemyShipManager.getShip(i),x,y,orientation,1);
                    break;
                }catch(...){
                }
            }
        }
    }
}