#include "InfoHolder.h"

InfoHolder::InfoHolder(GameField& _field, ShipManager& _shipManager, int _x, int _y) : field(_field), shipManager(_shipManager), x(_x), y(_y), flagDoubleDamage(1), flagScanner(1) { }
