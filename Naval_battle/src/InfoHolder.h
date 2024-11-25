#ifndef INFOHOLDER_H
#define INFOHOLDER_H

#include "GameField.h"
#include "ShipManager.h"

class InfoHolder{
public:
    GameField& field;
    ShipManager& shipManager;
    int x;
    int y;
    int flagDoubleDamage;
    int flagScanner;

    InfoHolder(GameField& _field, ShipManager& _shipManager, int _x, int _y);
};

#endif // INFOHOLDER_H