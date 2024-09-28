#include "GameField.h"
#include <iostream>


int main(){

    GameField board(10, 10);
    ShipManager manager(5);
    // Example of placing ships
    Ship ship1(3,0,0, OrientationShip::Horizontal);
    Ship ship2(3,2,2, OrientationShip::Vertical);
    Ship ship3(3,2,2, OrientationShip::Vertical);

    board.PlaceShip(ship2, 0, 2);
    board.PlaceShip(ship1, 0, 0);
    board.PlaceShip(ship1, 4, 8);
    board.PlaceShip(ship3, 8, 6);
    board.PlaceShip(ship1, 7, 9);

    board.attack(0,0);
    board.attack(8,8);
    board.attack(9,9);
    board.attack(8,8);
    board.printField();
    return 0;
}