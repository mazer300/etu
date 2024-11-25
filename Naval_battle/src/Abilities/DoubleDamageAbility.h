#ifndef DOUBLEDAMAGEABILITIES_H
#define DOUBLEDAMAGEABILITIES_H

#include "IAbility.h"

class DoubleDamageAbility : public IAbility{
    void apply(InfoHolder& info) override;
};

#endif // DOUBLEDAMAGEABILITIES_H