#include "GameField.h"
#include "Exceptions/OutOfFieldAttackException.h"
#include "Exceptions/InvalidPlacementShipException.h"
#include <iostream>
#include <functional>


bool GameField::hasIntersectionShips(Ship& ship, int x, int y){
    if(x < 0 || y < 0 || x >= width || y >= height){
        throw InvalidPlacementShipExceptions();
        return false;
    }

    int length=ship.getLength();
    OrientationShip orientationShip=ship.getOrientationShip();
    if(orientationShip==OrientationShip::Horizontal){
        if(x+length>width){
            throw InvalidPlacementShipExceptions();
            return false;
        }

        int up = 0;
        if(x>0) up=-1;
        int down = length-1;
        if(x+length<width) down=length;

        for(int i=up;i<=down;i++){
            if(Battleground[y][x+i].second != FieldState::Unknown || ((y+1)<height && Battleground[y+1][x+i].second != FieldState::Unknown) || ((y)>0 && Battleground[y-1][x+i].second != FieldState::Unknown)){
                throw InvalidPlacementShipExceptions();
                return false;
            }
        }
    }else if(orientationShip==OrientationShip::Vertical){
        if(y+length>height){
            throw InvalidPlacementShipExceptions();
            return false;
        }

        int up = 0;
        if(y>0) up=-1;
        int down = length-1;
        if(y+length<height) down=length;

        for(int i=up; i<=down; i++){
            if(Battleground[y+i][x].second != FieldState::Unknown || (Battleground[y+i][x+1].second != FieldState::Unknown && (x+1) < width) || Battleground[y+i][x-1].second != FieldState::Unknown){
                throw InvalidPlacementShipExceptions();
                return false;
            }
        }
    }
    return true;
}

GameField::GameField(int width, int height) : width(width), height(height), Battleground(height, std::vector<std::pair<bool, FieldState>>(width, std::make_pair(false, FieldState::Unknown))) {}

GameField::GameField(const GameField& other) : width(other.width), height(other.height), Battleground(other.Battleground) {}

GameField::GameField(GameField&& other) noexcept : width(other.width), height(other.height), Battleground(std::move(other.Battleground)) {}

GameField& GameField::operator=(const GameField& other) {
    if (this == &other) {
        return *this;
    }
    width = other.width;
    height = other.height;
    for(int i = 0; i < height; i++){
        for(int j = 0; j < width; j++){
            Battleground[i][j] = other.Battleground[i][j];
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
    Battleground = std::move(other.Battleground);
    return *this;
}

bool GameField::attack(int x, int y){
    if (x < 0 || y < 0 || x >= width || y >= height) {
        throw OutOfFieldAttackExceptions();
    }

    Battleground[y][x].first = true;
    for (int i = 0; i < ships.size(); i++) {
        int len = ships[i].second.getLength();
        int startX = ships[i].first.first;
        int startY = ships[i].first.second;

        if (y == startY && x >= startX && x < startX + len) {
            Ship& ship = ships[i].second;
            int indexSegment = x - startX;

            if (Battleground[y][x].second == FieldState::Boat) {
                ship.shoot(indexSegment);
                Battleground[y][x].second = FieldState::LowBoat;
            } else if (Battleground[y][x].second == FieldState::LowBoat) {
                ship.shoot(indexSegment);
                Battleground[y][x].second = FieldState::DeadBoat;
            }

            if (ship.isDestroy()) {
                return true;
            }
            return false;
        }

        if (x == startX && y >= startY && y < startY + len) {
            Ship& ship = ships[i].second;
            int indexSegment = y - startY;

            if (Battleground[y][x].second == FieldState::Boat) {
                ship.shoot(indexSegment);
                Battleground[y][x].second = FieldState::LowBoat;
            } else if (Battleground[y][x].second == FieldState::LowBoat) {
                ship.shoot(indexSegment);
                Battleground[y][x].second = FieldState::DeadBoat;
            }

            if (ship.isDestroy()) {
                ships.erase(ships.begin()+i);
                return true;
            }
            return false;
        }
    }

    if (Battleground[y][x].second == FieldState::Unknown) {
        Battleground[y][x].second = FieldState::Empty;
    }

    return false;
}

void GameField::placeShip(Ship& ship, int x, int y, OrientationShip orientationShip){
    ship.setOrientationShip(orientationShip);
    if (hasIntersectionShips(ship, x, y)) {
        int length = ship.getLength();
        for (int i = 0; i < length; ++i) {
            if (orientationShip == OrientationShip::Horizontal) {
                Battleground[y][x + i].second = FieldState::Boat;
            } else {
                Battleground[y + i][x].second = FieldState::Boat;
            }
        }
    }
    ships.push_back(std::make_pair(std::make_pair(x,y), ship));
}

bool GameField::OpenCell(int x, int y){
    //Battleground[y][x].first = true;
    if(Battleground[y][x].second == FieldState::Boat || Battleground[y][x].second == FieldState::LowBoat) return true;
    return false;
}

void GameField::printField(){
    bool flagOpen = 0;     // 0 = Закрытое поле, 1 = Открытое поле
    for(int i = 0; i < height; i++){
        for(int j = 0; j < width; j++){
            if(Battleground[i][j].first || flagOpen){
                switch(Battleground[i][j].second){
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
            }else{
                std::cout << "⬜";
            }
        }
        std::cout << '\n';
    }
}

std::vector<std::pair<std::pair<int,int>, Ship>> GameField::getShips(){
    return ships;
}

int GameField::getHeight(){ return height; }
int GameField::getWidth(){ return width; }
