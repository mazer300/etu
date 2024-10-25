#ifndef SHIPMANAGER_H
#define SHIPMANAGER_H

#include "Ship.h"


class ShipManager{
private:
    std::vector<Ship> ships;  //Корабли

public:
    ShipManager(int numShips, std::vector<int> shipSizes);
    bool allShipIsDetroy();
    void addShip(int shipSize, OrientationShip orientationShip);
    void removeShip(int index);
    std::vector<Ship> getShips();
    Ship& getShip(int index);
};

#endif // SHIPMANAGER_H