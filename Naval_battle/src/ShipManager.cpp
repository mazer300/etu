#include "ShipManager.h"


ShipManager::ShipManager(int numShips){
    ships.reserve(numShips);
}

bool ShipManager::allShipIsDetroy(){
    for(Ship& ship : ships){
        if(!ship.isDestroy()){
            return false;
        }
    }
    return true;
}

void ShipManager::addShip(Ship& ship){
    ships.push_back(ship);
}

std::vector<Ship> ShipManager::getShips(){
    return ships;
}