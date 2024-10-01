#include "Ship.h"


class ShipManager{
private:
    std::vector<Ship> ships;  //Корабли

public:
    ShipManager(int numShips);
    bool allShipIsDetroy();
    void addShip(Ship& ship);
    std::vector<Ship> getShips();
};