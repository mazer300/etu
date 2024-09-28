#include "Ship.h"

class ShipManager{
private:
    std::vector<Ship> ships;

public:
    ShipManager(int numShips);
    bool allShipIsDetroy();
    void updateShipState(int shipIndex, int segmentIndex);
    void addShip(Ship& ship);
    std::vector<Ship> getShips();
};