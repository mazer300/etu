#ifndef SHIP_H
#define SHIP_H

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
    std::vector<ShipStateHP> segmentsHP;     // Массив значений для отслеживания состояния каждого сегмента
    int length;                              // Длина корабля
    OrientationShip orietation;              // Положение корабля 

public:
    Ship(int _length);
    void shoot(int segment);
    bool isDestroy();
    void show();
    int getLength();
    std::vector<ShipStateHP> getShipHP();
    ShipStateHP getSegmentHP(int index);
    OrientationShip getOrientationShip();
    void setOrientationShip(OrientationShip orientationShip);
};

#endif // SHIP_H