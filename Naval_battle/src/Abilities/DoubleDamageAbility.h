#ifndef DOUBLEDAMAGEABILITIES_H
#define DOUBLEDAMAGEABILITIES_H

#include "Ability.h"

class DoubleDamageAbility : public Ability{
    void apply(GameField& field, int x, int y) override;
    std::string getName() const override;
};

#endif // DOUBLEDAMAGEABILITIES_H