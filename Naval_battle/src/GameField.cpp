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

GameField::GameField(int width, int height, int numShips) : width(width), height(height), Battelground(height, std::vector<FieldState>(width, FieldState::Unknown)), IsOpenedCell(height, std::vector<bool>(width, 0)), shipManager(numShips) {}

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
        IsOpenedCell[y][x] = 1;
        if(Battelground[y][x] == FieldState::Boat || Battelground[y][x] == FieldState::LowBoat){
            
            for(auto& ship : ships){
                if(ship.getOrientationShip()==Horizontal){
                    if(y==ship.getY() && x>=ship.getX() && x<ship.getX()+ship.getLength()){
                        ship.shoot(x-ship.getX());
                        if(Battelground[y][x] == FieldState::Boat){
                            Battelground[y][x] = FieldState::LowBoat;
                        }else{
                            Battelground[y][x] = FieldState::DeadBoat;
                        }
                        if(ship.isDestroy()){
                            std::cout << "Корабль уничтожен!" << std::endl;

                        }
                    }
                }else{
                    if(x==ship.getX() && y>=ship.getY() && y<ship.getY()+ship.getLength()){
                        ship.shoot(y-ship.getY());
                        if(Battelground[y][x] == FieldState::Boat){
                            Battelground[y][x] = FieldState::LowBoat;
                        }else{
                            Battelground[y][x] = FieldState::DeadBoat;
                        }
                        if(ship.isDestroy()){
                            std::cout << "Корабль уничтожен!" << std::endl;
                        }

                    }
                }
            }
 
        }else if (Battelground[y][x] == FieldState::Unknown){
            Battelground[y][x] = FieldState::Empty;
        }
    }
}

void GameField::PlaceShip(Ship& ship, int x, int y){
    if (hasIntersectionShips(ship, x, y)) {
        ship.setX(x);
        ship.setY(y);
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
    int flagIsOpenCell = 1;       //0 = поле открыто, 1 = поле закрыто
    for(int i = 0; i < height; i++){
        for(int j = 0; j < width; j++){
            if(flagIsOpenCell == 0 || (flagIsOpenCell == 1 && IsOpenedCell[i][j] == 1)){
                switch(Battelground[i][j]){
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
            }else if(flagIsOpenCell == 1 && IsOpenedCell[i][j] == 0){
                std::cout << "⬜";
            }
        }
        std::cout << '\n';
    }
}

std::vector<std::vector<FieldState>> GameField::getBattelground(){
    return Battelground;
}