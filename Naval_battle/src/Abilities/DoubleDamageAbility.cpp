#include "DoubleDamageAbility.h"

void DoubleDamageAbility::apply(GameField& field, int x, int y){
    field.attack(x,y);
    field.attack(x,y);
}

std::string DoubleDamageAbility::getName() const{
    return "DoubleDamage";
}