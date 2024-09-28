#include <vector>

enum OrientationShip{
    Vertical,
    Horizontal
};

enum ShipStateHP{
    dead,
    low,
    full
};

class Ship{
private:
    int x;                                   // Координаты корабля
    int y;
    std::vector<ShipStateHP> segmentsHP;     // Массив значений для отслеживания состояния каждого сегмента
    int length;                              // Длина корабля
    OrientationShip orietation;              // Положение корабля 

public:
    //Ship();
    // Конструктор
    Ship(int _length, int _x, int _y, OrientationShip _orientation);
    void shoot(int segment);
    bool isDestroy();
    void show();
    int getX();
    int getY();
    int getLength();
    std::vector<ShipStateHP> getShipHP();
    OrientationShip getOrientationShip();
};