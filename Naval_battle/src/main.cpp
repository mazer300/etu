#include "GameField.h"
#include "Exceptions/NoAbilityException.h"
#include "Exceptions/InvalidPlacementShipException.h"
#include "Exceptions/OutOfFieldAttackException.h"
#include "AbilityManager.h"
#include <iostream>


int main(){

    ShipManager shipmanager(4, {4, 3, 2, 1});
    GameField board(10, 10);
    AbilityManager abilityManager;

    InfoHolder info(board,shipmanager,2,0);


    try{
        board.placeShip(shipmanager.getShip(1), 0, 2, OrientationShip::Vertical);
        board.placeShip(shipmanager.getShip(0), 0, 0, OrientationShip::Horizontal);
        board.placeShip(shipmanager.getShip(2), 2, 5, OrientationShip::Horizontal);
        board.placeShip(shipmanager.getShip(3), 9, 9, OrientationShip::Horizontal);
    } catch(const InvalidPlacementShipExceptions& e){
        std::cerr << e.what() << '\n';
    }

    try{
        bool a=board.attack(0, 0, info.flagDoubleDamage);
        if(a) abilityManager.addRandomAbility();
        board.attack(0, 0, info.flagDoubleDamage);
        board.attack(1, 0, info.flagDoubleDamage);
        board.attack(3, 9, info.flagDoubleDamage);
        board.attack(1, 1, info.flagDoubleDamage);
        board.attack(100,10, info.flagDoubleDamage);
    } catch(const OutOfFieldAttackExceptions& e){
        std::cerr << e.what() << '\n';
    }
    abilityManager.applyAbility(info);
    
    board.printField();
    return 0;
}