#include "ShipManager.h"

ShipManager::ShipManager(int numShips, std::vector<int> shipSizes){
    for(int i=0;i<numShips;i++){
        Ship ship(shipSizes[i]);
        ships.push_back(ship);
    }

}

bool ShipManager::allShipIsDetroy(){
    for (Ship &ship : ships){
        if (!ship.isDestroy()){
            return false;
        }
    }
    return true;
}

void ShipManager::addShip(int shipSize, OrientationShip orientationShip){
    Ship ship(shipSize);
    ships.push_back(ship);
}

void ShipManager::removeShip(int index){
    if(index>0 && index<=ships.size()){
        ships.erase(ships.begin()+index);
    }
}

std::vector<Ship> ShipManager::getShips(){ return ships; }
Ship& ShipManager::getShip(int index){ return ships[index]; }