#include "ShootingAbility.h"
#include <random>
#include <iostream>

void ShootingAbility::apply(InfoHolder& info){
    GameField &field = info.field;
    int x = info.x;
    int y = info.y;

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
        field.attack(x + segmentShip, y, info.flagDoubleDamage);
    }else{
        field.attack(x, y + segmentShip, info.flagDoubleDamage);
    }
}
