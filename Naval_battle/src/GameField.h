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
    int height;
    int width;
    std::vector<std::vector<FieldState>> Battelground;
    std::vector<Ship> ships;
    ShipManager shipManager;

    bool hasIntersectionShips(Ship& ship, int x, int y);

public:
    GameField(int width, int height);
    GameField(const GameField& other);                //Копирование
    GameField(GameField&& other) noexcept;            //Перемещение
    GameField& operator=(const GameField& other);     //оператор копирования
    GameField& operator=(GameField&& other) noexcept; //оператор перемещения
    void attack(int x, int y);
    void PlaceShip(Ship& ship, int x, int y);
    void printField();
    std::vector<std::vector<FieldState>> getBattelground();
};
