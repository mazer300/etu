#include <iostream>
#include <algorithm>
#include "Ship.h"


Ship::Ship(int _length){
    if(_length>0 && _length<=4){
        length=_length;
        segmentsHP.resize(length, ShipStateHP::full);
    }
}

void Ship::shoot(int segment){
    if(segment <= segmentsHP.size() && segment >= 0){
        if(segmentsHP[segment] != ShipStateHP::dead){
            if(segmentsHP[segment] == ShipStateHP::full){
                segmentsHP[segment] = ShipStateHP::low;
            }else{
                segmentsHP[segment] = ShipStateHP::dead;
            }
        }
    }
}

bool Ship::isDestroy(){
    return std::all_of(segmentsHP.begin(), segmentsHP.end(), [](ShipStateHP state){ return state==ShipStateHP::dead; });
}

void Ship::show(){
    std::cout << "Длина: " << length << '\n';
    std::cout << "Горизонтальность: " << orietation << '\n';
    std::cout << "Количество ХП: ";
    for(int i = 0; i < segmentsHP.size(); i++){
        std::cout << segmentsHP[i];
    }
    std::cout << '\n';
}


int Ship::getLength(){ return length; }
ShipStateHP Ship::getSegmentHP(int index){ return segmentsHP[index]; }
std::vector<ShipStateHP> Ship::getShipHP(){ return segmentsHP; }
OrientationShip Ship::getOrientationShip(){ return orietation; }
void Ship::setOrientationShip(OrientationShip orientationShip){ orietation = orientationShip; }

void Ship::setSegmentState(int index, ShipStateHP state) {
    if (index >= 0 && index < segmentsHP.size()) {
        segmentsHP[index] = state;
    }
}