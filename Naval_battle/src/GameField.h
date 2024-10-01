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
    std::vector<std::vector<FieldState>> Battelground; //Поле
    std::vector<std::vector<bool>> IsOpenedCell;       //Статусы клеток поля 0 = закрыто, 1 = открыто
    std::vector<Ship> ships;                           //Корабли
    ShipManager shipManager;                           //Менеджер кораблей

    bool hasIntersectionShips(Ship& ship, int x, int y);

public:
    GameField(int width, int height, int numShips);
    GameField(const GameField& other);                  //Копирование
    GameField(GameField&& other) noexcept;              //Перемещение
    GameField& operator=(const GameField& other);       //оператор копирования
    GameField& operator=(GameField&& other) noexcept;   //оператор перемещения
    void attack(int x, int y);
    void PlaceShip(Ship& ship, int x, int y);
    void printField();
    std::vector<std::vector<FieldState>> getBattelground();
};