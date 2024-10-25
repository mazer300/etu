#include "ShootingAbility.h"
#include <random>

void ShootingAbility::apply(GameField& field, int x, int y){
    auto ships = field.getShips();
    srand(time(0));
    int index = rand()%ships.size();
    x = ships[index].first.first;
    y = ships[index].first.second;
    int len = ships[index].second.getLength();
    int segmentShip = len;
    int orientation = ships[index].second.getOrientationShip();
    len = rand()%len;
    while(ships[index].second.getSegmentHP(segmentShip) == ShipStateHP::dead){
        segmentShip++;
        if(segmentShip > len){
            segmentShip = 0;
        }
    }
    if(orientation == OrientationShip::Horizontal){
        field.attack(x + segmentShip, y);
    }else{
        field.attack(x, y + segmentShip);
    }
}

std::string ShootingAbility::getName() const{
    return "Shooting";
}