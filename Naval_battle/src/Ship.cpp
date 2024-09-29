#include <iostream>
#include <algorithm>
#include "Ship.h"

//Ship::Ship() : length(0), orietation(OrientationShip::Vertical), segmentsHP({}) {}
// Конструктор
Ship::Ship(int _length, int _x, int _y, OrientationShip _orientation) : length(_length), x(_x), y(_y), orietation(_orientation) {
    segmentsHP.resize(length, ShipStateHP::full);
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

int Ship::getX(){ return x; }
int Ship::getY(){ return y; }
int Ship::getLength(){ return length; }
std::vector<ShipStateHP> Ship::getShipHP(){ return segmentsHP; }
OrientationShip Ship::getOrientationShip(){ return orietation; }