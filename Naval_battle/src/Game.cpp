#include "Game.h"
#include "Exceptions/InvalidPlacementShipException.h"
#include "Exceptions/OutOfFieldAttackException.h"
#include <iostream>
#include <random>

Game::Game()
    : playerField(10, 10), enemyField(10, 10),
      playerShipManager(10, {4, 3, 3, 2, 2, 2, 1, 1, 1, 1}), enemyShipManager(10, {4, 3, 3, 2, 2, 2, 1, 1, 1, 1}),
      playerInfo(playerField, playerShipManager, 0, 0), enemyInfo(enemyField, enemyShipManager, 0, 0),
      player(playerField, playerShipManager, playerAbilityManager),
      enemy(enemyField, enemyShipManager, enemyAbilityManager),
      gameState(playerField, enemyField, playerShipManager, enemyShipManager, playerAbilityManager, enemyAbilityManager),
      isPlayerTurn(true), isGameOver(false), numberRound(1), flagShooting(0) {}

void Game::startGame() {
    playerField = GameField(10, 10);
    enemyField = GameField(10, 10);
    playerShipManager = ShipManager(10, {4, 3, 3, 2, 2, 2, 1, 1, 1, 1});
    enemyShipManager = ShipManager(10, {4, 3, 3, 2, 2, 2, 1, 1, 1, 1});
    playerAbilityManager = AbilityManager();
    enemyAbilityManager = AbilityManager();

    player.reinitialize(playerField, playerShipManager, playerAbilityManager);
    enemy.reinitialize(enemyField, enemyShipManager, enemyAbilityManager);


    //playerField.placeShip(playerShipManager.getShip(0),0,0,OrientationShip::Horizontal,0);

    autoplaceShips(enemyField,enemyShipManager);

    isPlayerTurn = true;
    isGameOver = false;
    
}

bool Game::placeShips(int indexShip, int x, int y, int orientation){
    OrientationShip orientationShip = OrientationShip::Horizontal;
    if(orientation == 0) orientationShip = OrientationShip::Vertical;
    bool flag = false;
    try{
        flag=playerField.placeShip(playerShipManager.getShip(indexShip), x,y,orientationShip,0);
    }catch(...){

    }
    return flag;
}

void Game::saveGame(const std::string& filename) {
    gameState << filename;
}

void Game::loadGame(const std::string& filename) {
    gameState >> filename;
}

Interaction Game::playerTurn(int x, int y, int optionAttack){
    if (optionAttack==0){
        int result = player.attack(enemyField, x, y, playerInfo.flagDoubleDamage);
        return static_cast<Interaction>(result);
    }else if(optionAttack==1){
        playerInfo.x = x;
        playerInfo.y = y;
        try{
            playerAbilityManager.applyAbility(playerInfo);
        }catch(...){
            int result = player.attack(enemyField, x, y, playerInfo.flagDoubleDamage);
            if (result == 2) {
                playerAbilityManager.addRandomAbility();
            }
            return Interaction::no_ability;
            }
        }
    return Interaction::miss;
}

void Game::enemyTurn(){
    srand(time(0));
    int x = 0, y = 0;
    int result = -1;
    while(result == -1){
        x = rand() % playerField.getWidth();
        y = rand() % playerField.getHeight();
        result = enemy.attack(playerField, x, y, 1);
    }
}

void Game::startRound(){
    if(player.getState() == false){
        std::cout << "Game over.\n";
    }else if(enemy.getState() == false){
        std::cout << "Win!\n";
        numberRound++;
        enemyField = GameField(10, 10);
        enemyShipManager = ShipManager(10, {4, 3, 3, 2, 2, 2, 1, 1, 1, 1});
        autoplaceShips(enemyField,enemyShipManager);
    }
    if(enemy.getState() != false){
        enemyTurn();
    }
}

bool Game::checkGameOver() {
    return !(player.getState() && enemy.getState());
}

void Game::autoplaceShipsPlayer(){
    autoplaceShips(playerField,playerShipManager);
}

void Game::autoplaceShips(GameField& field, ShipManager& shipManager){
    srand(time(0));
    int x = 0, y = 0;
    bool isVertical = 0;
    OrientationShip orientation = OrientationShip::Horizontal;
    for(int i=0;i<shipManager.getShips().size();i++){
        while(true){
            x = (std::rand() % field.getWidth() / 2) * 2;
            y = (std::rand() % field.getHeight());
            isVertical = std::rand() % 2;
            if(isVertical == true) orientation = OrientationShip::Vertical;
            shipManager.getShip(i).setOrientationShip(orientation);
            if(field.hasIntersectionShips(shipManager.getShip(i),x,y,1)){
                try{
                    field.placeShip(shipManager.getShip(i),x,y,orientation,1);
                    break;
                }catch(...){
                }
            }
        }
    }
}

GameField& Game::getPlayerField(){ return playerField; }
GameField& Game::getEnemyField(){ return enemyField; }
int Game::getAbilities(){ return playerAbilityManager.countAbilities(); }
