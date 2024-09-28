#include "GameField.h"
#include <iostream>


bool GameField::hasIntersectionShips(Ship& ship, int x, int y){
    if(x < 0 || y < 0 || x > width || y > height){
        return false;
    }

    int length=ship.getLength();
    OrientationShip orientationShip=ship.getOrientationShip();
    if(orientationShip==OrientationShip::Horizontal){
        if(x+length>width) return false;

        int up = 0;
        if(x>0) up=-1;
        int down = length-1;
        if(x+length<width) down=length;

        for(int i=up;i<=down;i++){
            if(Battelground[y][x+i] != FieldState::Unknown || ((y+1)<height && Battelground[y+1][x+i] != FieldState::Unknown) || ((y-1)>0 && Battelground[y-1][x+i] != FieldState::Unknown)){
                return false;
            }
        }
    }else if(orientationShip==OrientationShip::Vertical){
        if(y+length>height) return false;

        int up = 0;
        if(y>0) up=-1;
        int down = length-1;
        if(y+length<height) down=length;

        for(int i=up; i<=down; i++){
            if(Battelground[y+i][x] != FieldState::Unknown || (Battelground[y+i][x+1] != FieldState::Unknown && (x+1) < width) || Battelground[y+i][x-1] != FieldState::Unknown){
                return false;
            }
        }
    }
    return true;
}

GameField::GameField(int width, int height) : width(width), height(height), Battelground(height, std::vector<FieldState>(width, FieldState::Unknown)), shipManager(10) {}

GameField::GameField(const GameField& other) : width(other.width), height(other.height), shipManager(other.shipManager), Battelground(other.Battelground) {}

GameField::GameField(GameField&& other) noexcept : width(other.width), height(other.height), shipManager(std::move(other.shipManager)), Battelground(std::move(other.Battelground)) {}

GameField& GameField::operator=(const GameField& other) {
    if (this == &other) {
        return *this;
    }
    width = other.width;
    height = other.height;
    shipManager = other.shipManager;
    for(int i = 0; i < height; i++){
        for(int j = 0; j < width; j++){
            Battelground[i][j] = other.Battelground[i][j];
        }
    }
    return *this;
}

GameField& GameField::operator=(GameField&& other) noexcept {
    if (this == &other) {
        return *this;
    }
    width = other.width;
    height = other.height;
    shipManager = std::move(other.shipManager);
    Battelground = std::move(other.Battelground);
    return *this;
}

void GameField::attack(int x, int y){
    if (x >= 0 && x < width && y >= 0 && y < height) {
        if(Battelground[x][y] == FieldState::Boat){

            // Find the ship and update its state
            // This is a simplified example, in a real game you would need to track which ship is at which cell
            // For simplicity, assume the first ship is hit

            shipManager.updateShipState(0, 0);
            Battelground[x][y] = FieldState::LowBoat;
        }else if(Battelground[x][y] == FieldState::LowBoat){

            shipManager.updateShipState(0, 0);
            Battelground[x][y] = FieldState::DeadBoat;
        }else if (Battelground[x][y] == FieldState::Unknown){
            Battelground[x][y] = FieldState::Empty;
        }
    }
}

void GameField::PlaceShip(Ship& ship, int x, int y){
    if (hasIntersectionShips(ship, x, y)) {
        int length = ship.getLength();
        OrientationShip orientation = ship.getOrientationShip();

        for (int i = 0; i < length; ++i) {
            if (orientation == OrientationShip::Horizontal) {
                Battelground[y][x + i] = FieldState::Boat;
            } else {
                Battelground[y + i][x] = FieldState::Boat;
            }
        }
        ships.push_back(ship);
        shipManager.addShip(ship);
    }
}

void GameField::printField(){
    for(auto row : Battelground){
        for(auto cell : row){
            switch(cell)
            {
            case Unknown:
                std::cout << "⬜";
                break;
            case Empty:
                std::cout << "⬛";
                break;
            case Boat:
                std::cout << "🟥";
                break;
            case LowBoat:
                std::cout << "🔥";
                break;
            case DeadBoat:
                std::cout << "❌";
                break;
            default:
                break;
            }
        }
        std::cout << '\n';
    }
}

std::vector<std::vector<FieldState>> GameField::getBattelground(){
    return Battelground;
}