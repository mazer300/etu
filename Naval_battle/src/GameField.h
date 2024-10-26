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

    bool hasIntersectionShips(Ship& ship, int x, int y);

public:
    GameField(int width, int height);
    GameField(const GameField& other);                  //Копирование
    GameField(GameField&& other) noexcept;              //Перемещение
    GameField& operator=(const GameField& other);       //оператор копирования
    GameField& operator=(GameField&& other) noexcept;   //оператор перемещения
    bool attack(int x, int y);
    void placeShip(Ship& ship, int x, int y, OrientationShip orientationShip);
    bool OpenCell(int x, int y);
    void printField();
    std::vector<std::pair<std::pair<int,int>, Ship>> getShips();
    int getHeight();
    int getWidth();
};

#endif // GAMEFIELD_H