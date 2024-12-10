#ifndef GAMEFIELD_H
#define GAMEFIELD_H

#include <functional>
#include <vector>
#include "ShipManager.h"


enum FieldState{
    Unknown,
    Empty,
    Boat,
    LowBoat,
    DeadBoat
};


class GameField{
private:
    int height;                                        //Высота поля
    int width;                                         //Ширина поля
    std::vector<std::vector<std::pair<bool, FieldState>>> Battleground; //Поле
    //std::vector<Ship> ships;                         //Корабли
    std::vector<std::pair<std::pair<int,int>, Ship>> ships;
public:

    bool hasIntersectionShips(Ship& ship, int x, int y, int flagBot);
    GameField(int width, int height);
    GameField(const GameField& other);                  //Копирование
    GameField(GameField&& other) noexcept;              //Перемещение
    GameField& operator=(const GameField& other);       //оператор копирования
    GameField& operator=(GameField&& other) noexcept;   //оператор перемещения
    int attack(int x, int y, int damage);
    bool placeShip(Ship& ship, int x, int y, OrientationShip orientationShip, int flagBot);
    bool OpenCell(int x, int y);
    void printField(bool flagOpen);
    std::vector<std::pair<std::pair<int,int>, Ship>> getShips();
    int getHeight();
    int getWidth();
    FieldState getState(int x, int y);
    void setState(int x, int y, FieldState state);
};

#endif // GAMEFIELD_H