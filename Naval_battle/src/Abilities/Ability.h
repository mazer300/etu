#ifndef ABILITY_H
#define ABILITY_H

#include <string>
#include "GameField.h"

class Ability{
public:
    virtual ~Ability() = default;
    virtual void apply(GameField& field, int x, int y) = 0;
    virtual std::string getName() const = 0;
};

#endif // ABILITY_H