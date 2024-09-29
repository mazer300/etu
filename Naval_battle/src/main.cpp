#include "GameField.h"
#include <iostream>


int main(){

    GameField board(10, 10, 5);
    
    Ship ship1(10,0,0, OrientationShip::Horizontal);
    Ship ship2(5,0,2, OrientationShip::Vertical);
    Ship ship3(1,2,5, OrientationShip::Horizontal);
    Ship ship4(7,3,9, OrientationShip::Horizontal);

    board.PlaceShip(ship2, 0, 2);
    board.PlaceShip(ship1, 0, 0);
    board.PlaceShip(ship3, 2, 5);
    board.PlaceShip(ship4,3,9);

    for(int i=0;i<5;i++){
        board.attack(0,2+i);
        board.attack(0,2+i);
    }

    /*board.attack(0,0);
    board.attack(0,0);
    board.attack(1,0);*/
    board.attack(3,9);
    board.printField();
    return 0;
}